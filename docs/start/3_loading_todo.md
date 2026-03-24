# Chrome Extension 초기 로딩 속도 개선 — Todo

## 1단계: SWR 패턴 적용 (방안 A) — P0

- [x] `src/hooks/useQuote.ts` — SWR 패턴으로 리팩터링
  - [x] 캐시 만료 시 stale 데이터 즉시 표시 (`setQuote(cached.quote)`)
  - [x] 캐시 없음(최초 설치) 시 fallback 즉시 표시
  - [x] 백그라운드에서 API 호출 후 명언 교체
  - [x] catch 블록에서 중복 `loadFallbackQuote()` 제거
- [x] `src/components/Quote.tsx` — 명언 교체 fade 트랜지션
  - [x] `<div>` 태그에 `key={quote.id || quote.content}` 추가

## 2단계: Settings 블로킹 제거 (방안 B) — P0

- [ ] `src/entrypoints/newtab/App.tsx` — `if (!loaded) return null` 라인 삭제

## 3단계: API 타임아웃 (방안 C) — P1

- [ ] `src/lib/inspireme-api.ts` — AbortController 기반 타임아웃 추가
  - [ ] `API_TIMEOUT_MS = 5000` 상수 추가
  - [ ] `apiFetch` 함수에 `AbortController` + `setTimeout` 적용
  - [ ] `finally` 블록에서 `clearTimeout` 처리

## 4단계: 배경 점진적 표시 (방안 D) — P2

- [ ] `src/hooks/useBackground.ts` — SWR 패턴 적용
  - [ ] 캐시 만료 시 stale URL 즉시 표시
  - [ ] 최초 설치 시 `defaultBgUrl` 즉시 표시
  - [ ] 백그라운드에서 Unsplash API + preload 후 교체

## 5단계: 빌드 및 테스트

- [ ] `pnpm build` 빌드 성공 확인
- [ ] `pnpm lint` 린트 통과 확인
- [ ] MCP Playwright로 수동 테스트 (Backend + Frontend 실행 필요)
  - [ ] 새 탭 열기 → 명언이 즉시 표시되는지 확인 (skeleton 없이)
  - [ ] 새 탭 열기 → 배경이 즉시 표시되는지 확인
  - [ ] chrome.storage 비운 후 새 탭 → fallback 명언 즉시 표시 → API 응답 후 교체 확인
  - [ ] API 서버 중단 상태에서 새 탭 → stale/fallback 명언 유지 확인
