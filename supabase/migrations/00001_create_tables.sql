-- ============================================
-- WordPocket: 테이블 & 인덱스 생성
-- ============================================

-- profiles: Supabase Auth 사용자 확장 프로필
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  nickname   TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'auth.users 확장 프로필 — 가입 시 트리거로 자동 생성';

-- folders: 덱을 그룹화하는 상위 단위
CREATE TABLE folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_folders_user_id ON folders(user_id);

-- decks: 단어 카드가 담기는 단어장
CREATE TABLE decks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id   UUID REFERENCES folders(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  color       TEXT DEFAULT '#8b5cf6',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_folder_id ON decks(folder_id);

-- cards: 단어 카드
CREATE TABLE cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id       UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  word          TEXT NOT NULL,
  meaning       TEXT NOT NULL,
  example       TEXT DEFAULT '',
  pronunciation TEXT DEFAULT '',
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_deck_id ON cards(deck_id);

-- card_states: 카드별 사용자 학습 상태 (SM-2)
CREATE TABLE card_states (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id          UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new', 'learning', 'review', 'suspended')),
  ease_factor      REAL NOT NULL DEFAULT 2.5,
  interval         INTEGER NOT NULL DEFAULT 0,
  due_date         TIMESTAMPTZ NOT NULL DEFAULT now(),
  step_index       INTEGER NOT NULL DEFAULT 0,
  lapse_count      INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (card_id, user_id)
);

CREATE INDEX idx_card_states_user_status_due
  ON card_states(user_id, status, due_date);
CREATE INDEX idx_card_states_card_id ON card_states(card_id);

-- review_logs: 복습 이력 (통계, 히트맵용)
CREATE TABLE review_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating          TEXT NOT NULL
                    CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  interval_before INTEGER NOT NULL DEFAULT 0,
  interval_after  INTEGER NOT NULL DEFAULT 0,
  ease_before     REAL NOT NULL DEFAULT 2.5,
  ease_after      REAL NOT NULL DEFAULT 2.5,
  review_duration INTEGER DEFAULT 0,
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_logs_user_reviewed
  ON review_logs(user_id, reviewed_at DESC);
CREATE INDEX idx_review_logs_card_id ON review_logs(card_id);

-- user_settings: 사용자별 학습 설정
CREATE TABLE user_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  new_cards_per_day    INTEGER NOT NULL DEFAULT 20,
  learning_steps       INTEGER[] NOT NULL DEFAULT '{1, 10}',
  graduating_interval  INTEGER NOT NULL DEFAULT 1,
  easy_interval        INTEGER NOT NULL DEFAULT 4,
  max_interval         INTEGER NOT NULL DEFAULT 365,
  leech_threshold      INTEGER NOT NULL DEFAULT 5,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
