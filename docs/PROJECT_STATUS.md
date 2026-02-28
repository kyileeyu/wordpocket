# WordPocket 프로젝트 진행 현황 분석

## 프로젝트 개요
WordPocket은 SM-2 기반 간격 반복 단어 학습 웹앱 (Anki 스타일)

---

## Phase 1: MVP (4주) 진행 현황

### Week 1 — 프로젝트 셋업 & 인증 ✅ 완료
| 항목 | 상태 | 비고 |
|------|------|------|
| Vite + React 19 + TypeScript + Tailwind + shadcn/ui | ✅ | |
| React Router v7 라우팅 | ✅ | 13개 페이지 라우트 구성 완료 |
| Supabase 프로젝트 생성 & 클라이언트 연결 | ✅ | |
| DB 스키마 마이그레이션 (7개 테이블) | ✅ | profiles, folders, decks, cards, card_states, review_logs, user_settings |
| RLS 정책 | ✅ | 전 테이블 적용 |
| 트리거 & RPC 함수 | ✅ | SM-2 알고리즘, 학습 큐, 통계 함수 등 |
| Edge Function (CSV import) | ✅ | |
| Supabase Auth (이메일/비밀번호) | ✅ | Zustand authStore 구현 |
| 로그인/회원가입 페이지 | ✅ | Welcome, Login, Signup, Verify 페이지 |
| AuthGuard/GuestGuard | ✅ | 라우트 보호 동작 |
| 기본 레이아웃 (AppShell, AuthShell, TopBar, BottomNav) | ✅ | |

### Week 2 — 폴더/덱 & 카드 CRUD ✅ 완료
| 항목 | 상태 | 비고 |
|------|------|------|
| TanStack Query 설정 | ✅ | QueryClientProvider 래핑, Zustand은 authStore(클라이언트 상태)만 유지 |
| 폴더 CRUD API + UI | ✅ | useFolders 훅 + HomePage 연동, InputDialog로 생성/편집, ConfirmDialog로 삭제 |
| 덱 CRUD API + UI | ✅ | useDecks 훅 + FolderPage 연동, 생성/이름 편집/삭제 |
| 카드 CRUD API + UI | ✅ | useCards 훅 + CardFormPage 연동, 추가(toast)/편집(navigate back) |
| 덱 상세 페이지 (카드 목록) | ✅ | DeckPage에서 useCardsByDeck + card_states 조인으로 상태 표시 |
| CSV import 기능 | ✅ | CsvDropZone 파일 선택 → FileReader 파싱 → Edge Function 호출 |
| 덱 진행률 (get_deck_progress) | ✅ | useDeckProgress 훅, HomePage/FolderPage/DeckPage 통계 연동 |
| RPC 함수 마이그레이션 | ✅ | SQL 예약어(interval) 및 UNION ALL 구문 수정 완료 |
| RLS 정책 테스트 | ❌ | |

### Week 3 — 학습 세션 & SM-2 알고리즘 ✅ 완료
| 항목 | 상태 | 비고 |
|------|------|------|
| SM-2 스케줄러 구현 | ✅ | **Postgres RPC로 구현 완료** (`submit_review`) |
| 스케줄러 유닛 테스트 | ❌ | |
| 학습 세션 페이지 UI | ✅ | StudyPage RPC 연동 완료 (useStudyQueue + useSubmitReview) |
| 학습 큐 로직 | ✅ | **Postgres RPC로 구현 완료** (`get_study_queue`) |
| 리뷰 로그 기록 API | ✅ | **Postgres RPC로 구현 완료** |
| 세션 완료 요약 화면 | ✅ | CompletePage location.state + useStreak 연동 완료 |

### Week 4 — 대시보드, 통계, PWA ⚠️ 통계 연동 완료, PWA 완료, 배포 미착수
| 항목 | 상태 | 비고 |
|------|------|------|
| 대시보드 페이지 | ⚠️ | HomePage 마크업 완료, **실제 통계 데이터 없음** |
| 통계 페이지 (히트맵, 리뷰 횟수) | ✅ | StatsPage RPC 연동 완료 (useTodayStats, useHeatmapData, useStreak, useDeckProgress) |
| PWA 셋업 | ✅ | vite-plugin-pwa + manifest + Service Worker + 아이콘 세트 + workbox 캐싱 |
| 반응형 디자인 마무리 | ⚠️ | 모바일 퍼스트 480px 레이아웃 구성됨 |
| E2E 테스트 | ❌ | |
| 배포 | ❌ | |

---

## 핵심 미구현 영역 (구현 필요 목록)

### 1. 데이터 레이어 — ✅ 폴더/덱/카드 완료, 학습/통계/설정 미연동
TanStack Query 기반 커스텀 훅으로 서버 상태 관리. Zustand은 authStore(클라이언트 상태)만 유지.

**완료:**
- ✅ useFolders (list, create, update, delete)
- ✅ useDecks (listByFolder, detail, create, update, delete, progress)
- ✅ useCards (listByDeck, detail, create, update, delete)

**남은 작업:**
- ~~학습 세션 데이터 (get_study_queue, submit_review 연동)~~ ✅ 완료
- ~~통계 데이터 (get_today_stats, get_heatmap_data, get_streak 연동)~~ ✅ 완료
- 사용자 설정 CRUD

### 2. 학습 세션 로직 — ✅ 완료
- ~~StudyPage에서 get_study_queue RPC 호출하여 실제 카드 불러오기~~ ✅
- ~~카드 평가 시 submit_review RPC 호출~~ ✅
- ~~학습 진행률 실시간 추적~~ ✅
- ~~세션 완료 시 실제 통계 전달~~ ✅

### 3. CSV Import — ✅ 완료
- ✅ CSV 파일 파싱 로직 (FileReader + parseCsv)
- ✅ Supabase Edge Function (import-csv) 호출 연동
- ✅ 미리보기 및 에러 처리 (toast)

### 4. 검색 & 필터
- 카드 목록 검색 기능
- 덱/폴더 필터링

### 5. PWA — ✅ 완료
- ✅ vite-plugin-pwa 설치 및 설정
- ✅ Service Worker, manifest, 아이콘

### 6. 테스트
- SM-2 스케줄러 유닛 테스트
- E2E 핵심 플로우 테스트

### 7. 배포
- Vercel/Cloudflare Pages 설정

---

## 요약

| 영역 | 진행률 | 상세 |
|------|--------|------|
| 프로젝트 셋업 | 100% | Vite, React, Router, Tailwind, shadcn |
| Supabase 백엔드 | 100% | 스키마, RLS, 트리거, RPC, Edge Function |
| 인증 | 100% | 회원가입, 로그인, 가드, 상태관리 |
| UI 마크업 | ~95% | 13개 페이지 + 31개 컴포넌트 완성 |
| **데이터 연동** | **~90%** | TanStack Query 훅으로 폴더/덱/카드/학습/통계 연동 완료, 설정 미연결 |
| **CRUD 기능** | **90%** | 폴더/덱/카드 CRUD 완료, 검색 미구현 |
| **학습 세션** | **100%** | useStudyQueue + useSubmitReview 연동 완료 |
| **통계 연동** | **100%** | useTodayStats, useHeatmapData, useStreak, useDeckProgress 연동 완료 |
| PWA | 100% | vite-plugin-pwa, manifest, SW, 아이콘, workbox 캐싱 |
| 테스트 | 0% | 미착수 |
| 배포 | 0% | 미착수 |

---

## 결론

학습 세션(StudyPage)과 통계(StatsPage)의 Supabase RPC 연동이 완료되어 앱의 핵심 플로우(카드 학습 → 리뷰 제출 → 세션 완료 → 통계 확인)가 실데이터로 동작합니다. 다음 단계는 **PWA 셋업, 테스트, 배포** 등 남은 비기능 요구사항입니다.
