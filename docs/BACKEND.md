# WordPocket — 백엔드 작업 문서

> Supabase BaaS 기반 백엔드 구성 작업 정의서. 프론트엔드 작업 전에 완료해야 할 DB 스키마, 보안 정책, 서버 함수 등을 정리한다.

## 목차

- [1. Supabase 프로젝트 초기화 & CLI 설정](#1-supabase-프로젝트-초기화--cli-설정)
- [2. DB 마이그레이션 — 테이블 & 인덱스](#2-db-마이그레이션--테이블--인덱스)
- [3. RLS 정책](#3-rls-정책)
- [4. Database Triggers](#4-database-triggers)
- [5. PostgreSQL Functions (RPC)](#5-postgresql-functions-rpc)
- [6. Edge Functions](#6-edge-functions)
- [7. Seed 데이터](#7-seed-데이터)
- [8. TypeScript 타입 & 환경변수](#8-typescript-타입--환경변수)
- [9. 작업 의존관계 & 실행 순서](#9-작업-의존관계--실행-순서)

---

## 1. Supabase 프로젝트 초기화 & CLI 설정

### 1.1 CLI 설치 & 프로젝트 초기화

```bash
# Supabase CLI 설치
brew install supabase/tap/supabase

# 프로젝트 디렉토리에서 초기화
supabase init

# Supabase 대시보드에서 프로젝트 생성 후 링크
supabase link --project-ref <PROJECT_REF>
```

### 1.2 로컬 개발 환경

```bash
# 로컬 Supabase 인스턴스 시작 (Docker 필요)
supabase start

# 마이그레이션 실행
supabase db push

# 로컬 인스턴스 중지
supabase stop
```

### 1.3 디렉토리 구조

```
supabase/
├── config.toml              # Supabase 프로젝트 설정
├── seed.sql                 # 테스트용 시드 데이터
├── migrations/
│   ├── 00001_create_tables.sql    # 테이블 & 인덱스
│   ├── 00002_rls_policies.sql     # Row Level Security
│   ├── 00003_triggers.sql         # 트리거
│   └── 00004_functions.sql        # PostgreSQL RPC 함수
└── functions/
    └── import-csv/
        └── index.ts               # CSV 가져오기 Edge Function
```

---

## 2. DB 마이그레이션 — 테이블 & 인덱스

**파일:** `supabase/migrations/00001_create_tables.sql`

### 2.1 profiles 테이블

Supabase Auth의 `auth.users`를 확장하는 공개 프로필 테이블. `auth.users`는 직접 쿼리할 수 없으므로 `public.profiles`에 필요한 정보를 복제한다.

```sql
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
```

### 2.2 folders 테이블

```sql
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
```

### 2.3 decks 테이블

```sql
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
```

### 2.4 cards 테이블

```sql
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
```

### 2.5 card_states 테이블

```sql
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

-- 학습 큐 조회 최적화: status + due_date 복합 인덱스
CREATE INDEX idx_card_states_user_status_due
  ON card_states(user_id, status, due_date);

-- 특정 카드의 학습 상태 조회
CREATE INDEX idx_card_states_card_id ON card_states(card_id);
```

### 2.6 review_logs 테이블

```sql
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

-- 히트맵 & 통계 조회용 인덱스
CREATE INDEX idx_review_logs_user_reviewed
  ON review_logs(user_id, reviewed_at DESC);

-- 특정 카드 복습 이력 조회
CREATE INDEX idx_review_logs_card_id ON review_logs(card_id);
```

### 2.7 user_settings 테이블

```sql
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
```

### 2.8 인덱스 설계 요약

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| `folders` | `idx_folders_user_id` | 사용자별 폴더 목록 조회 |
| `decks` | `idx_decks_user_id` | 사용자별 덱 목록 조회 |
| `decks` | `idx_decks_folder_id` | 폴더별 덱 목록 조회 |
| `cards` | `idx_cards_deck_id` | 덱별 카드 목록 조회 |
| `card_states` | `idx_card_states_user_status_due` | 학습 큐 조회 (핵심 쿼리) |
| `card_states` | `idx_card_states_card_id` | 카드별 학습 상태 조회 |
| `review_logs` | `idx_review_logs_user_reviewed` | 히트맵, 통계 조회 |
| `review_logs` | `idx_review_logs_card_id` | 카드별 복습 이력 조회 |

---

## 3. RLS 정책

**파일:** `supabase/migrations/00002_rls_policies.sql`

모든 테이블에 Row Level Security를 활성화하고, 인증된 사용자가 자기 데이터만 접근할 수 있도록 정책을 설정한다.

### 3.1 profiles

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 자기 프로필 조회
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 자기 프로필 수정
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 3.2 folders

```sql
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
```

### 3.3 decks

```sql
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
```

### 3.4 cards

cards 테이블은 `user_id` 컬럼이 없으므로, deck 소유자 기반으로 접근을 제어한다.

```sql
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
```

### 3.5 card_states

```sql
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
```

### 3.6 review_logs

```sql
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_logs_select_own"
  ON review_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "review_logs_insert_own"
  ON review_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- review_logs는 수정/삭제 불가 (이력 보존)
```

### 3.7 user_settings

```sql
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_select_own"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3.8 RLS 커버리지 확인 체크리스트

| 테이블 | SELECT | INSERT | UPDATE | DELETE | 비고 |
|--------|--------|--------|--------|--------|------|
| `profiles` | ✅ own | - (트리거) | ✅ own | - (CASCADE) | INSERT는 트리거가 처리 |
| `folders` | ✅ own | ✅ own | ✅ own | ✅ own | |
| `decks` | ✅ own | ✅ own | ✅ own | ✅ own | |
| `cards` | ✅ deck owner | ✅ deck owner | ✅ deck owner | ✅ deck owner | deck 소유자 기반 |
| `card_states` | ✅ own | ✅ own | ✅ own | ✅ own | |
| `review_logs` | ✅ own | ✅ own | - | - | 수정/삭제 불가 |
| `user_settings` | ✅ own | - (트리거) | ✅ own | - | INSERT는 트리거가 처리 |

---

## 4. Database Triggers

**파일:** `supabase/migrations/00003_triggers.sql`

### 4.1 updated_at 자동 갱신

```sql
-- updated_at 자동 갱신 함수 (공용)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_card_states_updated_at
  BEFORE UPDATE ON card_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.2 신규 사용자 가입 시 자동 생성

```sql
-- 사용자 가입 시 profiles + user_settings 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- profiles 생성
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);

  -- user_settings 기본값 생성
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4.3 카드 생성 시 card_states 자동 생성

```sql
-- 카드 생성 시 해당 덱 소유자의 card_states 자동 생성
CREATE OR REPLACE FUNCTION handle_new_card()
RETURNS TRIGGER AS $$
DECLARE
  deck_owner UUID;
BEGIN
  -- 덱 소유자 조회
  SELECT user_id INTO deck_owner FROM decks WHERE id = NEW.deck_id;

  -- card_states 초기 상태 생성
  INSERT INTO card_states (card_id, user_id, status, due_date)
  VALUES (NEW.id, deck_owner, 'new', now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_card_created
  AFTER INSERT ON cards
  FOR EACH ROW EXECUTE FUNCTION handle_new_card();
```

---

## 5. PostgreSQL Functions (RPC)

**파일:** `supabase/migrations/00004_functions.sql`

클라이언트에서 `supabase.rpc('function_name', { params })` 형태로 호출한다.

### 5.1 get_study_queue — 학습 큐 조회

학습 세션에서 사용할 카드 큐를 우선순위에 따라 반환한다: **학습 중 > 복습 > 새 카드**.

```sql
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
  interval      INTEGER,
  due_date      TIMESTAMPTZ,
  step_index    INTEGER,
  lapse_count   INTEGER,
  queue_type    TEXT  -- 'learning' | 'review' | 'new'
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id         UUID := auth.uid();
  v_new_cards_limit INTEGER;
  v_today_new_count INTEGER;
BEGIN
  -- 사용자의 하루 새 카드 한도 조회
  SELECT new_cards_per_day INTO v_new_cards_limit
  FROM user_settings WHERE user_id = v_user_id;

  IF v_new_cards_limit IS NULL THEN
    v_new_cards_limit := 20;
  END IF;

  -- 오늘 이미 학습 시작한 새 카드 수
  SELECT COUNT(*) INTO v_today_new_count
  FROM review_logs rl
  JOIN card_states cs ON cs.card_id = rl.card_id AND cs.user_id = rl.user_id
  JOIN cards c ON c.id = rl.card_id
  WHERE rl.user_id = v_user_id
    AND c.deck_id = p_deck_id
    AND rl.reviewed_at >= CURRENT_DATE
    AND rl.interval_before = 0;  -- 새 카드였던 것

  RETURN QUERY

  -- 1순위: 학습 중인 카드 (due_date가 지난 것)
  SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags,
    cs.status, cs.ease_factor, cs.interval, cs.due_date,
    cs.step_index, cs.lapse_count,
    'learning'::TEXT AS queue_type
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'learning'
    AND cs.due_date <= now()
  ORDER BY cs.due_date ASC

  UNION ALL

  -- 2순위: 복습 카드 (오늘 복습 예정)
  SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags,
    cs.status, cs.ease_factor, cs.interval, cs.due_date,
    cs.step_index, cs.lapse_count,
    'review'::TEXT AS queue_type
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'review'
    AND cs.due_date <= CURRENT_DATE + INTERVAL '1 day'
  ORDER BY cs.due_date ASC

  UNION ALL

  -- 3순위: 새 카드 (하루 한도 내)
  SELECT
    c.id, c.word, c.meaning, c.example, c.pronunciation, c.tags,
    cs.status, cs.ease_factor, cs.interval, cs.due_date,
    cs.step_index, cs.lapse_count,
    'new'::TEXT AS queue_type
  FROM cards c
  JOIN card_states cs ON cs.card_id = c.id AND cs.user_id = v_user_id
  WHERE c.deck_id = p_deck_id
    AND cs.status = 'new'
  ORDER BY c.created_at ASC
  LIMIT GREATEST(0, v_new_cards_limit - v_today_new_count)

  LIMIT p_limit;
END;
$$;
```

### 5.2 submit_review — 응답 제출 (SM-2 계산)

카드 응답 제출 시 SM-2 알고리즘으로 card_states를 업데이트하고 review_logs에 기록한다. 단일 트랜잭션으로 실행된다.

```sql
CREATE OR REPLACE FUNCTION submit_review(
  p_card_id         UUID,
  p_rating          TEXT,     -- 'again' | 'hard' | 'good' | 'easy'
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
  -- 현재 카드 상태 조회
  SELECT * INTO v_state
  FROM card_states
  WHERE card_id = p_card_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card state not found for card_id: %', p_card_id;
  END IF;

  -- 사용자 설정 조회
  SELECT * INTO v_settings
  FROM user_settings
  WHERE user_id = v_user_id;

  -- 기본값 초기화
  v_new_ef     := v_state.ease_factor;
  v_new_step   := v_state.step_index;
  v_new_lapse  := v_state.lapse_count;

  -- ========================================
  -- SM-2 스케줄링 로직
  -- ========================================

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
          -- 졸업 → 복습 카드로 전환
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
        -- 즉시 졸업
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
        -- 리치 감지
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

    -- Fuzz factor: ±5% 랜덤 변동 (간격 2일 초과 시)
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
      interval        = v_new_interval,
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

  -- 결과 반환
  RETURN jsonb_build_object(
    'status',      v_new_status,
    'ease_factor', v_new_ef,
    'interval',    v_new_interval,
    'due_date',    v_new_due,
    'lapse_count', v_new_lapse
  );
END;
$$;
```

### 5.3 get_today_stats — 오늘의 학습 통계

```sql
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
  -- 오늘 복습한 총 카드 수
  SELECT COUNT(*) INTO v_reviewed
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= CURRENT_DATE;

  -- 오늘 처음 학습 시작한 새 카드 수
  SELECT COUNT(DISTINCT card_id) INTO v_new_learned
  FROM review_logs
  WHERE user_id = v_user_id
    AND reviewed_at >= CURRENT_DATE
    AND interval_before = 0;

  -- 오늘 총 학습 시간 (초)
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
```

### 5.4 get_heatmap_data — 히트맵 캘린더 데이터

```sql
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
```

### 5.5 get_streak — 연속 학습일 계산

```sql
CREATE OR REPLACE FUNCTION get_streak()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id       UUID := auth.uid();
  v_current_streak INTEGER := 0;
  v_check_date     DATE := CURRENT_DATE;
  v_has_reviews    BOOLEAN;
BEGIN
  -- 오늘부터 역순으로 연속 학습일 계산
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
      -- 오늘 아직 학습 안 했으면 어제부터 체크
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
```

### 5.6 get_deck_progress — 덱별 진행률

```sql
CREATE OR REPLACE FUNCTION get_deck_progress()
RETURNS TABLE (
  deck_id       UUID,
  deck_name     TEXT,
  folder_id     UUID,
  total_cards   BIGINT,
  new_count     BIGINT,
  learning_count BIGINT,
  review_count  BIGINT,
  suspended_count BIGINT,
  due_today     BIGINT
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
```

---

## 6. Edge Functions

### 6.1 import-csv — CSV 파싱 및 카드 일괄 생성

**파일:** `supabase/functions/import-csv/index.ts`

CSV 파일을 파싱하여 지정 덱에 카드를 일괄 생성한다. CSV 크기 제한과 파싱을 서버에서 처리하여 RLS를 우회하지 않으면서 효율적으로 대량 삽입한다.

```typescript
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CardRow {
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  tags?: string;
}

serve(async (req: Request) => {
  // CORS 처리
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    // 인증 확인
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 요청 파싱
    const { deck_id, csv_content } = await req.json();

    if (!deck_id || !csv_content) {
      return new Response(
        JSON.stringify({ error: "deck_id and csv_content are required" }),
        { status: 400 }
      );
    }

    // 덱 소유자 확인
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("id")
      .eq("id", deck_id)
      .single();

    if (deckError || !deck) {
      return new Response(
        JSON.stringify({ error: "Deck not found or access denied" }),
        { status: 404 }
      );
    }

    // CSV 파싱 (헤더: word, meaning, example, pronunciation, tags)
    const lines = csv_content.trim().split("\n");
    const header = lines[0].split(",").map((h: string) => h.trim().toLowerCase());

    const cards: CardRow[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const row: Record<string, string> = {};
      header.forEach((h: string, idx: number) => {
        row[h] = values[idx]?.trim() ?? "";
      });

      if (!row.word || !row.meaning) {
        errors.push(`Row ${i + 1}: word and meaning are required`);
        continue;
      }

      cards.push({
        word: row.word,
        meaning: row.meaning,
        example: row.example || "",
        pronunciation: row.pronunciation || "",
        tags: row.tags || "",
      });
    }

    // 카드 일괄 삽입
    const insertData = cards.map((card) => ({
      deck_id,
      word: card.word,
      meaning: card.meaning,
      example: card.example,
      pronunciation: card.pronunciation,
      tags: card.tags ? card.tags.split(";").map((t) => t.trim()) : [],
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("cards")
      .insert(insertData)
      .select("id");

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        imported: inserted?.length ?? 0,
        errors,
        total_rows: lines.length - 1,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
    });
  }
});

/** 간단한 CSV 라인 파서 (쌍따옴표 이스케이프 지원) */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}
```

**CSV 형식 예시:**

```csv
word,meaning,example,pronunciation,tags
apple,사과,"An apple a day keeps the doctor away.",ˈæpəl,fruit;food
ephemeral,일시적인,"The beauty of cherry blossoms is ephemeral.",ɪˈfemərəl,advanced;adjective
```

---

## 7. Seed 데이터

**파일:** `supabase/seed.sql`

로컬 개발 및 테스트에 사용하는 샘플 데이터. `supabase db reset` 실행 시 자동으로 삽입된다.

```sql
-- ============================================
-- 테스트용 시드 데이터
-- 주의: 로컬 개발 환경에서만 사용
-- ============================================

-- 테스트 사용자 (Supabase Auth에 직접 생성해야 함)
-- 로컬 개발 시 supabase dashboard에서 테스트 유저 생성 후
-- 해당 user_id를 아래에 대입하여 사용

-- 변수 설정 (실행 전 테스트 유저 ID로 교체)
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- 테스트 유저 ID
  folder_english UUID;
  folder_japanese UUID;
  deck_toeic UUID;
  deck_business UUID;
  deck_jlpt UUID;
BEGIN

-- 폴더 생성
INSERT INTO folders (id, user_id, name, color, sort_order)
VALUES
  (gen_random_uuid(), test_user_id, '영어', '#3b82f6', 0)
RETURNING id INTO folder_english;

INSERT INTO folders (id, user_id, name, color, sort_order)
VALUES
  (gen_random_uuid(), test_user_id, '일본어', '#ef4444', 1)
RETURNING id INTO folder_japanese;

-- 덱 생성
INSERT INTO decks (id, user_id, folder_id, name, description, color, sort_order)
VALUES
  (gen_random_uuid(), test_user_id, folder_english, 'TOEIC 필수 단어', 'TOEIC 빈출 단어 모음', '#3b82f6', 0)
RETURNING id INTO deck_toeic;

INSERT INTO decks (id, user_id, folder_id, name, description, color, sort_order)
VALUES
  (gen_random_uuid(), test_user_id, folder_english, '비즈니스 영어', '비즈니스 상황 필수 표현', '#10b981', 1)
RETURNING id INTO deck_business;

INSERT INTO decks (id, user_id, folder_id, name, description, color, sort_order)
VALUES
  (gen_random_uuid(), test_user_id, folder_japanese, 'JLPT N3', 'JLPT N3 필수 단어', '#ef4444', 0)
RETURNING id INTO deck_jlpt;

-- TOEIC 필수 단어 카드
INSERT INTO cards (deck_id, word, meaning, example, pronunciation, tags) VALUES
  (deck_toeic, 'accommodate', '수용하다, 편의를 도모하다', 'The hotel can accommodate up to 500 guests.', 'əˈkɑːmədeɪt', '{toeic,verb}'),
  (deck_toeic, 'implement', '시행하다, 구현하다', 'We need to implement the new policy by next month.', 'ˈɪmplɪment', '{toeic,verb}'),
  (deck_toeic, 'revenue', '수익, 세입', 'The company reported a 20% increase in revenue.', 'ˈrevənjuː', '{toeic,noun,finance}'),
  (deck_toeic, 'complimentary', '무료의, 칭찬하는', 'The hotel offers complimentary breakfast.', 'ˌkɑːmplɪˈmentəri', '{toeic,adjective}'),
  (deck_toeic, 'prospective', '장래의, 예상되는', 'We have a meeting with prospective clients.', 'prəˈspektɪv', '{toeic,adjective}'),
  (deck_toeic, 'adjacent', '인접한', 'The parking lot is adjacent to the building.', 'əˈdʒeɪsnt', '{toeic,adjective}'),
  (deck_toeic, 'reimburse', '상환하다, 변상하다', 'The company will reimburse your travel expenses.', 'ˌriːɪmˈbɜːrs', '{toeic,verb,finance}'),
  (deck_toeic, 'mandatory', '의무적인', 'Attendance at the meeting is mandatory.', 'ˈmændətɔːri', '{toeic,adjective}'),
  (deck_toeic, 'itinerary', '여행 일정', 'Please review the itinerary before the trip.', 'aɪˈtɪnəreri', '{toeic,noun,travel}'),
  (deck_toeic, 'prerequisite', '전제 조건', 'A bachelor''s degree is a prerequisite for the position.', 'ˌpriːˈrekwəzɪt', '{toeic,noun}');

-- 비즈니스 영어 카드
INSERT INTO cards (deck_id, word, meaning, example, pronunciation, tags) VALUES
  (deck_business, 'synergy', '시너지, 상승 효과', 'The merger created significant synergy between the two companies.', 'ˈsɪnərdʒi', '{business,noun}'),
  (deck_business, 'leverage', '활용하다, 지렛대', 'We should leverage our existing network.', 'ˈlevərɪdʒ', '{business,verb}'),
  (deck_business, 'stakeholder', '이해관계자', 'All stakeholders must approve the proposal.', 'ˈsteɪkhoʊldər', '{business,noun}'),
  (deck_business, 'scalable', '확장 가능한', 'We need a scalable solution for growing demand.', 'ˈskeɪləbl', '{business,adjective,tech}'),
  (deck_business, 'benchmark', '기준점, 벤치마크', 'This report sets a benchmark for future performance.', 'ˈbentʃmɑːrk', '{business,noun}');

-- JLPT N3 카드
INSERT INTO cards (deck_id, word, meaning, example, pronunciation, tags) VALUES
  (deck_jlpt, '経験', '경험', '海外で働いた経験がありますか。', 'けいけん', '{jlpt,n3,noun}'),
  (deck_jlpt, '届ける', '전해주다, 배달하다', '荷物を届けてください。', 'とどける', '{jlpt,n3,verb}'),
  (deck_jlpt, '信じる', '믿다', '自分を信じてください。', 'しんじる', '{jlpt,n3,verb}'),
  (deck_jlpt, '複雑', '복잡하다', 'この問題は複雑です。', 'ふくざつ', '{jlpt,n3,adjective}'),
  (deck_jlpt, '相談', '상담', '先生に相談したいです。', 'そうだん', '{jlpt,n3,noun}');

END $$;
```

---

## 8. TypeScript 타입 & 환경변수

### 8.1 DB 타입 자동 생성

Supabase CLI로 DB 스키마에서 TypeScript 타입을 자동 생성한다.

```bash
# 로컬 DB에서 타입 생성
supabase gen types typescript --local > src/types/database.types.ts

# 원격 DB에서 타입 생성 (배포 환경)
supabase gen types typescript --project-id <PROJECT_REF> > src/types/database.types.ts
```

생성된 타입은 다음과 같이 활용한다:

```typescript
import { Database } from '@/types/database.types';

// 테이블 행 타입
type Card = Database['public']['Tables']['cards']['Row'];
type CardInsert = Database['public']['Tables']['cards']['Insert'];
type CardUpdate = Database['public']['Tables']['cards']['Update'];

// Supabase 클라이언트에 타입 적용
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 8.2 환경변수

**파일:** `.env.example`

```env
# Supabase
VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<ANON_KEY>
```

> **주의:** `.env` 파일은 `.gitignore`에 포함되어야 한다. `ANON_KEY`는 클라이언트에 노출되는 공개 키이며, RLS가 보안을 담당한다. `SERVICE_ROLE_KEY`는 절대 클라이언트에 포함하지 않는다.

---

## 9. 작업 의존관계 & 실행 순서

### 9.1 의존관계 다이어그램

```
[1] Supabase 초기화 & CLI 설정
 │
 ▼
[2] 테이블 & 인덱스 (00001_create_tables.sql)
 │
 ├──────────────┬──────────────┐
 ▼              ▼              ▼
[3] RLS 정책   [4] Triggers  [5] Functions
(00002)        (00003)        (00004)
 │              │              │
 └──────┬───────┴──────────────┘
        ▼
[7] Seed 데이터 (seed.sql)
        │
        ├─────────────┐
        ▼             ▼
[6] Edge Functions  [8] 타입 생성 & .env
(import-csv)        (gen types)
```

### 9.2 실행 순서

| 순서 | 작업 | 선행 작업 | 산출물 |
|------|------|-----------|--------|
| 1 | Supabase 프로젝트 초기화 | - | `supabase/config.toml` |
| 2 | 테이블 & 인덱스 마이그레이션 | 1 | `supabase/migrations/00001_create_tables.sql` |
| 3 | RLS 정책 마이그레이션 | 2 | `supabase/migrations/00002_rls_policies.sql` |
| 4 | Triggers 마이그레이션 | 2 | `supabase/migrations/00003_triggers.sql` |
| 5 | PostgreSQL Functions | 2 | `supabase/migrations/00004_functions.sql` |
| 6 | Edge Functions | 1 | `supabase/functions/import-csv/index.ts` |
| 7 | Seed 데이터 | 2, 3, 4 | `supabase/seed.sql` |
| 8 | TypeScript 타입 & .env | 2 | `src/types/database.types.ts`, `.env.example` |

> **참고:** 3, 4, 5번 작업은 모두 2번(테이블)에만 의존하므로 병렬로 진행할 수 있다.

### 9.3 검증 체크리스트

- [ ] 모든 테이블이 README.md 데이터 모델과 일치하는가
- [ ] profiles 테이블이 추가되었는가 (auth.users 확장)
- [ ] 7개 테이블 모두 RLS가 활성화되었는가
- [ ] cards 테이블은 deck 소유자 기반 접근으로 보호되는가
- [ ] review_logs는 INSERT만 허용되고 UPDATE/DELETE가 차단되는가
- [ ] 카드 생성 시 card_states가 자동 생성되는가
- [ ] 사용자 가입 시 profiles + user_settings가 자동 생성되는가
- [ ] updated_at이 모든 관련 테이블에서 자동 갱신되는가
- [ ] submit_review가 SM-2 알고리즘을 정확히 구현하는가
- [ ] Fuzz factor가 간격 2일 초과 시 ±5% 적용되는가
- [ ] Leech 감지가 lapse_count >= leech_threshold일 때 suspended로 변경하는가
- [ ] max_interval 제한이 모든 간격 계산에 적용되는가
- [ ] get_study_queue 우선순위가 학습 중 > 복습 > 새 카드인가
- [ ] 새 카드 일일 한도가 적용되는가
- [ ] 로컬 `supabase db reset`으로 전체 스키마 + 시드가 정상 적용되는가
