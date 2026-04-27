# 명언 줄바꿈 시 단어 분리 방지 — TODO

## Phase 1: 컴포넌트 수정

- [x] `src/components/Quote.tsx` — 명언 본문 `<p>`(line 37) `className`에 `break-keep` 추가
- [x] `src/components/Quote.tsx` — 저자 `<p>`(line 52) `className`에 `break-keep` 추가

## Phase 2: 빌드 및 린트 검증

- [x] `pnpm lint` 통과 확인 (기존 `useBackground.ts`, `useQuote.ts`의 `react-hooks/set-state-in-effect` 사전 오류 — 이번 변경과 무관, 본 PR scope 외)
- [x] `pnpm build` 프로덕션 빌드 정상 완료 확인 (628.89 kB / 1.241s)

## Phase 3: 테스트 및 검증 (MCP Playwright)

- [x] `pnpm build` 산출물(`.output/chrome-mv3/`)을 HTTP 서버로 띄워 동일 CSS로 격리 테스트 페이지 구성 (Chrome Extension `chrome://newtab` 직접 로드는 unpacked 권한 필요로 우회)
- [x] chrome-devtools MCP로 테스트 페이지 진입 — 긴 한국어 명언 재현 (Playwright 브라우저 미설치로 chrome-devtools MCP 사용)
- [x] 스크린샷 저장 — `/tmp/word-break-after.png`(적용 후), `/tmp/word-break-before.png`(미적용 비교)
- [x] `getComputedStyle(el).wordBreak === 'keep-all'` 검증 통과 (본문·저자 모두)
- [x] Before/After 어절 비교: Before(`word-break: normal`) 5줄 중 `인정해도`, `괜찮다는` 어절 분리 확인 → After(`break-keep`) 동일 콘텐츠에서 모든 어절(`다름을`, `남과`, `다르고`, `누군가를`, `것이다` 포함) 보존
- [x] 다중 뷰포트(800×600, 1280×900, 1920×1080) 동작 확인 — 모두 어절 분리 0건
- [x] 짧은 명언("짧은 명언.") 1줄 표시, 어절 보존 정상
- [x] 긴 영문 명언 단어 단위 줄바꿈 정상 (`break-keep`이 영문 동작에 부정적 영향 없음)
- [x] 로딩 스켈레톤은 텍스트 미포함 placeholder이므로 영향 없음 (코드 변경 범위 외)
