-- ── get_deck_progress: 4단계 상태 (모름, 배우는중, 복습예정, 암기완료) ──
DROP FUNCTION IF EXISTS get_deck_progress();
CREATE OR REPLACE FUNCTION get_deck_progress()
RETURNS TABLE (
  deck_id          UUID,
  deck_name        TEXT,
  folder_id        UUID,
  total_cards      BIGINT,
  unknown_count    BIGINT,
  learning_count   BIGINT,
  upcoming_count   BIGINT,
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
    -- 모름: new 카드 + learning에서 step_index=0 (again으로 리셋된 카드)
    COUNT(*) FILTER (WHERE cs.status = 'new'
      OR (cs.status = 'learning' AND cs.step_index = 0)) AS unknown_count,
    -- 배우는중: learning에서 step 진행 중
    COUNT(*) FILTER (WHERE cs.status = 'learning'
      AND cs.step_index > 0) AS learning_count,
    -- 복습예정: review에서 interval < 7일
    COUNT(*) FILTER (WHERE cs.status = 'review'
      AND cs."interval" < 7) AS upcoming_count,
    -- 암기완료: review에서 interval >= 7일
    COUNT(*) FILTER (WHERE cs.status = 'review'
      AND cs."interval" >= 7) AS memorized_count,
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
