-- ============================================
-- Add memorized (외웠어요) stats to get_today_stats()
-- ============================================

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

  -- 오늘 '외웠어요'(good) 또는 '안외워도 돼요'(easy) 누른 고유 카드 수
  SELECT COUNT(DISTINCT card_id) INTO v_memorized_today
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= CURRENT_DATE
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
