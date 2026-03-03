CREATE OR REPLACE FUNCTION search_cards(p_query TEXT)
RETURNS TABLE (
  card_id       UUID,
  deck_id       UUID,
  word          TEXT,
  meaning       TEXT,
  deck_name     TEXT,
  folder_name   TEXT,
  status        TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id          AS card_id,
    c.deck_id,
    c.word,
    c.meaning,
    d.name        AS deck_name,
    f.name        AS folder_name,
    COALESCE(cs.status, 'new') AS status
  FROM cards c
  JOIN decks d ON d.id = c.deck_id
  LEFT JOIN folders f ON f.id = d.folder_id
  LEFT JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = auth.uid()
  WHERE d.user_id = auth.uid()
    AND (c.word ILIKE '%' || p_query || '%' OR c.meaning ILIKE '%' || p_query || '%')
  ORDER BY
    CASE WHEN c.word ILIKE p_query || '%' THEN 0 ELSE 1 END,
    c.word ASC
  LIMIT 50;
END;
$$;
