-- Add synonyms column to cards table (TEXT[] like tags)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS synonyms TEXT[] DEFAULT '{}';

-- Drop and recreate get_study_queue to add synonyms to return type
DROP FUNCTION IF EXISTS get_study_queue(UUID, INTEGER);
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
  synonyms      TEXT[],
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
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
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
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
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
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
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
