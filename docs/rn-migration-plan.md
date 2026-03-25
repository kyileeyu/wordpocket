# WordPocket: React Web (PWA) → React Native 마이그레이션 계획

## Context

WordPocket은 React 19 + Vite + Tailwind CSS 기반의 PWA 단어 암기 앱이다. 백엔드는 Supabase(PostgreSQL + Auth + Edge Functions), 상태 관리는 Zustand + TanStack React Query를 사용한다. 네이티브 앱으로 전환하여 더 나은 UX(푸시 알림, 네이티브 제스처, 앱스토어 배포)를 제공하기 위해 React Native(Expo)로 마이그레이션한다.

---

## 1. 프로젝트 초기 설정

### 1.1 Expo 프로젝트 생성
```bash
npx create-expo-app wordpocket-mobile --template tabs
```

### 1.2 핵심 의존성

| 카테고리 | 패키지 | 대체 대상 |
|---------|--------|----------|
| 라우팅 | `expo-router` | React Router v7 |
| 스타일링 | `nativewind@4` + `tailwindcss@3.4` | Tailwind CSS v4 (웹) |
| 상태 | `zustand@5`, `@tanstack/react-query@5` | 그대로 재사용 |
| 백엔드 | `@supabase/supabase-js@2` | 그대로 재사용 |
| 저장소 | `@react-native-async-storage/async-storage` | localStorage |
| 보안 저장소 | `expo-secure-store` | Supabase 토큰 저장 |
| 아이콘 | `lucide-react-native` | lucide-react |
| 제스처 | `react-native-gesture-handler` | 웹 터치 이벤트 |
| 애니메이션 | `react-native-reanimated@3` | CSS transition/animation |
| 바텀시트 | `@gorhom/bottom-sheet` | 커스텀 PickerSheet/ActionSheet |
| Safe Area | `react-native-safe-area-context` | env(safe-area-inset-*) |
| SVG | `react-native-svg` | 커스텀 아이콘, 히트맵 |
| 이미지 | `expo-image-picker` | `<input type="file">` |
| 이미지 처리 | `expo-image-manipulator` | Canvas 기반 압축 |
| 파일 선택 | `expo-document-picker` | CSV 파일 input |
| TTS | `expo-speech` | Web Speech API |
| 오디오 | `expo-av` | Web Audio API |
| 폰트 | `expo-font` | CSS @import |
| 딥링크 | `expo-linking` | 비밀번호 재설정 리다이렉트 |
| DnD | `react-native-draggable-flatlist` | @dnd-kit |
| 토스트 | `burnt` 또는 `react-native-toast-message` | Sonner |
| 그라디언트 | `expo-linear-gradient` | CSS gradient |
| 블러 | `expo-blur` | backdrop-filter |
| 햅틱 | `expo-haptics` | 없음 (신규) |

### 1.3 환경변수
- `import.meta.env.VITE_*` → `process.env.EXPO_PUBLIC_*` (app.config.ts에서 설정)

### 1.4 경로 별칭
- `@/*` → `babel-plugin-module-resolver`로 `./src` 매핑

---

## 2. 재사용 가능한 코드 (그대로 복사)

### 100% 재사용
- `src/types/database.types.ts` — 순수 TypeScript 타입
- `src/types/photo-import.ts` — 인터페이스 정의
- `src/hooks/useCards.ts` — Supabase 쿼리만 사용
- `src/hooks/useDecks.ts`
- `src/hooks/useFolders.ts`
- `src/hooks/useStudy.ts`
- `src/hooks/useStats.ts`
- `src/hooks/useUserSettings.ts`
- `src/hooks/useExtractWords.ts`
- `src/lib/csvParser.ts` — 순수 문자열 파싱
- `src/lib/heatmap.ts` — 순수 데이터 변환
- `src/lib/utils.ts` — `cn()`, `mapCardStatus`, `computeIntervals`, `formatInterval`, `timeAgo`

### 소규모 수정 필요
- `src/lib/supabase.ts` — env 변수 + AsyncStorage auth adapter 추가
- `src/stores/authStore.ts` — `window.location.origin` → `Linking.createURL()`
- `src/hooks/useSearch.ts` — `useRecentSearches`에서 localStorage → AsyncStorage
- `src/lib/csvExporter.ts` — Blob/URL.createObjectURL → `expo-file-system` + `expo-sharing`

### 제거 (웹 전용)
- `src/stores/pwaStore.ts`, `src/components/feedback/InstallBanner.tsx`
- `vite.config.ts`, `index.html`, `public/`, `playwright.config.ts`, `e2e/`

---

## 3. 라우팅 구조 (Expo Router)

```
app/
  _layout.tsx              → Root (QueryClientProvider, auth 초기화, 폰트 로딩)
  (auth)/
    _layout.tsx            → AuthShell (Stack)
    welcome.tsx
    login.tsx
    signup.tsx
    verify.tsx
    forgot-password.tsx
  (app)/
    _layout.tsx            → Auth 가드 + Stack
    (tabs)/
      _layout.tsx          → Tab 네비게이터 (Home, Stats, Settings)
      index.tsx            → HomePage
      stats.tsx
      settings.tsx
    folder/[id].tsx
    deck/[id]/index.tsx
    deck/[id]/add.tsx
    deck/[id]/edit/[cardId].tsx
    deck/[id]/import.tsx
    deck/[id]/photo-import.tsx
    folder/[id]/import.tsx
    study/[deckId].tsx
    study/folder/[folderId].tsx
    study/complete.tsx
    change-password.tsx
  reset-password/update.tsx  → 딥링크 대상
```

Auth 가드: `_layout.tsx`에서 `useAuthStore` → `<Redirect>` 처리

---

## 4. UI 컴포넌트 매핑

### 기본 요소 변환

| 웹 | RN |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<input>` | `<TextInput>` (onChangeText) |
| `<button>` | `<Pressable>` |
| `<img>` | `<Image source={{ uri }}>` |
| `onClick` | `onPress` |
| `createPortal` | `<Modal>` / `@gorhom/bottom-sheet` |
| `overflow-y-auto` | `<ScrollView>` / `<FlatList>` |
| CSS transition | `react-native-reanimated` |
| `hover:` | `active:` (press 상태) |

### 컴포넌트별 전략

**ui/ (전면 재작성)**
- button → `<Pressable>` + NativeWind + cva 패턴
- dialog → RN `<Modal>`
- input/textarea/label → `<TextInput>`, `<Text>` 래퍼
- progress → `<View>` 애니메이션 width
- badge, skeleton → View+Text 재작성

**feedback/ (바텀시트 통일)**
- ActionSheet, PickerSheet, SortSheet, RangePickerSheet → `@gorhom/bottom-sheet`
- ConfirmDialog, InputDialog → RN `<Modal>`
- FAB → `<Pressable>` + Reanimated 회전
- EmptyState, NoReviewBanner → View+Text 재작성
- InstallBanner → **삭제**

**cards/**
- WordCard → Reanimated `rotateY` 플립 애니메이션
- PronunciationButton → `expo-speech` + `expo-av`
- TagFilterBar → `<ScrollView horizontal>`
- 나머지 → `<Pressable>` 행 레이아웃

**stats/**
- Heatmap → `<View>` flexWrap 그리드 또는 `react-native-svg`
- WordsLearnedCard → `<View>` height 기반 바 차트
- 나머지 → View+Text 재작성

**navigation/**
- BottomNav → Expo Router Tab `_layout.tsx`로 대체
- TopBar → Stack.Screen `options` 또는 커스텀 헤더

**photo-import/**
- FullscreenViewer → `<Modal>` + `react-native-pager-view`
- CardDraftItem → `react-native-gesture-handler` `Swipeable`
- ThumbnailStrip → `<FlatList horizontal>`

---

## 5. 스타일링 마이그레이션

### NativeWind에서 동작하는 것
- Flexbox, spacing, sizing, colors, typography, borders, rounded

### 별도 처리 필요

| 웹 CSS | RN 대안 |
|--------|---------|
| `position: fixed` | `absolute` + 부모 기준 |
| CSS gradient | `expo-linear-gradient` 컴포넌트 |
| `backdrop-filter: blur()` | `expo-blur` `<BlurView>` |
| `box-shadow` | iOS: shadow* 스타일, Android: elevation |
| `@utility typo-*` | Tailwind 플러그인 또는 StyleSheet 상수 |

### 테마 설정 (`tailwind.config.ts`)
`src/index.css`의 모든 커스텀 토큰(색상, 폰트, radius)을 Tailwind config로 이전.

---

## 6. 마이그레이션 단계

### Phase 1: 기반 구축 (1~2주) ✅
- [x] Expo 프로젝트 초기화 + NativeWind 설정
- [x] 타입, Supabase 클라이언트, authStore 이식
- [x] 기본 UI 프리미티브 (Button, TextInput, Label, Badge)
- [x] Expo Router 파일 구조 + auth 가드
- [x] 커스텀 폰트 로딩 (Outfit, Pretendard)
- [x] 테마 상수 파일 (색상, 그림자)

### Phase 2: 데이터 레이어 (2~3주) ✅
- [x] 모든 데이터 hooks 복사 및 검증
- [x] lib 유틸리티 복사 (csvParser, heatmap, utils)
- [x] useSearch의 localStorage → AsyncStorage 교체
- [x] QueryClientProvider 설정
- [x] Supabase RPC 호출 RN 환경 검증

### Phase 3: 인증 플로우 (3주) ✅
- [x] 인증 페이지 7개 구현
- [x] 딥링크 설정 (비밀번호 재설정 리다이렉트)
- [x] Supabase 리다이렉트 URL을 `wordpocket://` 스킴으로 업데이트

### Phase 4: 메인 화면 (3~4주) ✅
- [x] Tab 네비게이터 (Home, Stats, Settings)
- [x] HomePage: 폴더/덱 목록, FAB, 검색
- [x] StatsPage: 진행률, 히트맵, 주간 차트
- [x] SettingsPage: 설정 행 목록

### Phase 5: 콘텐츠 화면 (4~5주) ✅
- [x] FolderPage, DeckPage, CardFormPage (Add/Edit)
- [ ] 드래그 앤 드롭 정렬 (`react-native-draggable-flatlist`) - 추후 개선
- [ ] 검색 오버레이 - 추후 개선

### Phase 6: 학습 플로우 (5~6주) ✅
- [x] WordCard 플립 (탭 기반)
- [x] ResponseButtons, StudyProgress, CompletePage
- [ ] 발음 재생 (expo-av + expo-speech) - 추후 개선
- [x] 학습 큐 + 배치 리뷰 제출 + 폴더 학습

### Phase 7: 가져오기 기능 (6~7주)
- CSV 가져오기 (expo-document-picker + csvParser 재사용)
- 사진 가져오기 (expo-image-picker + expo-image-manipulator)
- FullscreenViewer, CardDraftItem 스와이프

### Phase 8: 마무리 (7~8주)
- 햅틱 피드백, 키보드 회피 처리
- CSV 내보내기 (expo-file-system + expo-sharing)
- Android 뒤로가기, 스플래시 스크린, 앱 아이콘
- 성능 최적화 및 QA

---

## 7. 검증 방법

### 테스트 전략
- **단위 테스트**: Jest + React Native Testing Library (hooks, 유틸리티 함수)
- **컴포넌트 테스트**: `@testing-library/react-native` (상호작용 테스트)
- **E2E 테스트**: Maestro (기존 Playwright 시나리오 이식)

### 수동 검증 체크리스트
- [ ] 로그인 → 홈 → 폴더 → 덱 → 카드 추가 → 학습 전체 플로우
- [ ] 비밀번호 재설정 딥링크 동작
- [ ] CSV 가져오기/내보내기
- [ ] 사진 촬영 → AI 단어 추출 → 카드 생성
- [ ] 한국어 텍스트 렌더링 (iOS/Android)
- [ ] 발음 재생 (오디오 URL + TTS 폴백)
- [ ] 카드 플립/스와이프 삭제/드래그 정렬 제스처
- [ ] 키보드가 입력 필드를 가리지 않는지
- [ ] 오프라인 상태에서의 동작

### 리스크

| 리스크 | 대응 |
|--------|------|
| NativeWind 호환성 | Phase 1에서 프로토타입 화면으로 검증 |
| 한국어 폰트 렌더링 | Android에서 Pretendard 조기 테스트 |
| 그라디언트 다수 사용 | `<LinearGradient>` 래퍼 컴포넌트 조기 제작 |
| 딥링크 설정 | Supabase 리다이렉트 URL 서버 설정 필요 |
