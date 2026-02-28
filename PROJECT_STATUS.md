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

### Week 2 — 폴더/덱 & 카드 CRUD ⚠️ 마크업만 완료, 기능 미구현
| 항목 | 상태 | 비고 |
|------|------|------|
| 폴더 CRUD API + UI | ❌ | HomePage에 폴더 목록 마크업은 있으나 **하드코딩된 목데이터**, Supabase 연동 없음 |
| 덱 CRUD API + UI | ❌ | FolderPage/DeckPage 마크업 있으나 **데이터 페칭 없음** |
| 카드 CRUD API + UI | ❌ | CardFormPage 마크업 있으나 **폼 제출 핸들러 없음** |
| 덱 상세 페이지 (카드 목록, 검색) | ❌ | DeckPage UI 있으나 **실제 카드 로딩 없음** |
| CSV import 기능 | ❌ | CsvImportPage/CsvDropZone UI 있으나 **파싱/업로드 로직 없음** |
| RLS 정책 테스트 | ❌ | |

### Week 3 — 학습 세션 & SM-2 알고리즘 ⚠️ 백엔드 완료, 프론트 미연결
| 항목 | 상태 | 비고 |
|------|------|------|
| SM-2 스케줄러 구현 | ✅ | **Postgres RPC로 구현 완료** (`submit_review`) |
| 스케줄러 유닛 테스트 | ❌ | |
| 학습 세션 페이지 UI | ⚠️ | StudyPage 마크업 완료, **RPC 연동 없음** |
| 학습 큐 로직 | ✅ | **Postgres RPC로 구현 완료** (`get_study_queue`) |
| 리뷰 로그 기록 API | ✅ | **Postgres RPC로 구현 완료** |
| 세션 완료 요약 화면 | ⚠️ | CompletePage 마크업 완료, **실제 데이터 없음** |

### Week 4 — 대시보드, 통계, PWA ⚠️ 마크업만 완료
| 항목 | 상태 | 비고 |
|------|------|------|
| 대시보드 페이지 | ⚠️ | HomePage 마크업 완료, **실제 통계 데이터 없음** |
| 통계 페이지 (히트맵, 리뷰 횟수) | ⚠️ | StatsPage/Heatmap 마크업 완료, **RPC 연동 없음** |
| PWA 셋업 | ❌ | vite-plugin-pwa 미설치 |
| 반응형 디자인 마무리 | ⚠️ | 모바일 퍼스트 480px 레이아웃 구성됨 |
| E2E 테스트 | ❌ | |
| 배포 | ❌ | |

---

## 핵심 미구현 영역 (구현 필요 목록)

### 1. 데이터 레이어 (최우선)
현재 authStore만 존재. 나머지 모든 데이터는 하드코딩된 목데이터.

**필요한 작업:**
- Supabase 데이터 페칭/뮤테이션 훅 또는 Zustand 스토어 구현
- 폴더 CRUD (list, create, edit, delete)
- 덱 CRUD (list, create, edit, delete, 폴더 할당)
- 카드 CRUD (list, create, edit, delete)
- 학습 세션 데이터 (get_study_queue, submit_review 연동)
- 통계 데이터 (get_today_stats, get_heatmap_data, get_streak, get_deck_progress 연동)
- 사용자 설정 CRUD

### 2. 학습 세션 로직
- StudyPage에서 get_study_queue RPC 호출하여 실제 카드 불러오기
- 카드 평가 시 submit_review RPC 호출
- 학습 진행률 실시간 추적
- 세션 완료 시 실제 통계 전달

### 3. CSV Import
- CSV 파일 파싱 로직
- Supabase Edge Function (import-csv) 호출 연동
- 미리보기 및 에러 처리

### 4. 검색 & 필터
- 카드 목록 검색 기능
- 덱/폴더 필터링

### 5. PWA
- vite-plugin-pwa 설치 및 설정
- Service Worker, manifest, 아이콘

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
| **데이터 연동** | **~5%** | **authStore만 구현, 나머지 전부 목데이터** |
| **CRUD 기능** | **0%** | **폴더/덱/카드 생성·수정·삭제 미구현** |
| **학습 세션** | **0%** | **백엔드 Ready, 프론트 미연결** |
| **통계 연동** | **0%** | **백엔드 Ready, 프론트 미연결** |
| PWA | 0% | 미착수 |
| 테스트 | 0% | 미착수 |
| 배포 | 0% | 미착수 |

---

## 결론

백엔드(Supabase)와 프론트엔드 UI(마크업)는 거의 완성되었으나, **둘을 연결하는 데이터 레이어가 전혀 구현되지 않은 상태**입니다. 다음 단계는 Supabase 데이터 페칭 훅/스토어를 만들고 각 페이지에 실제 데이터를 연동하는 것입니다.
