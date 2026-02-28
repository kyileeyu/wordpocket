-- ============================================
-- WordPocket: Row Level Security 정책
-- ============================================

-- ── profiles ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── folders ──
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "folders_select_own"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "folders_insert_own"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "folders_update_own"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "folders_delete_own"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- ── decks ──
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decks_select_own"
  ON decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "decks_insert_own"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "decks_update_own"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "decks_delete_own"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);

-- ── cards (deck 소유자 기반 접근) ──
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select_own"
  ON cards FOR SELECT
  USING (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

CREATE POLICY "cards_insert_own"
  ON cards FOR INSERT
  WITH CHECK (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

CREATE POLICY "cards_update_own"
  ON cards FOR UPDATE
  USING (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  )
  WITH CHECK (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

CREATE POLICY "cards_delete_own"
  ON cards FOR DELETE
  USING (
    deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid())
  );

-- ── card_states ──
ALTER TABLE card_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_states_select_own"
  ON card_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "card_states_insert_own"
  ON card_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "card_states_update_own"
  ON card_states FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "card_states_delete_own"
  ON card_states FOR DELETE
  USING (auth.uid() = user_id);

-- ── review_logs (INSERT만 허용, 수정/삭제 불가) ──
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_logs_select_own"
  ON review_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "review_logs_insert_own"
  ON review_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── user_settings ──
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_select_own"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
