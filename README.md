# WordPocket

> 반복 학습 기반 단어 암기 웹앱 — Anki에서 영감을 받은 간결하고 효과적인 단어 학습 도구

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [Anki 기능 분석](#anki-기능-분석)
- [WordPocket 핵심 기능](#wordpocket-핵심-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [데이터 모델](#데이터-모델)
- [핵심 알고리즘](#핵심-알고리즘)
- [화면 설계](#화면-설계)
- [개발 로드맵](#개발-로드맵)

---

## 프로젝트 개요

**WordPocket**은 과학적 간격 반복(Spaced Repetition) 알고리즘을 활용한 단어 암기 웹앱이다. Anki의 검증된 학습 방법론을 채택하되, 단어 학습에 특화된 간결한 UX를 제공한다.

### 핵심 목표

- **단어 학습 특화**: 범용 플래시카드가 아닌 단어/어휘 암기에 집중
- **크로스 플랫폼**: PWA 기반으로 모바일/데스크톱 웹 브라우저에서 동일하게 동작
- **사용자별 동기화**: 로그인 기반으로 어디서든 학습 이력 유지
- **간결한 UX**: Anki의 복잡한 설정을 단순화하여 즉시 사용 가능

---

## Anki 기능 분석

### Anki의 핵심 메커니즘

| 요소 | 설명 | WordPocket 적용 |
|------|------|-----------------|
| **SM-2 알고리즘** | 난이도(ease factor)와 간격을 조합해 복습 일정 결정. 초기 EF=2.5, 최소 1.3 | ✅ 채택 |
| **FSRS 알고리즘** | ML 기반 차세대 스케줄러. 안정성/난이도/기억확률 3요소 모델링 | ⏳ v2에서 검토 |
| **노트 → 카드 분리** | 하나의 노트에서 여러 카드 생성 (정방향/역방향) | ✅ 단어→뜻, 뜻→단어 자동 생성 |
| **4단계 응답** | Again / Hard / Good / Easy 버튼으로 자기 평가 | ✅ 채택 (Again/Hard/Good/Easy) |
| **학습 단계** | 새 카드는 학습 단계(1m→10m)를 거쳐 졸업 | ✅ 채택 |
| **리치(Leech) 감지** | 반복 실패 카드 자동 감지 및 일시 중지 | ✅ 채택 |
| **덱 관리** | 덱/서브덱 계층 구조 | ✅ 폴더 → 덱 1depth 계층 구조 |
| **태그 시스템** | 계층적 태그로 카드 분류 | ✅ 간단한 태그 지원 |
| **통계/그래프** | 복습 히트맵, 간격 분포, 학습 시간 등 | ✅ 핵심 통계만 제공 |
| **AnkiWeb 동기화** | 변경분만 전송하는 증분 동기화 | ✅ 실시간 클라우드 동기화 |
| **커스텀 템플릿** | HTML/CSS 기반 카드 템플릿 | ❌ 제외 (불필요한 복잡성) |
| **필터 덱** | 조건 기반 임시 학습 세션 | ⏳ v2에서 검토 |

### Anki의 학습 세션 흐름

```
[새 카드] → 학습 단계 (1분 → 10분) → 졸업 → [복습 카드]
                                                    ↓
                                              정답 → 간격 × EF
                                              오답 → 리러닝 → 간격 리셋
```

### Anki의 스케줄링 핵심 파라미터

| 파라미터 | Anki 기본값 | WordPocket 기본값 |
|----------|-------------|-------------------|
| 하루 새 카드 수 | 20장 | 20장 |
| 하루 복습 상한 | 200장 | 제한 없음 |
| 학습 단계 | 1분, 10분 | 1분, 10분 |
| 졸업 간격 | 1일 | 1일 |
| 쉬움 간격 | 4일 | 4일 |
| 초기 난이도(EF) | 2.5 | 2.5 |
| 최소 난이도(EF) | 1.3 | 1.3 |
| 리치 임계값 | 8회 실패 | 5회 실패 |
| 최대 간격 | 36500일 | 365일 |

---

## WordPocket 핵심 기능

### Phase 1 — MVP

#### 1. 사용자 인증
- 이메일/비밀번호 회원가입 및 로그인
- JWT 기반 인증 유지 (Supabase Auth)

#### 2. 단어장 관리
- **폴더 → 덱 1depth 계층 구조**
  - 폴더(Folder): 덱을 그룹화하는 상위 단위 (예: "영어", "일본어")
  - 덱(Deck): 실제 단어 카드가 담기는 단어장 (예: "TOEIC 필수", "비즈니스 영어")
  - 폴더 선택 시 하위 모든 덱의 카드를 합쳐서 학습 가능
- 폴더/덱 CRUD — 이름, 설명, 색상
- 단어 카드 CRUD — 단어, 뜻, 예문, 발음(선택)
- 단어장 내 카드 목록 조회/검색
- CSV 파일로 단어 일괄 가져오기

#### 3. 학습 세션
- SM-2 기반 간격 반복 스케줄링
- 하루 새 카드 수 설정 (기본 20장)
- 학습 단계: 새 카드 → 학습 중 → 복습 카드
- 4단계 자기 평가: **Again / Hard / Good / Easy**
  - Again(다시): 학습 단계 리셋, EF -0.2
  - Hard(어려움): 간격 × 1.2, EF -0.15
  - Good(좋음): 간격 × EF
  - Easy(쉬움): 간격 × EF × 1.3 (Easy Bonus), EF +0.15, 학습 카드는 즉시 졸업
- 카드 뒤집기 애니메이션 (앞면: 단어, 뒷면: 뜻+예문)
- 세션 중 단어 수정 가능
- 실행취소(Undo) 지원

#### 4. 진행 현황
- 오늘의 학습 요약: 새 카드 / 복습 / 완료 수
- 연속 학습일(Streak) 표시
- 단어장별 진행률 (새 카드 / 학습 중 / 숙지 비율)

#### 5. PWA 지원
- 모바일 홈 화면 추가 가능
- 오프라인 캐시 (서비스 워커)
- 반응형 디자인 (모바일 우선)
- 터치 제스처 (스와이프로 응답)

### Phase 2 — 확장

- OAuth 소셜 로그인 (카카오, Google)
- 역방향 카드 (뜻 → 단어) 자동 생성 및 별도 스케줄링
- 태그 시스템: 단어에 태그 부여, 태그별 필터 학습
- 리치(Leech) 감지 및 자동 일시 중지
- 학습 통계 대시보드: 히트맵 캘린더, 복습 추이 그래프
- 단어장 공유: 공개 단어장 탐색 및 복제
- TTS(Text-to-Speech) 발음 재생
- 다크 모드

### Phase 3 — 고도화

- FSRS 알고리즘 도입 (SM-2 대비 효율 향상)
- 커스텀 학습 세션 (약한 카드만, 특정 태그만 등)
- 이미지 첨부 카드
- AI 기반 예문 자동 생성
- 단어장 내보내기 (CSV, JSON)
- 학습 알림 (Push Notification)

---

## 기술 스택

| 계층 | 기술 | 선정 이유 |
|------|------|-----------|
| **빌드 도구** | Vite | 빠른 HMR, 가벼운 번들링 |
| **UI 라이브러리** | React 19 | 컴포넌트 기반 SPA |
| **언어** | TypeScript | 타입 안전성, DX |
| **라우팅** | React Router v7 | SPA 클라이언트 라우팅 |
| **스타일링** | Tailwind CSS + shadcn/ui | 빠른 반응형 UI, 일관된 컴포넌트 |
| **상태 관리** | Zustand | 경량, 보일러플레이트 최소화 |
| **인증** | Supabase Auth | JWT, Row Level Security |
| **데이터베이스** | Supabase (PostgreSQL) | 클라이언트 직접 통신, RLS로 보안, 무료 티어 |
| **PWA** | vite-plugin-pwa | 서비스 워커, 오프라인 캐시 |
| **배포** | Vercel (또는 Cloudflare Pages) | 정적 SPA 호스팅, 글로벌 CDN |
| **테스트** | Vitest + Playwright | 유닛/E2E 테스트 |

### 프로젝트 구조 (예상)

```
wordpocket/
├── src/
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DeckList.tsx
│   │   ├── DeckDetail.tsx
│   │   ├── Study.tsx
│   │   └── Stats.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── card/               # 카드 관련 컴포넌트
│   │   ├── deck/               # 덱/폴더 관련 컴포넌트
│   │   ├── study/              # 학습 세션 컴포넌트
│   │   └── layout/             # 레이아웃 (Header, Nav, AuthGuard)
│   ├── lib/
│   │   ├── srs/                # 간격 반복 알고리즘
│   │   │   ├── sm2.ts          # SM-2 구현
│   │   │   └── scheduler.ts    # 스케줄러 로직
│   │   ├── supabase.ts         # Supabase 클라이언트 초기화
│   │   └── utils.ts
│   ├── hooks/                  # 커스텀 React 훅
│   ├── stores/                 # Zustand 스토어
│   ├── types/                  # TypeScript 타입 정의
│   ├── router.tsx              # React Router 설정
│   ├── App.tsx
│   └── main.tsx                # 엔트리 포인트
├── supabase/
│   └── migrations/             # DB 마이그레이션 SQL
├── public/
│   └── icons/
├── tests/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 시스템 아키텍처

```
┌──────────────────────────────────────────────────┐
│                   클라이언트 (SPA)                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │ 모바일 웹  │  │ 데스크톱 웹│  │   PWA     │    │
│  │ (Chrome)  │  │ (Browser) │  │ (홈화면)  │    │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │
│        └───────────────┼───────────────┘          │
│                        │                          │
│         ┌──────────────▼──────────────┐           │
│         │  React + Vite (SPA)         │           │
│         │  ┌────────┐ ┌────────────┐  │           │
│         │  │Zustand  │ │Service     │  │           │
│         │  │Store    │ │Worker      │  │           │
│         │  │(학습상태)│ │(오프라인)  │  │           │
│         │  └────────┘ └────────────┘  │           │
│         └──────────────┬──────────────┘           │
└────────────────────────┼──────────────────────────┘
                         │ HTTPS (Supabase JS SDK)
┌────────────────────────┼──────────────────────────┐
│              Supabase (BaaS)                       │
│         ┌──────────────▼──────────────┐           │
│         │  ┌────────┐ ┌────────────┐  │           │
│         │  │  Auth   │ │ PostgreSQL │  │           │
│         │  │ (인증)  │ │  (데이터)  │  │           │
│         │  └────────┘ └────────────┘  │           │
│         │  ┌────────────────────────┐ │           │
│         │  │  Row Level Security    │ │           │
│         │  │  (사용자별 데이터 격리)  │ │           │
│         │  └────────────────────────┘ │           │
│         └─────────────────────────────┘           │
└───────────────────────────────────────────────────┘

* 별도 백엔드 서버 없음 — Supabase JS SDK로 클라이언트에서 직접 통신
* RLS가 서버 사이드 보안을 대체 (인증된 사용자만 자기 데이터 접근)
```

---

## 데이터 모델

### ER 다이어그램

```
users (Supabase Auth)
  ├── id (UUID, PK)
  ├── email
  └── created_at

folders
  ├── id (UUID, PK)
  ├── user_id (FK → users.id)
  ├── name              -- 폴더명 (예: "영어", "일본어")
  ├── color
  ├── sort_order        -- 정렬 순서
  ├── created_at
  └── updated_at

decks
  ├── id (UUID, PK)
  ├── user_id (FK → users.id)
  ├── folder_id (FK → folders.id, nullable) -- null이면 최상위 덱
  ├── name
  ├── description
  ├── color
  ├── sort_order        -- 폴더 내 정렬 순서
  ├── created_at
  └── updated_at

cards
  ├── id (UUID, PK)
  ├── deck_id (FK → decks.id)
  ├── word              -- 단어
  ├── meaning           -- 뜻
  ├── example           -- 예문 (선택)
  ├── pronunciation     -- 발음 (선택)
  ├── tags              -- text[] 배열
  ├── created_at
  └── updated_at

card_states
  ├── id (UUID, PK)
  ├── card_id (FK → cards.id)
  ├── user_id (FK → users.id)
  ├── status            -- 'new' | 'learning' | 'review' | 'suspended'
  ├── ease_factor       -- 난이도 계수 (기본 2.5)
  ├── interval          -- 현재 간격 (일 단위)
  ├── due_date          -- 다음 복습 예정일
  ├── step_index        -- 학습 단계 인덱스 (learning일 때)
  ├── lapse_count       -- 실패 횟수 (리치 감지용)
  ├── last_reviewed_at
  └── updated_at

review_logs
  ├── id (UUID, PK)
  ├── card_id (FK → cards.id)
  ├── user_id (FK → users.id)
  ├── rating            -- 'again' | 'hard' | 'good' | 'easy'
  ├── interval_before   -- 복습 전 간격
  ├── interval_after    -- 복습 후 간격
  ├── ease_before       -- 복습 전 EF
  ├── ease_after        -- 복습 후 EF
  ├── review_duration   -- 응답 소요 시간 (ms)
  └── reviewed_at

user_settings
  ├── id (UUID, PK)
  ├── user_id (FK → users.id)
  ├── new_cards_per_day  -- 하루 새 카드 수 (기본 20)
  ├── learning_steps     -- 학습 단계 (기본 [1, 10] 분)
  ├── graduating_interval -- 졸업 간격 (기본 1일)
  ├── easy_interval      -- 쉬움 간격 (기본 4일)
  ├── max_interval       -- 최대 간격 (기본 365일)
  ├── leech_threshold    -- 리치 임계값 (기본 5)
  └── updated_at
```

### RLS 정책 (Row Level Security)

```sql
-- 사용자는 자신의 데이터만 접근 가능
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own folders"
  ON folders FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own decks"
  ON decks FOR ALL
  USING (auth.uid() = user_id);

-- cards는 deck 소유자만 접근
CREATE POLICY "Users can CRUD own cards"
  ON cards FOR ALL
  USING (deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid()));

-- card_states, review_logs도 동일 패턴
```

---

## 핵심 알고리즘

### SM-2 간격 반복

```typescript
interface CardState {
  status: 'new' | 'learning' | 'review' | 'suspended';
  easeFactor: number;   // 기본 2.5, 최소 1.3
  interval: number;     // 일 단위
  dueDate: Date;
  stepIndex: number;    // 학습 단계 인덱스
  lapseCount: number;   // 실패 누적 횟수
}

type Rating = 'again' | 'hard' | 'good' | 'easy';

const LEARNING_STEPS = [1, 10]; // 분 단위
const GRADUATING_INTERVAL = 1;  // 일
const EASY_INTERVAL = 4;        // 일
const EASY_BONUS = 1.3;         // Easy 버튼 보너스 배수
const MIN_EASE = 1.3;
const LEECH_THRESHOLD = 5;

function schedule(state: CardState, rating: Rating): CardState {
  const next = { ...state };

  if (state.status === 'new' || state.status === 'learning') {
    // === 학습 중인 카드 ===
    switch (rating) {
      case 'again':
        next.stepIndex = 0;
        next.dueDate = addMinutes(now(), LEARNING_STEPS[0]);
        break;
      case 'hard':
        // 현재 단계 반복
        next.dueDate = addMinutes(now(), LEARNING_STEPS[state.stepIndex]);
        break;
      case 'good':
        if (state.stepIndex >= LEARNING_STEPS.length - 1) {
          // 졸업 → 복습 카드로 전환
          next.status = 'review';
          next.interval = GRADUATING_INTERVAL;
          next.dueDate = addDays(now(), GRADUATING_INTERVAL);
        } else {
          next.stepIndex = state.stepIndex + 1;
          next.dueDate = addMinutes(now(), LEARNING_STEPS[next.stepIndex]);
        }
        break;
      case 'easy':
        // 즉시 졸업 → EASY_INTERVAL로 복습 카드 전환
        next.status = 'review';
        next.interval = EASY_INTERVAL;
        next.easeFactor = state.easeFactor + 0.15;
        next.dueDate = addDays(now(), EASY_INTERVAL);
        break;
    }
    if (next.status !== 'review') {
      next.status = 'learning';
    }

  } else if (state.status === 'review') {
    // === 복습 카드 ===
    switch (rating) {
      case 'again':
        next.lapseCount += 1;
        next.easeFactor = Math.max(MIN_EASE, state.easeFactor - 0.2);
        next.interval = 1; // 간격 리셋
        next.status = 'learning';
        next.stepIndex = 0;
        next.dueDate = addMinutes(now(), LEARNING_STEPS[0]);
        // 리치 감지
        if (next.lapseCount >= LEECH_THRESHOLD) {
          next.status = 'suspended';
        }
        break;
      case 'hard':
        next.easeFactor = Math.max(MIN_EASE, state.easeFactor - 0.15);
        next.interval = Math.round(state.interval * 1.2);
        next.dueDate = addDays(now(), next.interval);
        break;
      case 'good':
        next.interval = Math.round(state.interval * state.easeFactor);
        next.dueDate = addDays(now(), next.interval);
        break;
      case 'easy':
        next.easeFactor = state.easeFactor + 0.15;
        next.interval = Math.round(state.interval * state.easeFactor * EASY_BONUS);
        next.dueDate = addDays(now(), next.interval);
        break;
    }
  }

  // fuzz factor: ±5% 랜덤 변동 (같은 날 추가된 카드 분산)
  if (next.status === 'review' && next.interval > 2) {
    const fuzz = Math.round(next.interval * 0.05);
    next.interval += randomInt(-fuzz, fuzz);
  }

  return next;
}
```

### 학습 세션 카드 큐 구성

```typescript
function buildStudyQueue(deckId: string, userId: string) {
  // 1. 오늘 복습할 카드 (due_date <= today, status = 'review')
  const reviewCards = getReviewDueCards(deckId, userId);

  // 2. 학습 중인 카드 (status = 'learning', due_date <= now)
  const learningCards = getLearningDueCards(deckId, userId);

  // 3. 새 카드 (status = 'new', 오늘 한도 내)
  const newCards = getNewCards(deckId, userId, dailyLimit);

  // 우선순위: 학습 중 > 복습 > 새 카드
  return [...learningCards, ...reviewCards, ...newCards];
}
```

---

## 화면 설계

### 주요 화면 흐름

```
[랜딩 페이지] → [로그인/회원가입] → [대시보드]
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
             [폴더/덱 목록]      [학습 세션]          [통계]
                    │                   │
               [덱 상세]         [카드 학습 화면]
              (카드 목록)         (뒤집기 + 4단계 평가)
                    │
              [카드 추가/수정]
```

### 각 화면 설명

#### 1. 랜딩 페이지 (`/`)
- WordPocket 소개, 핵심 기능 설명
- CTA: 시작하기 버튼 → 회원가입/로그인

#### 2. 대시보드 (`/dashboard`)
- 오늘의 학습 요약: 복습 예정 N장, 새 카드 N장
- 연속 학습일(Streak) 배지
- 단어장 카드 그리드 (각 단어장의 오늘 학습량 표시)
- 빠른 학습 시작 버튼

#### 3. 폴더/덱 목록 (`/decks`)
- 폴더 아코디언 + 덱 카드형 레이아웃
  - 폴더 행: 폴더명, 하위 덱 수, 전체 복습 수 합산
  - 폴더 펼치면 하위 덱 카드 표시
  - 폴더에 속하지 않은 덱은 최상위에 표시
- 각 덱 카드: 이름, 카드 수, 진행률 바, 오늘 복습 수
- 새 폴더/덱 추가 FAB 버튼

#### 4. 덱 상세 (`/decks/[id]`)
- 덱 정보 헤더 (이름, 설명, 소속 폴더, 진행률)
- 카드 목록 (단어 | 뜻 | 상태 | 다음 복습일)
- 검색/필터 바
- 카드 추가/수정/삭제
- CSV 가져오기 버튼
- 학습 시작 버튼

#### 5. 학습 세션 (`/study/[deckId]`)
- 전체 화면 학습 모드
- 진행률 바 (완료 / 남은 카드)
- 카드 앞면: 단어 (큰 글씨, 가운데 정렬)
- 탭/클릭 → 카드 뒤집기 애니메이션
- 카드 뒷면: 뜻 + 예문
- 하단 4개 버튼: Again (빨강) / Hard (주황) / Good (초록) / Easy (파랑)
- 각 버튼에 다음 복습 시간 표시 ("1분", "10분", "1일", "4일")
- 세션 완료 시 결과 요약 모달

#### 6. 통계 (`/stats`)
- 학습 히트맵 캘린더 (GitHub 잔디 스타일)
- 오늘/이번 주/이번 달 복습 수
- 단어장별 숙지율 차트
- 연속 학습일 기록

---

## 개발 로드맵

### Phase 1: MVP (4주)

#### Week 1 — 프로젝트 세팅 & 인증
- [ ] Vite + React 19 + TypeScript + Tailwind CSS + shadcn/ui 초기 설정
- [ ] React Router v7 라우팅 구성
- [ ] Supabase 프로젝트 생성 및 클라이언트 연결
- [ ] DB 스키마 마이그레이션 (Supabase SQL)
- [ ] Supabase Auth 연동 (이메일/비밀번호)
- [ ] 로그인/회원가입 페이지 구현
- [ ] AuthGuard 컴포넌트 (보호 라우트)
- [ ] 기본 레이아웃 (헤더, 네비게이션, 반응형)

#### Week 2 — 폴더/단어장 & 카드 CRUD
- [ ] 폴더 CRUD API + UI (목록, 생성, 수정, 삭제)
- [ ] 덱(단어장) CRUD API + UI (목록, 생성, 수정, 삭제, 폴더 배정)
- [ ] 카드 CRUD API + UI (목록, 생성, 수정, 삭제)
- [ ] 단어장 상세 페이지 (카드 리스트, 검색)
- [ ] CSV 가져오기 기능
- [ ] RLS 정책 적용 및 테스트

#### Week 3 — 학습 세션 & SM-2
- [ ] SM-2 스케줄러 구현 (`lib/srs/sm2.ts`)
- [ ] 스케줄러 유닛 테스트
- [ ] 학습 세션 페이지 UI (카드 뒤집기, 4버튼 평가: Again/Hard/Good/Easy)
- [ ] 학습 큐 구성 로직 (학습 중 > 복습 > 새 카드)
- [ ] 복습 로그 기록 API
- [ ] 세션 완료 요약 화면

#### Week 4 — 대시보드, 통계, PWA
- [ ] 대시보드 페이지 (오늘의 학습, Streak, 단어장 요약)
- [ ] 기본 통계 페이지 (학습 히트맵, 복습 수)
- [ ] PWA 설정 (manifest, 서비스 워커, 아이콘)
- [ ] 반응형 디자인 마무리 (모바일 최적화)
- [ ] E2E 테스트 (핵심 플로우)
- [ ] Vercel (또는 Cloudflare Pages) 배포 및 도메인 연결

### Phase 2: 확장 기능 (3주)

- [ ] OAuth 소셜 로그인 (카카오, Google) 추가
- [ ] 역방향 카드 (뜻 → 단어)
- [ ] 태그 시스템
- [ ] 리치 감지 및 알림
- [ ] 학습 통계 고도화 (간격 분포, 난이도 분포 그래프)
- [ ] 단어장 공유 (공개 단어장 탐색/복제)
- [ ] TTS 발음 재생 (Web Speech API)
- [ ] 다크 모드

### Phase 3: 고도화 (추후)

- [ ] FSRS 알고리즘 도입
- [ ] 커스텀 학습 세션
- [ ] AI 예문 자동 생성 (Claude API)
- [ ] Push 알림 (학습 리마인더)
- [ ] 내보내기 (CSV, JSON)

---

## 라이선스

MIT
