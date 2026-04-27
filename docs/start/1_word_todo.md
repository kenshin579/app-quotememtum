# 명언 줄바꿈 시 단어 분리 방지 — TODO

## Phase 1: 컴포넌트 수정

- [x] `src/components/Quote.tsx` — 명언 본문 `<p>`(line 37) `className`에 `break-keep` 추가
- [x] `src/components/Quote.tsx` — 저자 `<p>`(line 52) `className`에 `break-keep` 추가

## Phase 2: 빌드 및 린트 검증

- [x] `pnpm lint` 통과 확인 (기존 `useBackground.ts`, `useQuote.ts`의 `react-hooks/set-state-in-effect` 사전 오류 — 이번 변경과 무관, 본 PR scope 외)
- [x] `pnpm build` 프로덕션 빌드 정상 완료 확인 (628.89 kB / 1.241s)

## Phase 3: 테스트 및 검증 (MCP Playwright)

- [ ] `pnpm dev`로 개발 서버 실행 후 Chrome에 Extension 로드
- [ ] MCP Playwright로 새 탭(`chrome://newtab`) 진입 — 긴 한국어 명언이 표시되는 케이스 재현
- [ ] MCP Playwright `playwright_screenshot`으로 스크린샷 저장 — 어절(`다름을`, `남과`, `다르고`, `누군가를`, `것이다`)이 한 줄 안에 보존되는지 시각 확인
- [ ] MCP Playwright `playwright_evaluate`로 명언 `<p>` 요소의 `getComputedStyle(el).wordBreak === 'keep-all'` 검증
- [ ] 다양한 뷰포트 크기(1920×1080, 1280×720, 800×600)에서 줄바꿈 동작 확인 — 어절 분리 없음 보장
- [ ] 짧은 명언(한 줄)도 정상 표시되는지 회귀 확인
- [ ] 영문 명언이 있다면 단어 단위로 정상 줄바꿈되는지 확인 (`break-keep`이 영문 단어 보존에도 영향 없는지)
- [ ] 로딩 스켈레톤 정상 표시 회귀 확인
