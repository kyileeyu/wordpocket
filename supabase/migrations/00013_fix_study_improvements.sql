-- ============================================
-- 하루 기준을 새벽 4시(KST)로 변경 + 암기 완료(interval>=21) 통계
-- ============================================

-- 헬퍼: KST 새벽 4시 기준 "오늘의 시작" 계산
-- 예: 3/5 04:00 KST ~ 3/6 03:59 KST = 같은 "학습일"
CREATE OR REPLACE FUNCTION study_day_start()
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN EXTRACT(HOUR FROM now() AT TIME ZONE 'Asia/Seoul') < 4
    THEN (CURRENT_DATE - INTERVAL '1 day') AT TIME ZONE 'Asia/Seoul' + INTERVAL '4 hours'
    ELSE CURRENT_DATE AT TIME ZONE 'Asia/Seoul' + INTERVAL '4 hours'
  END;
$$;

CREATE OR REPLACE FUNCTION study_day_end()
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
AS $$
  SELECT study_day_start() + INTERVAL '1 day';
$$;

-- ── get_study_queue: 새벽 4시 기준으로 변경 ──
DROP FUNCTION IF EXISTS get_study_queue(UUID, INTEGER);
CREATE OR REPLACE FUNCTION get_study_queue(
  p_deck_id UUID,
  p_limit   INTEGER DEFAULT 100
)
RETURNS TABLE (
  card_id          UUID,
  word             TEXT,
  meaning          TEXT,
  example          TEXT,
  pronunciation    TEXT,
  tags             TEXT[],
  synonyms         TEXT[],
  status           TEXT,
  ease_factor      REAL,
  "interval"       INTEGER,
  due_date         TIMESTAMPTZ,
  step_index       INTEGER,
  lapse_count      INTEGER,
  queue_type       TEXT,
  last_reviewed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id         UUID := auth.uid();
  v_new_cards_limit INTEGER;
  v_today_new_count INTEGER;
  v_day_start       TIMESTAMPTZ := study_day_start();
BEGIN
  SELECT new_cards_per_day INTO v_new_cards_limit
  FROM user_settings WHERE user_id = v_user_id;

  IF v_new_cards_limit IS NULL THEN
    INSERT INTO user_settings (user_id)
    VALUES (v_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    v_new_cards_limit := 20;
  END IF;

  SELECT COUNT(DISTINCT rl.card_id) INTO v_today_new_count
  FROM review_logs rl
  JOIN cards c ON c.id = rl.card_id
  WHERE rl.user_id = v_user_id
    AND c.deck_id = p_deck_id
    AND rl.reviewed_at >= v_day_start
    AND rl.interval_before = 0;

  RETURN QUERY

  -- 1순위: 새 카드 (하루 한도 내)
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'new'::TEXT AS queue_type,
    cs.last_reviewed_at
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'new'
  ORDER BY c.created_at ASC
  LIMIT GREATEST(0, v_new_cards_limit - v_today_new_count))

  UNION ALL

  -- 2순위: 학습 중인 카드
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'learning'::TEXT AS queue_type,
    cs.last_reviewed_at
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'learning'
    AND cs.due_date <= now()
  ORDER BY cs.due_date ASC)

  UNION ALL

  -- 3순위: 복습 카드 (due_date가 현재 시점 이전)
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'review'::TEXT AS queue_type,
    cs.last_reviewed_at
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'review'
    AND cs.due_date <= now()
  ORDER BY cs.due_date ASC)

  LIMIT p_limit;
END;
$$;

-- ── get_deck_progress: 암기 완료 카운트 추가 + 새벽 4시 기준 ──
DROP FUNCTION IF EXISTS get_deck_progress();
CREATE OR REPLACE FUNCTION get_deck_progress()
RETURNS TABLE (
  deck_id          UUID,
  deck_name        TEXT,
  folder_id        UUID,
  total_cards      BIGINT,
  new_count        BIGINT,
  learning_count   BIGINT,
  review_count     BIGINT,
  memorized_count  BIGINT,
  suspended_count  BIGINT,
  due_today        BIGINT
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
    COUNT(*) FILTER (WHERE cs.status = 'learning'
      OR (cs.status = 'review' AND cs."interval" < 21)) AS learning_count,
    COUNT(*) FILTER (WHERE cs.status = 'review')    AS review_count,
    COUNT(*) FILTER (WHERE cs.status = 'review'
      AND cs."interval" >= 21)                      AS memorized_count,
    COUNT(*) FILTER (WHERE cs.status = 'suspended') AS suspended_count,
    COUNT(*) FILTER (
      WHERE cs.status IN ('review', 'learning')
        AND cs.due_date <= now()
    ) AS due_today
  FROM decks d
  LEFT JOIN cards c ON c.deck_id = d.id
  LEFT JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = auth.uid()
  WHERE d.user_id = auth.uid()
  GROUP BY d.id, d.name, d.folder_id
  ORDER BY d.sort_order ASC;
END;
$$;

-- ── get_today_stats: 새벽 4시 기준 ──
CREATE OR REPLACE FUNCTION get_today_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id           UUID := auth.uid();
  v_reviewed          INTEGER;
  v_new_learned       INTEGER;
  v_seconds           INTEGER;
  v_memorized_today   INTEGER;
  v_day_start         TIMESTAMPTZ := study_day_start();
BEGIN
  SELECT COUNT(*) INTO v_reviewed
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= v_day_start;

  SELECT COUNT(DISTINCT card_id) INTO v_new_learned
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= v_day_start
    AND interval_before = 0;

  SELECT COALESCE(SUM(review_duration), 0) / 1000 INTO v_seconds
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= v_day_start;

  SELECT COUNT(DISTINCT card_id) INTO v_memorized_today
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= v_day_start
    AND rating IN ('good', 'easy');

  RETURN jsonb_build_object(
    'reviewed_count',    v_reviewed,
    'new_learned_count', v_new_learned,
    'study_seconds',     v_seconds,
    'memorized_today',   v_memorized_today,
    'date',              CURRENT_DATE
  );
END;
$$;

-- ── get_streak: 새벽 4시 기준 ──
CREATE OR REPLACE FUNCTION get_streak()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id        UUID := auth.uid();
  v_current_streak INTEGER := 0;
  v_check_start    TIMESTAMPTZ := study_day_start();
  v_has_reviews    BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM review_logs
      WHERE user_id = v_user_id
        AND reviewed_at >= v_check_start
        AND reviewed_at < v_check_start + INTERVAL '1 day'
    ) INTO v_has_reviews;

    IF v_has_reviews THEN
      v_current_streak := v_current_streak + 1;
      v_check_start := v_check_start - INTERVAL '1 day';
    ELSE
      IF v_check_start = study_day_start() THEN
        v_check_start := v_check_start - INTERVAL '1 day';
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
