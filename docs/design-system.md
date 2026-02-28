# WordPocket — Integrated Design System

> Concept A "Ink & Paper" · Phase 1 MVP · v1.0

---

## 1. Design Philosophy

**Core Metaphor:** 종이 위의 잉크 — 학습의 원형인 '읽고 쓰는 행위'로 돌아간다.

WordPocket은 디지털 학습 도구이지만, 사용자가 느끼는 감각은 아날로그에 가깝다. 과하게 꾸미지 않는다. 도구는 조용해야 하고, 콘텐츠(단어)가 주인공이어야 한다. 모든 시각 요소는 "이 요소가 학습에 도움이 되는가?"라는 질문을 통과해야 한다.

### Design Principles

- **Content-first.** UI는 단어를 위한 무대다. 장식은 최소화하되, 위계는 명확히.
- **Long-session comfort.** 30분 이상 학습해도 시각 피로가 없어야 한다.
- **Quiet confidence.** 화려하지 않지만 싸 보이지 않는. 절제된 고급감.
- **Analog warmth.** 차가운 디지털이 아닌, 종이와 잉크의 촉각적 따뜻함.

---

## 2. Color System

### 2.1 Primary Palette

| Token        | Hex       | 용도                                     |
| ------------ | --------- | ---------------------------------------- |
| `ink`        | `#1A1715` | 본문 텍스트, 주요 아이콘                 |
| `parchment`  | `#FDFCF9` | 카드 배경, 메인 surface                  |
| `canvas`     | `#FAF9F6` | 페이지 배경 (parchment보다 한 톤 어두움) |
| `sepia`      | `#8A7E6D` | 보조 텍스트, placeholder, 비활성 상태    |
| `dust`       | `#D4CFC4` | 구분선, 보더, subtle UI 요소             |
| `warm-white` | `#F7F5F0` | 폰 프레임, 모달 배경                     |

### 2.2 Semantic Colors

| Token   | Hex       | 용도                              |
| ------- | --------- | --------------------------------- |
| `moss`  | `#3A6B4A` | 긍정 — Good 버튼, 성공, 정답      |
| `brick` | `#8B4A4A` | 부정 — Again 버튼, 오답, 경고     |
| `oak`   | `#6B5F4F` | 중립 — Hard 버튼, 주의            |
| `slate` | `#3A4A6B` | 정보 — Easy 버튼, 링크, 보조 액션 |

### 2.3 Interactive State Colors

| 상태          | 배경 (bg)  | 텍스트    |
| ------------- | ---------- | --------- |
| Again (틀림)  | `#F5E6E6`  | `#8B4A4A` |
| Hard (어려움) | `#F0EBE3`  | `#6B5F4F` |
| Good (적절)   | `#E3EEE6`  | `#3A6B4A` |
| Easy (쉬움)   | `#E3E8EE`  | `#3A4A6B` |

### 2.4 UI Colors

| Token           | Hex       | 용도             |
| --------------- | --------- | ---------------- |
| `badge-bg`      | `#EEE9DF` | 스탯 필, 뱃지 배경 |
| `border`        | `#E8E3D9` | 카드 외곽선      |
| `border-subtle` | `#EEEAE2` | 카드 내부 구분선 |
| `ink-light`     | `#3A3632` | 단어 카드 뜻 텍스트 |

### 2.5 Color 사용 원칙

- **배경은 절대 순백(`#FFFFFF`)을 쓰지 않는다.** 항상 미세하게 따뜻한 톤을 유지한다. 가장 밝은 배경은 `parchment(#FDFCF9)`.
- **텍스트는 절대 순흑(`#000000`)을 쓰지 않는다.** 가장 어두운 텍스트는 `ink(#1A1715)`.
- **컬러 면적 비율:** parchment/canvas 85% + ink/sepia 10% + semantic color 5%. 색이 과하게 튀면 안 된다.
- **다크 모드 대응 시:** ink ↔ parchment를 반전하되, 세피아 톤은 유지. 완전한 블랙(`#000`)이 아니라 `#1A1715` 기반 다크.

---

## 3. Typography

### 3.1 Font Stack

| Role    | Font                                 | Fallback                  | 용도                            |
| ------- | ------------------------------------ | ------------------------- | ------------------------------- |
| Display | **Fraunces** (Optical size variable) | Georgia, serif            | 단어 카드의 영단어, 섹션 타이틀 |
| Body    | **Instrument Sans**                  | -apple-system, sans-serif | 본문, 뜻 설명, UI 레이블        |
| Korean  | **Noto Sans KR**                     | Apple SD Gothic Neo       | 한글 뜻, 한글 UI                |
| Mono    | **Space Mono**                       | Menlo, monospace          | 발음기호, 숫자 통계, 타임스탬프 |

### 3.2 Type Scale

| Token        | Size | Weight         | Line-height | 용도                                      |
| ------------ | ---- | -------------- | ----------- | ----------------------------------------- |
| `display-lg` | 28px | Fraunces 500   | 1.2         | 학습 카드 — 영단어                        |
| `display-md` | 22px | Fraunces 500   | 1.25        | 섹션 타이틀 (오늘의 복습)                 |
| `body-lg`    | 15px | Instrument 400 | 1.6         | 한글 뜻, 설명 텍스트                      |
| `body-md`    | 13px | Instrument 400 | 1.5         | 일반 본문                                 |
| `body-sm`    | 12px | Instrument 500 | 1.4         | 버튼 레이블, 캡션                         |
| `caption`    | 11px | Instrument 400 | 1.4         | 보조 정보, 그리팅                         |
| `mono-md`    | 12px | Space Mono 400 | 1.4         | 발음기호, 통계 수치                       |
| `mono-sm`    | 10px | Space Mono 400 | 1.4         | 상태바, 메타 정보                         |
| `overline`   | 10px | Space Mono 400 | 1.2         | 섹션 라벨 (letter-spacing 3px, uppercase) |

### 3.3 Typography 원칙

- **영단어는 반드시 Fraunces.** 학습의 주인공인 단어가 시각적으로도 가장 인상적이어야 한다.
- **한글은 Noto Sans KR 400.** 뜻 풀이는 읽기 쉬움이 최우선. 절대 세리프 한글 폰트를 쓰지 않는다.
- **발음기호는 Space Mono.** 모노스페이스가 IPA 기호의 정렬과 가독성을 보장한다.
- **letter-spacing:** 본문은 기본값. overline/label에만 양수 letter-spacing 적용. 한글에는 letter-spacing을 추가하지 않는다.

---

## 4. Border Radius & Elevation

### 4.1 Radius Scale

| Token         | Value  | 용도                                  |
| ------------- | ------ | ------------------------------------- |
| `radius-none` | 0px    | 구분선, full-bleed 요소               |
| `radius-sm`   | 8px    | 인풋 필드, 작은 토글                  |
| `radius-md`   | 12px   | 버튼(Again/Hard/Good/Easy), 작은 카드 |
| `radius-lg`   | 16px   | 단어 카드, 메인 콘텐츠 카드           |
| `radius-xl`   | 20px   | 폰 스크린 이너, 모달, 바텀시트        |
| `radius-2xl`  | 32px   | 폰 프레임 아우터, 풀 라운드 컨테이너  |
| `radius-full` | 9999px | 필 태그, 스탯 뱃지, 토글 트랙         |

### 4.2 Radius 원칙

- **중첩 카드의 radius 법칙:** 바깥 컨테이너 radius > 안쪽 컨테이너 radius. 항상 최소 4px 차이를 둔다.
  예: 폰 프레임(32px) > 스크린(20px) > 카드(16px) > 버튼(12px).
- **큰 면적일수록 큰 radius.** 작은 요소에 과도한 radius를 주면 뭉개져 보인다.
- **사각형과 라운드의 혼용 금지.** 같은 위계의 요소들은 동일한 radius를 공유한다.
- **Pill shape(`radius-full`)은 정보성 태그에만.** 액션 버튼에는 사용하지 않는다. Again/Hard/Good/Easy 버튼은 `radius-md(12px)`.

### 4.3 Shadow Scale

| Token       | Value                             | 용도                            |
| ----------- | --------------------------------- | ------------------------------- |
| `shadow-none` | none                            | 대부분의 UI 요소 (flat 기본)    |
| `shadow-sm` | `0 1px 3px rgba(26,23,21,0.04)`   | 호버 상태의 카드, 드롭다운      |
| `shadow-md` | `0 4px 12px rgba(26,23,21,0.06)`  | 단어 카드, 플로팅 요소          |
| `shadow-lg` | `0 12px 32px rgba(26,23,21,0.08)` | 모달, 바텀시트                  |
| `shadow-xl` | `0 40px 80px rgba(26,23,21,0.12)` | 목업 폰 프레임 (프레젠테이션용) |

### 4.4 Shadow 원칙

- **기본은 flat.** 그림자 대신 배경색 차이와 border로 위계를 표현한다.
- **그림자 색은 ink 기반.** 절대 순흑 그림자를 쓰지 않는다. `rgba(26,23,21,...)`.
- **단어 카드만 shadow-md.** 가장 중요한 요소임을 시각적으로 들어올린다.

### 4.5 Border Style

| Token            | Value               | 용도             |
| ---------------- | ------------------- | ---------------- |
| `border-default` | `1px solid #E8E3D9` | 카드 외곽선      |
| `border-subtle`  | `1px solid #EEEAE2` | 카드 내부 구분선 |
| `border-focus`   | `2px solid #1A1715` | 인풋 포커스 상태 |

**Divider:** 카드 내 의미 구분선은 40px width, 1px height, dust(`#D4CFC4`) 색상, 가운데 정렬. 전체 너비 구분선은 사용하지 않는다.

---

## 5. Layout System

### 5.1 Grid & Spacing

| Token      | Value | 용도                                |
| ---------- | ----- | ----------------------------------- |
| `space-2`  | 2px   | 미세 조정                           |
| `space-4`  | 4px   | 아이콘과 텍스트 사이                |
| `space-8`  | 8px   | 관련 요소 간 간격 (버튼 그룹 gap)   |
| `space-12` | 12px  | 카드 내부 요소 간                   |
| `space-16` | 16px  | 섹션 내 그룹 간                     |
| `space-20` | 20px  | 카드 내부 padding (측면)            |
| `space-24` | 24px  | 화면 좌우 margin, 카드 내부 padding |
| `space-32` | 32px  | 섹션 간 간격                        |
| `space-40` | 40px  | 대형 섹션 분리                      |

### 5.2 Screen Layout (Mobile-first)

```
┌─────────────────────────────┐
│  Status Bar (mono-sm)       │ ← 고정, 12px 좌우 패딩
├─────────────────────────────┤
│  Header Area                │ ← 24px 좌우 패딩
│  - Greeting (caption)       │
│  - Title (display-md)       │ ← 상단에서 20px
├─────────────────────────────┤
│  Stats Row                  │ ← 가로 스크롤 가능, 8px gap
│  ┌──────┐ ┌──────┐          │
│  │ Pill │ │ Pill │          │ ← radius-full, 내부 8px 14px
│  └──────┘ └──────┘          │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │    Word Card          │  │ ← radius-lg(16px)
│  │                       │  │    24px 좌우 margin
│  │    Ephemeral          │  │ ← display-lg, Fraunces
│  │    /ɪˈfɛmərəl/       │  │ ← mono-md, sepia color
│  │    ─────              │  │ ← 40px width, dust color
│  │    덧없는, 순간적인    │  │ ← body-lg, ink color
│  │                       │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│  Button Row                 │ ← 8px gap, 균등 분할
│  ┌─────┐┌─────┐┌─────┐┌───┐│
│  │Again││Hard ││Good ││Easy│ ← radius-md(12px)
│  └─────┘└─────┘└─────┘└───┘│    12px 상하 패딩
├─────────────────────────────┤
│  Bottom Safe Area           │
└─────────────────────────────┘
```

### 5.3 Layout 원칙

- **화면 좌우 기본 margin은 24px.** 모바일에서 콘텐츠가 엣지에 붙지 않는다.
- **카드 내부 padding은 24~28px.** 카드 콘텐츠에 숨 쉴 공간을 준다.
- **수직 리듬:** 섹션 간 간격(32px) > 섹션 내 간격(16~20px) > 요소 간 간격(8~12px). 위계를 간격으로 표현한다.
- **단어 카드는 화면의 시각적 중심.** 카드 위아래로 여백을 넉넉히 확보하여 단어에 시선이 머물게 한다.
- **버튼은 항상 4열 균등 분할.** flex: 1로 동일 너비. 한 손 엄지 조작 영역(화면 하단 1/3) 안에 위치한다.
- **데스크톱 확장 시:** max-width 480px, 중앙 정렬. 모바일 앱처럼 보이는 것이 의도.

### 5.4 Responsive Breakpoints

| Breakpoint    | Width     | 동작                                         |
| ------------- | --------- | -------------------------------------------- |
| Mobile (기본) | ~480px    | 풀스크린, 카드 좌우 24px margin              |
| Tablet        | 481~768px | max-width 480px 유지, 중앙 정렬              |
| Desktop       | 769px+    | max-width 480px 유지, 중앙 정렬, 배경 canvas |

---

## 6. Component Anatomy

### 6.1 Word Card (핵심 컴포넌트)

```
Container: radius-lg(16px), border-default, shadow-md
Padding: 28px 24px
Alignment: center

├── Word: display-lg, Fraunces 500, ink
│   margin-bottom: 4px
├── Phonetic: mono-md, Space Mono, sepia
│   margin-bottom: 16px
├── Divider: 40px × 1px, dust, center
│   margin-bottom: 16px
└── Meaning: body-lg, Noto Sans KR 400, ink-light(#3A3632)
```

- 카드 배경: `parchment(#FDFCF9)`
- **앞면(단어만):** 뜻 영역이 비어있고, "탭하여 확인" 힌트가 sepia로 표시. 단어 30px.
- **뒷면(단어+뜻):** 단어 26px (약간 작게). 디바이더 아래로 뜻이 fade-in. 예문 italic 11px sepia.

### 6.2 Response Buttons

```
Container: flex row, gap 8px, padding 20px 24px
Each button: flex 1, radius-md(12px), padding 12px
Font: body-sm, Instrument Sans 600, letter-spacing 0.5px
Text: center aligned
```

- 4개 버튼(Again, Hard, Good, Easy) 동일 너비.
- 각 버튼은 Semantic Color의 배경+텍스트 조합.
- 각 버튼 하단에 다음 복습 간격 표시 (8px, 연하게).
- 호버: 배경 opacity 1.2배 진하게.
- 프레스: scale(0.97), 배경 opacity 1.4배 진하게.

### 6.3 Stat Pill

```
Container: radius-full(9999px), padding 8px 14px
Background: badge-bg(#EEE9DF)
Font: body-sm, Instrument Sans
Icon: emoji or Lucide icon, 14px
Layout: flex row, align-center, gap 6px
```

- 숫자(strong)는 ink 컬러, 라벨은 sepia와 ink 사이(`#5A5247`).

### 6.4 Input Field

```
Container: radius-sm(8px~10px), canvas background, border-default
Padding: 11px 14px
Height: 44px
Font: Instrument Sans 13px
```

- 라벨: 인풋 위 고정 (floating label 아님), overline 스타일.
- 포커스: ink border + 2px outer ring.
- 에러: brick 컬러 border + 인풋 아래 에러 메시지.

### 6.5 Navigation Bar (Bottom)

```
Container: 높이 56px (Safe area 포함), 상단 1px border
Layout: 3열 균등 분할
Each item: icon 20px + label 9px
Active: ink color / Inactive: sepia color
Icons: Lucide — Home(house), Stats(bar-chart-2), Settings(settings-2)
```

- 학습 세션(Study) 중에는 숨김 — 몰입 UI.

### 6.6 Top Bar

```
Container: padding 8px 20px
Layout: flex, space-between, align-center
Back button: 28×28px, radius-sm(8px), canvas bg, border-default
Title: 13px, weight 600, ink
```

- 학습 세션: ✕(닫기) + 카운터(현재/전체, Space Mono 11px) + ↩(Undo, 앞면) / ✏️(편집, 뒷면)

### 6.7 FAB (Floating Action Button)

```
Container: 48×48px, radius-lg(14px), ink bg, parchment color
Position: absolute, bottom 72px, right 20px
Shadow: shadow-md
Icon: + (22px, weight 300)
```

### 6.8 Progress Bar

```
Track: height 3px, border color, radius-full
Fill: ink color, radius-full
Container padding: 0 20px, margin-bottom 12px
```

- 학습 세션에서 완료/전체 비율 표시.

---

## 7. Iconography & Emoji

### 7.1 아이콘 시스템

- **아이콘 라이브러리:** Lucide Icons 또는 Phosphor Icons (Light weight).
- **아이콘 스타일:** 1.5px stroke, round cap/join. Ink & Paper 톤에 맞는 가벼운 선 아이콘.
- **아이콘 사이즈:** 20px (네비게이션), 16px (인라인), 24px (빈 상태 강조).
- **아이콘 컬러:** 기본 `sepia(#8A7E6D)`, 활성 상태 `ink(#1A1715)`.

### 7.2 Emoji 사용 정책

**기본 원칙: Emoji를 UI의 아이콘 시스템으로 사용하지 않는다.**

| 허용                               | 불허                    |
| ---------------------------------- | ----------------------- |
| 스탯 필 내 감정/상태 표현 (📖, 🔥) | 내비게이션 아이콘 대체  |
| 빈 상태(empty state) 일러스트 보조 | 버튼 아이콘 대체        |
| 축하/격려 메시지 내 (🎉)           | 로고/브랜딩 요소        |
| 사용자 닉네임 옆 레벨 표시         | 시스템 알림/에러 아이콘 |

- **사용 빈도:** 한 화면에 최대 2~3개.
- **사이즈:** 본문 인라인 emoji는 텍스트와 동일 크기. 별도 강조 시에도 최대 16px.
- **위치:** 텍스트 왼쪽에만 배치.

---

## 8. Motion & Animation

### 8.1 Timing

| Token             | Value                               | 용도                        |
| ----------------- | ----------------------------------- | --------------------------- |
| `duration-fast`   | 120ms                               | 버튼 호버/프레스, 토글      |
| `duration-normal` | 200ms                               | 카드 전환, 상태 변경        |
| `duration-slow`   | 350ms                               | 페이지 전환, 모달 진입/퇴장 |
| `easing-default`  | `cubic-bezier(0.25, 0.1, 0.25, 1)`  | 대부분의 전환               |
| `easing-spring`   | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 카드 뒤집기, 성공 피드백    |

### 8.2 Animation 원칙

- **카드 뒤집기:** Y축 3D 플립, duration-normal + easing-spring. 가장 핵심적인 인터랙션.
- **버튼 피드백:** 탭 시 scale(0.97) + opacity 0.8. duration-fast.
- **페이지 전환:** fade + 위로 8px 슬라이드. duration-slow.
- **카드 전환:** 응답 후 왼쪽으로 슬라이드 아웃 → 다음 카드 오른쪽에서 슬라이드 인. 200ms.
- **세션 완료 이모지:** scale 0→1 (spring easing, 400ms). 스탯 숫자 카운트업 (300ms, stagger 100ms).
- **절대 사용하지 않는 것:** 바운스, 지터, 반복 pulse, 회전.
- **`prefers-reduced-motion: reduce`** 시 모든 animation을 즉시 완료로 변경.

---

## 9. Screen Inventory

14개 화면, 7개 핵심 플로우.

| #  | Screen         | Route               | Key Components                                     | Navigation                          |
|----|----------------|----------------------|----------------------------------------------------|------------------------------------|
| 01 | Welcome        | `/welcome`           | 타이포 로고(Fraunces 32px), 소개 카피, 시작하기/로그인 CTA | → Login, Signup                    |
| 02 | Login          | `/login`             | 이메일/비밀번호 인풋, 로그인 버튼, 비밀번호 찾기      | → Home, Signup                     |
| 03 | Signup         | `/signup`            | 이메일/비밀번호/확인 인풋, 가입 버튼, 약관 고지       | → Email Verify, Login              |
| 04 | Email Verify   | `/verify`            | ✉️ 아이콘, 인증 안내, 재전송 버튼 (60초 쿨다운)       | → Home (인증 후)                   |
| 05 | Home           | `/`                  | 그리팅, 학습 요약 CTA, 스탯 필, 폴더/덱 리스트        | → Study, Folder, Stats, Settings   |
| 06 | Folder View    | `/folder/:id`        | 폴더 헤더, 합산 스탯, 전체 학습 CTA, 덱 카드 리스트    | → Deck, Study, Home                |
| 07 | Deck View      | `/deck/:id`          | 3-박스 스탯, 세그먼트 프로그레스 바, 카드 리스트, FAB  | → Study, Card Form, Folder         |
| 08 | Card Form      | `/deck/:id/add`      | 단어(Fraunces 16px)/뜻/예문/발음/태그 인풋, 계속 추가 모드 | → Deck (✕로 복귀)                 |
| 09 | CSV Import     | `/deck/:id/import`   | 파일 업로드 영역, 미리보기 테이블, 매핑 드롭다운       | → Deck (완료 후)                   |
| 10 | Study (Front)  | `/study/:deckId`     | 프로그레스 바, 카드 앞면(단어+발음), ✕/카운터/↩       | → Study Back (탭/스와이프)         |
| 11 | Study (Back)   | `/study/:deckId`     | 카드 뒷면(단어+뜻+예문), 응답 버튼 4개, ✏️ 편집       | → 다음 카드 / Session Complete     |
| 12 | Session Complete | `/study/complete`  | 🎉, 결과 요약(New/복습/정답률), 스트릭, 홈 CTA        | → Home                            |
| 13 | Stats          | `/stats`             | 오늘 4-박스 스탯, 4주 히트맵, 덱별 프로그레스 바      | → Deck Stats, Home                 |
| 14 | Settings       | `/settings`          | 학습/알림/계정 그룹드 리스트, 토글, 로그아웃           | → Home                            |
| —  | Folder/Deck Form | Modal overlay      | 이름/설명/색상 인풋 (폴더·덱 공용)                    | → 이전 화면 (저장/취소)            |

---

## 10. User Flows

### Flow 1: Onboarding & Auth

**경로:** 앱 진입 → 로그인 상태 확인 → Welcome(미인증) → Login/Signup → Home

- 토큰 유효 시 자동 스킵하여 Home으로 직행.
- Supabase Auth의 refresh token으로 세션 자동 연장.
- 회원가입 후 이메일 인증 필수. 인증 전 앱 접근 불가. "인증 메일 재전송" 버튼 제공 (60초 쿨다운).
- 인증 완료 시 자동으로 Home 전환.

### Flow 2: Home Dashboard

**원칙:** 1-Tap to Study — 홈에서 학습 시작까지 최대 1탭.

- **시선 흐름:** ① 그리팅+타이틀 → ② 스탯 필(카드 수, 스트릭, 예상 시간) → ③ 학습 시작 CTA(최대 터치 타겟 52px) → ④ 폴더/덱 리스트 → ⑤ 하단 내비게이션
- 복습 카드 존재 시 → Study Session 진입. 없을 시 → "오늘의 복습 완료! 🎉" Empty State.
- **Empty States:** 덱 0개 → "첫 단어장 만들기" CTA. 오늘 복습 완료 → 축하 메시지 + 내일 예정 수.

### Flow 3: Folder & Deck 관리

**정보 구조:** Folder → Deck의 1-depth만 허용. 중첩 불가.

- 폴더: 생성(이름/설명) / 편집 / 삭제.
- 덱: 생성(이름/설명/색상) / 편집 / 삭제. 덱 카드에 컬러 스트라이프(4px, 좌측).
- 폴더 단위 합산 학습 가능 ("전체 학습 시작" CTA).
- **삭제 안전장치:** 하위 데이터 존재 시 2단계 확인. 경고 모달에 삭제될 덱/카드 수 명시. 삭제 버튼 brick 컬러.

### Flow 4: Card 관리

**핵심:** 계속 추가 모드 — 저장 후 폼 초기화, 바로 다음 카드 입력.

- 카드 필드: 단어(필수), 뜻(필수), 예문(선택), 발음(선택), 태그(선택).
- 저장 성공 시 상단 moss-bg 토스트 확인 (3초 소멸).
- 역방향 카드 자동 생성 (설정에서 토글 가능).
- **CSV Import:** 파일 선택 → 미리보기(3행) → 컬럼 매핑 확인 → 실행 → 결과 요약.
  - 기본 매핑: 1열=단어, 2열=뜻, 3열=예문, 4열=발음. 헤더 자동 감지.
  - 중복 단어: "건너뛰기/덮어쓰기" 선택.

### Flow 5: Study Session (Core)

**WordPocket의 핵심 경험.** SM-2 알고리즘 기반.

- **세션 진입:** 큐 구성(새 카드 + 복습 카드) → 카드 순회.
- **카드 상태 3단계:** New → Learning(세션 내 반복) → Review(SM-2 간격).
- **인터랙션:** 앞면(단어) → 탭/위로 스와이프 → 뒷면(단어+뜻+예문) → 응답(Again/Hard/Good/Easy).
  - Again: EF -0.2, 학습 단계 리셋, 1분 후 재출현.
  - Hard: EF -0.15, 간격 × 1.2.
  - Good: 간격 × EF, EF 유지.
  - Easy: EF +0.15, 간격 × EF × 1.3, 학습 카드 즉시 졸업.
- **제스처:** 좌→우 스와이프 = Good (가장 빈번한 응답).
- **Undo:** 직전 응답 1회 되돌리기 (↩ 버튼 또는 엣지 스와이프). 연속 Undo 미지원.
- **Leech 감지:** Again 5회 누적 시 토스트 알림. 옵션: 계속/일시 중지/태그 추가.
- **몰입 UI:** 하단 내비게이션 숨김, 프로그레스 바 + 카운터만 표시.

### Flow 6: Progress & Stats

**MVP 범위:** 오늘의 요약, 주간 히트맵, 덱별 진행률, 스트릭 4가지만 제공.

- **오늘의 요약:** 새 카드 학습 수, 복습 완료 수, 정답률(Good+Easy 비율), 평균 응답 시간.
- **히트맵:** 4주(28일) 그리드, GitHub 잔디 스타일. moss 3단계 농도. 현재 연속일 + 최장 기록.
- **덱별 진행률:** Mature 비율 프로그레스 바. 탭 시 상세 통계(New/Learning/Mature 비율 바, 리치 카드 목록).

### Flow 7: Settings & Profile

**원칙:** Anki 30개+ 파라미터 → 5개만 노출. 나머지는 합리적 기본값.

- **학습 설정:** 하루 새 카드 수(기본 20), 학습 단계(1분/10분), 역방향 카드 토글, 리치 임계값(기본 5), 최대 간격(기본 365일).
- **알림:** 일일 복습 리마인더 (시간 설정).
- **계정:** 이메일(읽기전용), 비밀번호 변경, 로그아웃(brick 텍스트, 확인 다이얼로그).
- **계정 삭제:** 비밀번호 변경 내부 2-depth에 배치. 파괴적 액션 접근 난이도를 의도적으로 높임.

---

## 11. Do & Don't

### DO

- 단어 카드에 충분한 여백을 준다 — 카드 안팎 모두.
- 색상은 절제한다 — 한 화면에 semantic color는 버튼 영역에만.
- 세리프(Fraunces)는 영단어 표시에만 사용한다 — 남용하면 특별함이 사라진다.
- 그레이 대신 세피아 톤을 쓴다 — 차가운 그레이는 Ink & Paper 무드를 깨뜨린다.
- 카드 전환 모션은 매끄럽게 — 학습 흐름을 끊지 않는다.

### DON'T

- 순백(`#FFF`) / 순흑(`#000`) 배경이나 텍스트를 사용하지 않는다.
- 그라데이션 배경을 쓰지 않는다 — 이 컨셉에서 그라데이션은 톤을 해친다.
- 한 화면에 3개 이상 emoji를 넣지 않는다.
- 네온/글로우/드롭섀도우 과용하지 않는다.
- 버튼에 아이콘+텍스트를 동시에 넣지 않는다 — Again/Hard/Good/Easy는 텍스트만.
- rounded rectangle과 circle을 같은 위계에서 혼용하지 않는다.
- 12px 미만의 텍스트를 본문에 사용하지 않는다 (mono 메타 정보 제외).

---

## 12. Dark Mode (확장용)

| Light                 | Dark             |
| --------------------- | ---------------- |
| canvas `#FAF9F6`      | `#1A1715`        |
| parchment `#FDFCF9`   | `#231F1C`        |
| ink `#1A1715`         | `#E8E3D9`        |
| sepia `#8A7E6D`       | `#8A7E6D` (유지) |
| dust `#D4CFC4`        | `#3A3632`        |
| card border `#E8E3D9` | `#3A3632`        |

- 다크 모드에서도 완전한 블랙(`#000`)은 사용하지 않는다. 가장 어두운 배경은 `ink(#1A1715)`.
- Semantic color는 라이트/다크 동일하게 유지하되, 배경 opacity를 다크에서 약간 올린다.
