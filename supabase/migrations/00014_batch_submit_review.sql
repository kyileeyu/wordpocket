-- ============================================
-- Batch submit reviews: 세션 종료 시 1회 호출로 모든 리뷰 제출
-- submit_review와 동일한 SM-2 로직을 순서대로 루프 실행
-- ============================================

CREATE OR REPLACE FUNCTION submit_reviews_batch(
  p_reviews JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_settings   RECORD;
  v_state      RECORD;
  v_review     JSONB;
  v_card_id    UUID;
  v_rating     TEXT;
  v_duration   INTEGER;
  v_new_status TEXT;
  v_new_ef     REAL;
  v_new_interval INTEGER;
  v_new_due    TIMESTAMPTZ;
  v_new_step   INTEGER;
  v_new_lapse  INTEGER;
  v_fuzz       INTEGER;
  v_processed  INTEGER := 0;
BEGIN
  -- user_settings 1회 조회
  SELECT * INTO v_settings
  FROM user_settings
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id)
    VALUES (v_user_id)
    RETURNING * INTO v_settings;
  END IF;

  -- JSONB 배열 순서대로 처리
  FOR v_review IN SELECT * FROM jsonb_array_elements(p_reviews)
  LOOP
    v_card_id  := (v_review->>'card_id')::UUID;
    v_rating   := v_review->>'rating';
    v_duration := COALESCE((v_review->>'review_duration')::INTEGER, 0);

    -- 최신 card_state 조회 (이전 루프에서 업데이트된 값 반영)
    SELECT * INTO v_state
    FROM card_states
    WHERE card_id = v_card_id AND user_id = v_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Card state not found for card_id: %', v_card_id;
    END IF;

    v_new_ef    := v_state.ease_factor;
    v_new_step  := v_state.step_index;
    v_new_lapse := v_state.lapse_count;

    IF v_state.status IN ('new', 'learning') THEN
      CASE v_rating
        WHEN 'again' THEN
          v_new_status   := 'learning';
          v_new_step     := 0;
          v_new_interval := 0;
          v_new_due      := now() + (v_settings.learning_steps[1] * INTERVAL '1 minute');

        WHEN 'hard' THEN
          v_new_status   := 'learning';
          v_new_interval := 0;
          v_new_due      := now() + (v_settings.learning_steps[v_state.step_index + 1] * INTERVAL '1 minute');

        WHEN 'good' THEN
          IF v_state.step_index >= array_length(v_settings.learning_steps, 1) - 1 THEN
            v_new_status   := 'review';
            v_new_interval := v_settings.graduating_interval;
            v_new_due      := now() + (v_settings.graduating_interval * INTERVAL '1 day');
          ELSE
            v_new_status   := 'learning';
            v_new_step     := v_state.step_index + 1;
            v_new_interval := 0;
            v_new_due      := now() + (v_settings.learning_steps[v_new_step + 1] * INTERVAL '1 minute');
          END IF;

        WHEN 'easy' THEN
          v_new_status   := 'review';
          v_new_ef       := GREATEST(1.3, v_state.ease_factor + 0.15);
          v_new_interval := v_settings.easy_interval;
          v_new_due      := now() + (v_settings.easy_interval * INTERVAL '1 day');

        ELSE
          RAISE EXCEPTION 'Invalid rating: %', v_rating;
      END CASE;

    ELSIF v_state.status = 'review' THEN
      CASE v_rating
        WHEN 'again' THEN
          v_new_lapse  := v_state.lapse_count + 1;
          v_new_ef     := GREATEST(1.3, v_state.ease_factor - 0.2);
          v_new_interval := 1;
          v_new_step   := 0;
          IF v_new_lapse >= v_settings.leech_threshold THEN
            v_new_status := 'suspended';
            v_new_due    := now();
          ELSE
            v_new_status := 'learning';
            v_new_due    := now() + (v_settings.learning_steps[1] * INTERVAL '1 minute');
          END IF;

        WHEN 'hard' THEN
          v_new_status   := 'review';
          v_new_ef       := GREATEST(1.3, v_state.ease_factor - 0.15);
          v_new_interval := LEAST(
            v_settings.max_interval,
            GREATEST(1, round(v_state.interval * 1.2)::INTEGER)
          );
          v_new_due      := now() + (v_new_interval * INTERVAL '1 day');

        WHEN 'good' THEN
          v_new_status   := 'review';
          v_new_interval := LEAST(
            v_settings.max_interval,
            GREATEST(1, round(v_state.interval * v_state.ease_factor)::INTEGER)
          );
          v_new_due      := now() + (v_new_interval * INTERVAL '1 day');

        WHEN 'easy' THEN
          v_new_status   := 'review';
          v_new_ef       := v_state.ease_factor + 0.15;
          v_new_interval := LEAST(
            v_settings.max_interval,
            GREATEST(1, round(v_state.interval * v_state.ease_factor * 1.3)::INTEGER)
          );
          v_new_due      := now() + (v_new_interval * INTERVAL '1 day');

        ELSE
          RAISE EXCEPTION 'Invalid rating: %', v_rating;
      END CASE;

      -- Fuzz factor: ±5%
      IF v_new_status = 'review' AND v_new_interval > 2 THEN
        v_fuzz := GREATEST(1, round(v_new_interval * 0.05)::INTEGER);
        v_new_interval := v_new_interval + floor(random() * (v_fuzz * 2 + 1) - v_fuzz)::INTEGER;
        v_new_interval := LEAST(v_settings.max_interval, GREATEST(1, v_new_interval));
        v_new_due := now() + (v_new_interval * INTERVAL '1 day');
      END IF;

    ELSE
      RAISE EXCEPTION 'Cannot review card with status: %', v_state.status;
    END IF;

    -- card_states 업데이트
    UPDATE card_states
    SET status          = v_new_status,
        ease_factor     = v_new_ef,
        "interval"      = v_new_interval,
        due_date        = v_new_due,
        step_index      = v_new_step,
        lapse_count     = v_new_lapse,
        last_reviewed_at = now()
    WHERE card_id = v_card_id AND user_id = v_user_id;

    -- review_logs 기록
    INSERT INTO review_logs (
      card_id, user_id, rating,
      interval_before, interval_after,
      ease_before, ease_after,
      review_duration
    ) VALUES (
      v_card_id, v_user_id, v_rating,
      v_state.interval, v_new_interval,
      v_state.ease_factor, v_new_ef,
      v_duration
    );

    v_processed := v_processed + 1;
  END LOOP;

  RETURN jsonb_build_object('processed', v_processed);
END;
$$;
