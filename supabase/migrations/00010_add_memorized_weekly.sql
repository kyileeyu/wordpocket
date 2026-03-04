-- ============================================
-- 최근 7일간 '외웠어요' 단어 수 (일별)
-- ============================================

CREATE OR REPLACE FUNCTION get_memorized_weekly()
RETURNS TABLE (
  date            DATE,
  memorized_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d::DATE AS date,
    COALESCE(m.cnt, 0) AS memorized_count
  FROM generate_series(
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS d
  LEFT JOIN (
    SELECT
      reviewed_at::DATE AS review_date,
      COUNT(DISTINCT card_id) AS cnt
    FROM review_logs
    WHERE user_id = auth.uid()
      AND reviewed_at >= CURRENT_DATE - INTERVAL '6 days'
      AND rating IN ('good', 'easy')
    GROUP BY reviewed_at::DATE
  ) m ON m.review_date = d::DATE
  ORDER BY d ASC;
END;
$$;
