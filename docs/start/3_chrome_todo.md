# Quotememtum Chrome Extension 현대화 - TODO

## Phase 1: 프로젝트 초기화

- [x] 기존 소스 코드 백업 (별도 브랜치 또는 태그)
- [x] WXT + React + TypeScript 프로젝트 초기화
- [x] pnpm 설정 (package.json, .npmrc)
- [x] Tailwind CSS v4 설치 및 설정
- [x] tsconfig.json 설정 (path alias 포함)
- [x] ESLint + Prettier 설정
- [x] wxt.config.ts 작성 (Manifest v3, permissions, host_permissions)
- [x] 새 탭 엔트리포인트 생성 (`src/entrypoints/newtab/`)
- [x] 빈 새 탭 페이지 Chrome에서 로드 확인
- [ ] **MCP Playwright로 새 탭 페이지 렌더링 검증**

## Phase 2: 타입 및 유틸리티 구현

- [x] `types/quote.ts` - Quote, QuoteOfTheDay, AuthorInfo 타입 정의
- [x] `types/settings.ts` - UserSettings, DEFAULT_SETTINGS 정의
- [x] `lib/constants.ts` - API URL, 스토리지 키 prefix 등 상수
- [x] `lib/storage.ts` - chrome.storage.local/sync 래퍼
- [x] `lib/inspireme-api.ts` - InspireMe API 클라이언트 (fetchQuoteOfTheDay, fetchRandomQuotes)
- [x] `lib/unsplash-api.ts` - Unsplash API 클라이언트 (기존 로직 이식)
- [x] `assets/fallback-quotes.json` - 기존 폴백 명언 JSON 이식
- [x] API 에러 클래스 (ApiError) 정의

## Phase 3: 핵심 Hooks 구현

- [x] `hooks/useClock.ts` - 실시간 시계 (12/24h 형식, 날짜)
- [x] `hooks/useSettings.ts` - 설정 로드/저장 (chrome.storage)
- [x] `hooks/useQuote.ts` - 명언 fetch + 캐싱 + 폴백 로직
- [x] `hooks/useBackground.ts` - Unsplash 배경 이미지 fetch + 캐싱

## Phase 4: UI 컴포넌트 구현 (기존 기능 이식)

- [x] `components/Background.tsx` - 전체 화면 배경 이미지
- [x] `components/Clock.tsx` - 시계 + 날짜 표시
- [x] `components/Quote.tsx` - 명언 텍스트 + 저자 표시, 클릭 시 InspireMe 사이트 이동 (`/quotes/{id}`)
- [x] `components/WallpaperInfo.tsx` - Unsplash 사진 크레딧 (촬영자, 위치)
- [x] `entrypoints/newtab/App.tsx` - 루트 컴포넌트 조합
- [x] 기본 레이아웃 스타일링 (Tailwind: flexbox, 3단 구조)
- [x] 텍스트 그림자/가독성 처리 (배경 위 흰색 텍스트)
- [ ] 기본 배경 이미지 (`default-bg.jpg`) 추가
- [ ] **MCP Playwright로 새 탭 전체 UI 스크린샷 검증**

## Phase 5: 설정 UI 구현

- [x] `components/settings/SettingsModal.tsx` - 모달 컨테이너 (탭 전환)
- [x] `components/settings/GeneralSettings.tsx` - 시계 형식, 명언 주기
- [x] `components/settings/ApiKeySettings.tsx` - API Key 입력/저장/검증 UI
- [x] `components/settings/About.tsx` - 프로젝트 정보, GitHub 링크
- [x] `components/SettingsIcon.tsx` - 설정 기어 아이콘 (토글)
- [x] 설정 변경 시 실시간 반영 확인
- [ ] **MCP Playwright로 설정 모달 열기/닫기, 설정 변경 검증**

## Phase 6: 신규 기능 (P0)

- [x] 명언 클릭 → InspireMe 사이트 이동 - `<a>` 태그로 `/quotes/{id}` 링크, 폴백 명언은 링크 비활성화
- [x] 한/영 전환 - language 설정 UI + API language 파라미터 연동
- [x] 오늘의 명언 모드 - QOTD API 연동, 모드 전환 UI
- [x] API Key 설정 - 입력 → 검증 (API 호출 테스트) → 저장 플로우
- [x] API Key 미설정 시 안내 토스트/배너

## Phase 7: 신규 기능 (P1)

- [ ] 명언 북마크 - 하트 버튼 + chrome.storage에 저장/조회
- [ ] 다크 모드 - 시스템 설정 연동 (`prefers-color-scheme`) + 수동 토글
- [ ] 저자 정보 표시 - QOTD authorInfo 활용, 클릭 시 팝업

## Phase 8: 에러 핸들링 및 Google Analytics

- [ ] API 401 에러 → 폴백 명언 + 설정 안내
- [ ] API 429 에러 → 캐시 사용 + Retry-After 대기
- [ ] 네트워크 오류 → 캐시 사용 + 복구 시 자동 갱신
- [ ] Unsplash API 실패 → 기본 배경 이미지
- [ ] Google Analytics - Measurement Protocol 방식 구현 (Manifest v3 대응)
- [ ] GA 이벤트 트래킹: 페이지뷰, 명언 갱신, 명언 클릭, 설정 변경

## Phase 9: 마무리 및 배포 준비

- [ ] 확장 프로그램 아이콘 제작 (16/48/128px)
- [ ] UI/UX 폴리싱 (로딩 상태, 애니메이션, 전환 효과)
- [ ] 기존 Weather API 코드 제거
- [ ] 기존 SNS 공유 (트위터) 코드 제거
- [ ] `pnpm build` 프로덕션 빌드 확인
- [ ] Chrome에서 빌드 결과물 사이드로딩 테스트
- [ ] **MCP Playwright로 전체 플로우 E2E 테스트**
  - [ ] 새 탭 열기 → 명언 + 배경 표시 확인
  - [ ] 설정 변경 (언어, 시계 형식, 명언 모드) 확인
  - [ ] 명언 클릭 → InspireMe 사이트 이동 확인
  - [ ] API Key 설정 플로우 확인
- [ ] Chrome Web Store 등록 준비 (스크린샷, 설명, 카테고리)
- [ ] README.md 업데이트
