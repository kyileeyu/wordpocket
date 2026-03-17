-- ============================================
-- 구간 복습 큐: 선택한 덱들의 learning + review 카드만 반환
-- ============================================

CREATE OR REPLACE FUNCTION get_range_review_queue(
  p_deck_ids  UUID[],
  p_limit     INTEGER DEFAULT 200
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
  v_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY

  -- learning 카드 (due_date <= now())
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'learning'::TEXT AS queue_type,
    cs.last_reviewed_at
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = ANY(p_deck_ids)
    AND cs.status = 'learning'
    AND cs.due_date <= now()
  ORDER BY cs.due_date ASC)

  UNION ALL

  -- review 카드 (due_date <= now())
  (SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags, c.synonyms,
    cs.status, cs.ease_factor, cs."interval", cs.due_date,
    cs.step_index, cs.lapse_count,
    'review'::TEXT AS queue_type,
    cs.last_reviewed_at
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = ANY(p_deck_ids)
    AND cs.status = 'review'
    AND cs.due_date <= now()
  ORDER BY cs.due_date ASC)

  LIMIT p_limit;
END;
$$;
