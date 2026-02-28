-- ============================================
-- WordPocket: PostgreSQL RPC Functions
-- ============================================

-- ── get_study_queue: 학습 큐 조회 (학습중 > 복습 > 새카드) ──
CREATE OR REPLACE FUNCTION get_study_queue(
  p_deck_id UUID,
  p_limit   INTEGER DEFAULT 100
)
RETURNS TABLE (
  card_id       UUID,
  word          TEXT,
  meaning       TEXT,
  example       TEXT,
  pronunciation TEXT,
  tags          TEXT[],
  status        TEXT,
  ease_factor   REAL,
  "interval"    INTEGER,
  due_date      TIMESTAMPTZ,
  step_index    INTEGER,
  lapse_count   INTEGER,
  queue_type    TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id         UUID := auth.uid();
  v_new_cards_limit INTEGER;
  v_today_new_count INTEGER;
BEGIN
  SELECT new_cards_per_day INTO v_new_cards_limit
  FROM user_settings WHERE user_id = v_user_id;

  IF v_new_cards_limit IS NULL THEN
    v_new_cards_limit := 20;
  END IF;

  SELECT COUNT(DISTINCT rl.card_id) INTO v_today_new_count
  FROM review_logs rl
  JOIN cards c ON c.id = rl.card_id
  WHERE rl.user_id = v_user_id
    AND c.deck_id = p_deck_id
    AND rl.reviewed_at >= CURRENT_DATE
    AND rl.interval_before = 0;

  RETURN QUERY

  -- 1순위: 학습 중인 카드
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'learning'::TEXT AS queue_type
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'learning'
    AND cs.due_date <= now()
  ORDER BY cs.due_date ASC)

  UNION ALL

  -- 2순위: 복습 카드
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'review'::TEXT AS queue_type
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'review'
    AND cs.due_date <= CURRENT_DATE + INTERVAL '1 day'
  ORDER BY cs.due_date ASC)

  UNION ALL

  -- 3순위: 새 카드 (하루 한도 내)
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'new'::TEXT AS queue_type
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'new'
  ORDER BY c.created_at ASC
  LIMIT GREATEST(0, v_new_cards_limit - v_today_new_count))

  LIMIT p_limit;
END;
$$;

-- ── submit_review: 응답 제출 + SM-2 계산 (트랜잭션) ──
CREATE OR REPLACE FUNCTION submit_review(
  p_card_id         UUID,
  p_rating          TEXT,
  p_review_duration INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id       UUID := auth.uid();
  v_state         RECORD;
  v_settings      RECORD;
  v_new_status    TEXT;
  v_new_ef        REAL;
  v_new_interval  INTEGER;
  v_new_due       TIMESTAMPTZ;
  v_new_step      INTEGER;
  v_new_lapse     INTEGER;
  v_fuzz          INTEGER;
BEGIN
  SELECT * INTO v_state
  FROM card_states
  WHERE card_id = p_card_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card state not found for card_id: %', p_card_id;
  END IF;

  SELECT * INTO v_settings
  FROM user_settings
  WHERE user_id = v_user_id;

  v_new_ef     := v_state.ease_factor;
  v_new_step   := v_state.step_index;
  v_new_lapse  := v_state.lapse_count;

  IF v_state.status IN ('new', 'learning') THEN
    -- === 학습 중인 카드 ===
    CASE p_rating
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
        RAISE EXCEPTION 'Invalid rating: %', p_rating;
    END CASE;

  ELSIF v_state.status = 'review' THEN
    -- === 복습 카드 ===
    CASE p_rating
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
        RAISE EXCEPTION 'Invalid rating: %', p_rating;
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
  WHERE card_id = p_card_id AND user_id = v_user_id;

  -- review_logs 기록
  INSERT INTO review_logs (
    card_id, user_id, rating,
    interval_before, interval_after,
    ease_before, ease_after,
    review_duration
  ) VALUES (
    p_card_id, v_user_id, p_rating,
    v_state.interval, v_new_interval,
    v_state.ease_factor, v_new_ef,
    p_review_duration
  );

  RETURN jsonb_build_object(
    'status',      v_new_status,
    'ease_factor', v_new_ef,
    'interval',    v_new_interval,
    'due_date',    v_new_due,
    'lapse_count', v_new_lapse
  );
END;
$$;

-- ── get_today_stats: 오늘의 학습 통계 ──
CREATE OR REPLACE FUNCTION get_today_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_reviewed     INTEGER;
  v_new_learned  INTEGER;
  v_seconds      INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_reviewed
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= CURRENT_DATE;

  SELECT COUNT(DISTINCT card_id) INTO v_new_learned
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= CURRENT_DATE
    AND interval_before = 0;

  SELECT COALESCE(SUM(review_duration), 0) / 1000 INTO v_seconds
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= CURRENT_DATE;

  RETURN jsonb_build_object(
    'reviewed_count',    v_reviewed,
    'new_learned_count', v_new_learned,
    'study_seconds',     v_seconds,
    'date',              CURRENT_DATE
  );
END;
$$;

-- ── get_heatmap_data: 히트맵 캘린더 데이터 ──
CREATE OR REPLACE FUNCTION get_heatmap_data(
  p_days INTEGER DEFAULT 365
)
RETURNS TABLE (
  date         DATE,
  review_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    reviewed_at::DATE AS date,
    COUNT(*)          AS review_count
  FROM review_logs
  WHERE user_id = auth.uid()
    AND reviewed_at >= CURRENT_DATE - (p_days * INTERVAL '1 day')
  GROUP BY reviewed_at::DATE
  ORDER BY date ASC;
END;
$$;

-- ── get_streak: 연속 학습일 계산 ──
CREATE OR REPLACE FUNCTION get_streak()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id        UUID := auth.uid();
  v_current_streak INTEGER := 0;
  v_check_date     DATE := CURRENT_DATE;
  v_has_reviews    BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM review_logs
      WHERE user_id = v_user_id
        AND reviewed_at::DATE = v_check_date
    ) INTO v_has_reviews;

    IF v_has_reviews THEN
      v_current_streak := v_current_streak + 1;
      v_check_date := v_check_date - 1;
    ELSE
      IF v_check_date = CURRENT_DATE THEN
        v_check_date := v_check_date - 1;
      ELSE
        EXIT;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'current_streak', v_current_streak
  );
END;
$$;

-- ── get_deck_progress: 덱별 진행률 ──
CREATE OR REPLACE FUNCTION get_deck_progress()
RETURNS TABLE (
  deck_id         UUID,
  deck_name       TEXT,
  folder_id       UUID,
  total_cards     BIGINT,
  new_count       BIGINT,
  learning_count  BIGINT,
  review_count    BIGINT,
  suspended_count BIGINT,
  due_today       BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id          AS deck_id,
    d.name        AS deck_name,
    d.folder_id,
    COUNT(cs.id)  AS total_cards,
    COUNT(*) FILTER (WHERE cs.status = 'new')       AS new_count,
    COUNT(*) FILTER (WHERE cs.status = 'learning')  AS learning_count,
    COUNT(*) FILTER (WHERE cs.status = 'review')    AS review_count,
    COUNT(*) FILTER (WHERE cs.status = 'suspended') AS suspended_count,
    COUNT(*) FILTER (
      WHERE cs.status IN ('review', 'learning')
        AND cs.due_date <= CURRENT_DATE + INTERVAL '1 day'
    ) AS due_today
  FROM decks d
  LEFT JOIN cards c ON c.deck_id = d.id
  LEFT JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = auth.uid()
  WHERE d.user_id = auth.uid()
  GROUP BY d.id, d.name, d.folder_id
  ORDER BY d.sort_order ASC;
END;
$$;
