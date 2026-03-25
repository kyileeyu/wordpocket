# 다외워봄 — Integrated Design System

> Concept "Soft Focus" · v2.1

---

## 1. Design Philosophy

**Core Metaphor:** 부드러운 초점 — 라벤더 모노크로매틱 톤 위에서 단어가 자연스럽게 떠오른다.

다외워봄은 현대적이고 깔끔한 학습 도구다. 울트라 라운드 컴포넌트와 라벤더 팔레트가 편안한 학습 환경을 만든다. 모든 시각 요소는 "이 요소가 학습에 도움이 되는가?"라는 질문을 통과해야 한다.

### Design Principles

- **Content-first.** UI는 단어를 위한 무대다. 장식은 최소화하되, 위계는 명확히.
- **Long-session comfort.** 30분 이상 학습해도 시각 피로가 없어야 한다.
- **Soft & modern.** 라벤더 톤의 부드러움과 pill shape의 현대적 감성.
- **Monochromatic depth.** 하나의 색상(라벤더)의 농도 차이로 깊이를 표현한다.

---

## 2. Color System

### 2.1 Background Palette

| Token          | Hex       | 용도                                 |
| -------------- | --------- | ------------------------------------ |
| `bg-primary`   | `#FAFAFE` | 페이지 배경 (가장 바깥)              |
| `bg-elevated`  | `#FFFFFF` | 카드 배경, 메인 surface              |
| `bg-subtle`    | `#F3F2FA` | 인풋 배경, 서브 카드, 뱃지 배경      |

### 2.2 Text Palette

| Token            | Hex       | 용도                                 |
| ---------------- | --------- | ------------------------------------ |
| `text-primary`   | `#1A1A2E` | 본문 텍스트, 주요 아이콘             |
| `text-secondary` | `#6E6B7B` | 보조 텍스트, placeholder, 라벨       |
| `text-tertiary`  | `#B8B5C6` | 힌트 텍스트, 비활성 아이콘           |

### 2.3 Accent Colors (Lavender)

| Token             | Hex       | 용도                                |
| ----------------- | --------- | ----------------------------------- |
| `accent`          | `#7C6CE7` | 주요 액션 버튼, 활성 상태, CTA      |
| `accent-hover`    | `#6A58D6` | 버튼 호버 상태                      |
| `accent-light`    | `#A99BF0` | Easy 버튼, 보조 accent              |
| `accent-lighter`  | `#D4CEFA` | 디바이더, 보더 강조                  |
| `accent-bg`       | `#EDEAFC` | accent 배경 (뱃지, 태그)            |
| `accent-bg-soft`  | `#F3F2FA` | 연한 accent 배경                    |

### 2.4 Semantic Colors

| Token        | Hex       | 용도                              |
| ------------ | --------- | --------------------------------- |
| `danger`     | `#E55B5B` | 삭제, 에러, 경고                  |
| `danger-bg`  | `#FDECEC` | danger 배경                       |
| `again`      | `#E55B7A` | Again 버튼 (로즈)                 |
| `again-bg`   | `#FDE8EE` | Again 배경                        |

### 2.5 UI Colors

| Token           | Hex       | 용도             |
| --------------- | --------- | ---------------- |
| `border`        | `#E8E6F0` | 카드 외곽선      |
| `border-subtle` | `#F0EEF6` | 카드 내부 구분선 |

### 2.6 Gradient Tokens

| Token                  | Value                                                       | 용도              |
| ---------------------- | ----------------------------------------------------------- | ----------------- |
| `gradient-brand-soft`  | `linear-gradient(135deg, #EDEAFC 0%, #F3F2FA 100%)`        | 홈 피처드 카드    |
| `gradient-brand-vivid` | `linear-gradient(135deg, #7C6CE7 0%, #A99BF0 50%, #D4CEFA 100%)` | Welcome 배경 |

### 2.7 Interactive State Colors (Response Buttons)

| 상태          | 배경        | 텍스트       | 보더            |
| ------------- | ----------- | ------------ | --------------- |
| Again (틀림)  | `again-bg`  | `again`      | `again/30`      |
| Hard (어려움) | `bg-subtle` | `text-secondary` | `border`    |
| Good (적절)   | `accent-bg` | `accent`     | `accent/30`     |
| Easy (쉬움)   | `accent-bg-soft` | `accent-light` | `accent-lighter` |

### 2.8 Color 사용 원칙

- **모노크로매틱 우선:** 라벤더 한 색상의 농도 차이로 대부분의 UI를 표현한다. Again만 로즈 톤.
- **배경 3단계:** `bg-primary` → `bg-elevated` → `bg-subtle`. 중첩으로 깊이를 만든다.
- **컬러 면적 비율:** bg 계열 85% + text 계열 10% + accent/danger 5%.

---

## 3. Typography

### 3.1 Font Stack

| Role    | Font                     | Fallback                            | 용도                            |
| ------- | ------------------------ | ----------------------------------- | ------------------------------- |
| Display | **Outfit**               | -apple-system, sans-serif           | 단어 카드의 영단어, 섹션 타이틀 |
| Body    | **Outfit**               | -apple-system, sans-serif           | 본문, 뜻 설명, UI 레이블        |
| Korean  | **Pretendard Variable**  | Pretendard, -apple-system, sans-serif | 한글 뜻, 한글 UI              |
| Mono    | **JetBrains Mono**       | Menlo, monospace                    | 발음기호, 숫자 통계, 타임스탬프 |

### 3.2 Type Scale

| Token         | Size | Weight        | Line-height | CSS Utility        | 용도                                      |
| ------------- | ---- | ------------- | ----------- | ------------------ | ----------------------------------------- |
| `display-xl`  | 32px | Outfit 700    | 1.2         | `typo-display-xl`  | 브랜드 타이틀 (Welcome)                   |
| `display-lg`  | 30px | Outfit 700    | 1.2         | `typo-display-lg`  | 학습 카드 — 영단어 (앞면)                 |
| `display-md`  | 20px | Outfit 600    | 1.25        | `typo-display-md`  | 섹션 타이틀 (오늘의 복습)                 |
| `stat-value`  | 18px | Outfit 700    | 1.2         | `typo-stat-value`  | 통계 수치 (StatBox)                       |
| `body-lg`     | 14px | Outfit 400    | 1.6         | `typo-body-lg`     | 한글 뜻, 설명 텍스트                      |
| `body-md`     | 13px | Outfit 400    | 1.5         | `typo-body-md`     | 일반 본문                                 |
| `body-sm`     | 12px | Outfit 500    | 1.4         | `typo-body-sm`     | 버튼 레이블, 캡션                         |
| `caption`     | 11px | Outfit 400    | 1.4         | `typo-caption`     | 보조 정보, 그리팅                         |
| `mono-md`     | 12px | JetBrains 400 | 1.4         | `typo-mono-md`     | 발음기호, 통계 수치                       |
| `mono-sm`     | 10px | JetBrains 400 | 1.4         | `typo-mono-sm`     | 상태바, 메타 정보                         |
| `overline`    | 8px  | JetBrains 400 | 1.2         | `typo-overline`    | 섹션 라벨 (letter-spacing 2px, uppercase) |
| `nav-label`   | 9px  | Outfit 500    | 1.2         | `typo-nav-label`   | 하단 네비게이션 라벨                      |

> **`@utility` 클래스 사용법:** 각 `typo-*` 클래스는 font-family, font-size, font-weight, line-height(+ letter-spacing)를 한 번에 설정하는 composite utility다. `src/index.css`에 `@utility` 블록으로 정의되어 있다.

### 3.3 Typography 원칙

- **영단어는 Outfit Bold.** 산세리프의 깔끔함과 대담한 weight로 단어가 돋보인다.
- **한글은 Pretendard Variable 400.** 가변폰트로 부드러운 렌더링.
- **발음기호는 JetBrains Mono.** 모노스페이스가 IPA 기호의 정렬과 가독성을 보장한다.
- **letter-spacing:** 본문은 기본값. overline/label에만 양수 letter-spacing 적용.

---

## 4. Border Radius & Elevation

### 4.1 Radius Scale

| Token         | Value    | 용도                                       |
| ------------- | -------- | ------------------------------------------ |
| `radius-sm`   | 8px      | 히트맵 셀, 작은 요소                       |
| `radius-md`   | 12px     | 인풋 필드, 드롭다운 아이템                 |
| `radius-lg`   | 16px     | 응답 버튼                                  |
| `radius-xl`   | 20px     | 카드, 리스트 아이템, 스탯 박스, 드롭다운    |
| `radius-2xl`  | 24px     | 단어 카드                                  |
| `radius-3xl`  | 32px     | 다이얼로그                                 |
| `radius-full` | 9999px   | 버튼(pill), FAB, 뱃지, 토글 트랙, TopBar 아이콘 |

### 4.2 Radius 원칙

- **울트라 라운드가 기본.** 모든 버튼은 pill shape(`rounded-full`).
- **중첩 radius 법칙:** 바깥 > 안쪽. Dialog(32px) > 카드(24px) > 리스트(20px) > 인풋(12px).
- **카드와 리스트 아이템:** `rounded-[20px]`로 통일. 독립 카드 스택 레이아웃 (border-b 구분선 없음).

### 4.3 Shadow Scale

| Token        | Value                              | 용도                            |
| ------------ | ---------------------------------- | ------------------------------- |
| `shadow-sm`  | `0 1px 3px rgba(26,26,46,0.04)`   | 호버 상태의 카드                |
| `shadow-soft`| `0 2px 8px rgba(26,26,46,0.04)`   | 폴더/덱 카드 기본               |
| `shadow-md`  | `0 4px 12px rgba(26,26,46,0.06)`  | 단어 카드, 플로팅 요소          |
| `shadow-lg`  | `0 12px 32px rgba(26,26,46,0.08)` | 모달, FAB                       |

### 4.4 Shadow 원칙

- **그림자 색은 navy 기반.** `rgba(26,26,46,...)`. 순흑 그림자 사용 금지.
- **독립 카드는 shadow-soft.** 리스트 아이템이 떠 있는 느낌.
- **단어 카드만 shadow-md.** 가장 중요한 요소임을 시각적으로 강조.

### 4.5 Border Style

| Token            | Value               | 용도             |
| ---------------- | ------------------- | ---------------- |
| `border-default` | `1px solid #E8E6F0` | 카드 외곽선      |
| `border-subtle`  | `1px solid #F0EEF6` | 카드 내부 구분선 |
| `border-focus`   | `2px solid #7C6CE7` | 인풋 포커스 상태 |

**Divider:** 카드 내 의미 구분선은 36px width, 3px height, `accent-lighter(#D4CEFA)`, rounded-full, 가운데 정렬.

---

## 5. Layout System

### 5.1 Grid & Spacing

| Token      | Value | 용도                                |
| ---------- | ----- | ----------------------------------- |
| `space-2`  | 2px   | 미세 조정                           |
| `space-4`  | 4px   | 아이콘과 텍스트 사이                |
| `space-6`  | 6px   | 버튼 그룹 gap, 스탯 필 gap          |
| `space-10` | 10px  | 카드 간 간격 (mb-[10px])           |
| `space-14` | 14px  | 카드 내부 padding                   |
| `space-20` | 20px  | 카드 내부 padding (측면), 좌우 margin |
| `space-24` | 24px  | 카드 내부 padding (큰)              |
| `space-32` | 32px  | 섹션 간 간격                        |

### 5.2 Screen Layout (Mobile-first)

```
┌─────────────────────────────┐
│  Status Bar                 │ ← 고정
├─────────────────────────────┤
│  Header Area                │ ← 20px 좌우 패딩
│  - Greeting (caption)       │
│  - Title (display-md)       │ ← 상단에서 12px
├─────────────────────────────┤
│  Stats Row                  │ ← 가로 wrap, 6px gap
│  ┌──────┐ ┌──────┐          │
│  │ Pill │ │ Pill │          │ ← radius-full, accent-bg
│  └──────┘ └──────┘          │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │    Word Card          │  │ ← radius-2xl(24px)
│  │                       │  │    20px 좌우 margin
│  │    Ephemeral          │  │ ← display-lg, Outfit
│  │    /ɪˈfɛmərəl/       │  │ ← mono-md, text-secondary
│  │    ━━━━               │  │ ← 36px, accent-lighter
│  │    덧없는, 순간적인    │  │ ← body-lg, text-primary
│  │                       │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│  Button Row                 │ ← 6px gap, 균등 분할
│  ┌─────┐┌─────┐┌─────┐┌───┐│
│  │Again││Hard ││Good ││Easy│ ← radius-lg(16px)
│  └─────┘└─────┘└─────┘└───┘│    border 1.5px
├─────────────────────────────┤
│  Bottom Nav                 │ ← accent dot indicator
└─────────────────────────────┘
```

### 5.3 Layout 원칙

- **화면 좌우 기본 margin은 20px.** 모바일에서 콘텐츠가 엣지에 붙지 않는다.
- **독립 카드 스택:** 리스트 아이템은 border-b 대신 개별 카드(rounded-[20px], shadow-soft)로 표현.
- **데스크톱 확장 시:** max-width 480px(sm:640px, lg:768px), 중앙 정렬. 바깥은 bg-primary.

### 5.4 Responsive Breakpoints

| Breakpoint    | Width     | 동작                                         |
| ------------- | --------- | -------------------------------------------- |
| Mobile (기본) | ~480px    | 풀스크린, 카드 좌우 20px margin              |
| Tablet        | 481~640px | max-width 640px, 중앙 정렬, +2px side padding |
| Desktop       | 641px+    | max-width 768px, 중앙 정렬, +4px side padding |

---

## 6. Component Anatomy

### 6.1 Word Card (핵심 컴포넌트)

```
Container: radius-2xl(24px), border-default, shadow-md
Padding: 28px 20px
Alignment: center

├── Word: display-lg(30px), Outfit 500, text-primary
│   margin-bottom: 4px
├── Phonetic: mono-md, JetBrains Mono, text-secondary
│   margin-bottom: 14px
├── Divider: 36px × 3px, accent-lighter, rounded-full, center
│   margin-bottom: 14px
└── Meaning: body-lg, Pretendard 400, text-primary
```

- 카드 배경: `bg-elevated(#FFFFFF)`
- **앞면(단어만):** 단어 30px. "탭하여 확인" 힌트 text-tertiary.
- **뒷면(단어+뜻):** 단어 26px. 디바이더 아래 뜻. 예문 italic 11px text-secondary.

### 6.2 Response Buttons

```
Container: flex row, gap 6px, padding 0 20px
Each button: flex 1, radius-lg(16px), padding 10px, border 1.5px
Font: 10px, weight 600
Text: center aligned
```

- 4개 버튼: Again(rose) / Hard(neutral) / Good(accent 강조) / Easy(accent-soft).
- 각 버튼 하단에 다음 복습 간격 표시 (8px, opacity 70%).

### 6.3 Stat Pill

```
Container: radius-full(pill), padding 6px 12px
Background: accent-bg(#EDEAFC)
Font: 10px, Outfit, medium
Layout: flex row, align-center, gap 5px
```

- 숫자(strong)는 text-primary, 라벨은 text-secondary.

### 6.4 Input Field

```
Container: radius-md(12px), bg-subtle background, border-default
Padding: 11px 14px
Height: 44px
Font: Outfit 13px
```

- 라벨: 인풋 위 고정, overline 스타일 (JetBrains Mono 8px).
- 포커스: accent border + 2px outer ring (accent/10).

### 6.5 Navigation Bar (Bottom)

```
Container: 높이 56px (Safe area 포함), 상단 1px border
Background: bg-elevated
Layout: 3열 균등 분할
Each item: icon 20px + label 9px
Active: accent color + dot indicator / Inactive: text-tertiary
Icons: Lucide — Home(house), Stats(bar-chart-2), Settings(settings-2)
```

- 활성 탭 아래에 4px accent 원형 dot indicator.
- 학습 세션(Study) 중에는 숨김 — 몰입 UI.

### 6.6 Top Bar

```
Container: padding 8px 20px
Layout: flex, space-between, align-center
Back/Close button: 44×44px, radius-full, bg-subtle
Title: 13px, weight 600, text-primary
```

- 버튼 아이콘: 18×18px, text-secondary → hover text-primary.
- 학습 세션: X(닫기) + 카운터(JetBrains 11px) + 편집/리셋 버튼.

### 6.7 FAB (Floating Action Button)

```
Container: 48×48px, radius-full(pill), accent bg, white color
Position: absolute, bottom 72px, right 20px
Shadow: shadow-lg
Icon: + (22px, weight 1.5)
```

### 6.8 Progress Bar

```
Track: height 8px, bg-subtle, radius-full
Fill: accent color, radius-full
Container padding: 0 20px, margin-bottom 12px
```

- 학습 세션에서 완료/전체 비율 표시.

### 6.9 Dialog

```
Container: radius-3xl(32px), bg-elevated, shadow-lg
Max-width: 340px (sm: 400px)
Padding: 24px
Overlay: text-primary/40
```

### 6.10 Dropdown Menu

```
Container: radius-xl(20px), bg-elevated, border-default, shadow-md
Padding: 4px
Item: radius-md(12px), hover bg-subtle
```

### 6.11 Toggle (Settings)

```
Track: 44×26px, radius-full
Thumb: 20×20px, white, radius-full
On: accent background / Off: text-tertiary background
```

---

## 7. Iconography & Emoji

### 7.1 아이콘 시스템

- **아이콘 라이브러리:** Lucide Icons.
- **아이콘 스타일:** 기본 2px stroke. 활성 시 2.5px.
- **아이콘 사이즈:** 20px (네비게이션), 18px (TopBar 버튼), 14px (인라인).
- **아이콘 컬러:** 기본 `text-secondary`, 활성 `accent`, 호버 `text-primary`.

### 7.2 Emoji 사용 정책

| 허용                               | 불허                    |
| ---------------------------------- | ----------------------- |
| 스탯 필 내 감정/상태 표현 (📖, 🔥) | 내비게이션 아이콘 대체  |
| 빈 상태(empty state) 일러스트 보조 | 버튼 아이콘 대체        |
| 축하/격려 메시지 내 (🎉)           | 로고/브랜딩 요소        |

---

## 8. Motion & Animation

### 8.1 Timing

| Token             | Value                               | 용도                        |
| ----------------- | ----------------------------------- | --------------------------- |
| `duration-fast`   | 120ms                               | 버튼 호버/프레스, 토글      |
| `duration-normal` | 200ms                               | 카드 전환, 상태 변경        |
| `duration-slow`   | 350ms                               | 페이지 전환, 모달 진입/퇴장 |

### 8.2 Animation 원칙

- **전환은 부드럽게.** Tailwind `transition-colors`, `transition-shadow` 활용.
- **절대 사용하지 않는 것:** 바운스, 지터, 반복 pulse, 회전.
- **`prefers-reduced-motion: reduce`** 시 모든 animation을 즉시 완료로 변경.

---

## 9. Do & Don't

### DO

- 라벤더 한 색상의 농도 차이로 깊이를 표현한다.
- 버튼은 항상 pill shape(rounded-full).
- 리스트 아이템은 독립 카드(rounded-[20px], shadow-soft)로 표현한다.
- 단어 카드에 충분한 여백을 준다 — 카드 안팎 모두.
- TopBar 버튼은 44×44px 원형(bg-subtle)으로 통일한다.

### DON'T

- 순흑(`#000`) 텍스트/배경을 사용하지 않는다.
- 시맨틱 컬러를 남발하지 않는다 — Again만 로즈, 나머지는 라벤더 농도 차이.
- border-b 구분선 리스트를 쓰지 않는다 — 독립 카드 스택을 사용한다.
- 한 화면에 3개 이상 emoji를 넣지 않는다.
- 사각형 버튼을 쓰지 않는다 — 모든 버튼은 pill.
- 12px 미만의 텍스트를 본문에 사용하지 않는다 (mono 메타 정보 제외).

---

## 10. Dark Mode (확장용)

| Light                    | Dark             |
| ------------------------ | ---------------- |
| bg-primary `#FAFAFE`     | `#1A1A2E`        |
| bg-elevated `#FFFFFF`    | `#252540`        |
| bg-subtle `#F3F2FA`      | `#2E2D4A`        |
| text-primary `#1A1A2E`   | `#E8E6F0`        |
| text-secondary `#6E6B7B` | `#8E8B9B` (유지) |
| text-tertiary `#B8B5C6`  | `#4A4860`        |
| accent `#7C6CE7`         | `#7C6CE7` (유지) |
| border `#E8E6F0`         | `#3A3856`        |

- 다크 모드에서도 완전한 블랙(`#000`)은 사용하지 않는다. 가장 어두운 배경은 navy 기반.
- Accent/danger 컬러는 라이트/다크 동일하게 유지.
