# Widget API 전환 — Todo

## Phase 1: 타입 및 API 레이어 변경

- [x] `src/types/quote.ts` — `Quote` 인터페이스에 `authorSlug`, `topics` 추가, `QuoteOfTheDay`·`AuthorInfo` 제거
- [x] `src/lib/constants.ts` — `INSPIREME_API_URL` 경로 `/api/v1` → `/api/widget`
- [x] `src/lib/inspireme-api.ts` — `apiKey` 파라미터·`Authorization` 헤더 제거, 엔드포인트 변경 (`lang`, `/random`)
- [x] `src/assets/fallback-quotes.json` — 각 항목에 `authorSlug`, `topics` 필드 추가

## Phase 2: 훅 및 스토리지

- [x] `src/hooks/useQuote.ts` — API Key 로직 제거, 항상 API 호출, 401 에러 분기 제거
- [x] `src/lib/storage.ts` — `syncStorage` 객체 전체 제거
- [x] `src/types/settings.ts` — `QuoteFrequency` 타입 `2|6|12` → `number`, `UserSettings.quoteFrequency: number`

## Phase 3: UI 변경

- [ ] `src/components/Quote.tsx` — 텍스트 크기 (`text-2xl` → `text-4xl`, `text-lg` → `text-xl`)
- [ ] `src/components/Quote.tsx` — 명언 클릭 시 현재 탭에서 열기 (`target="_blank"` 제거)
- [ ] `src/components/Quote.tsx` — `authorSlug`로 작가 페이지 링크, `AuthorInfo` 제거
- [ ] `src/components/settings/GeneralSettings.tsx` — 갱신 주기 `select` → `input type="number"` (1~24시간)
- [ ] `src/components/settings/SettingsModal.tsx` — `apiKey` 탭 제거, 탭 2개만 유지

## Phase 4: 파일 정리

- [ ] `src/components/settings/ApiKeySettings.tsx` — 파일 삭제
- [ ] `src/components/AuthorInfo.tsx` — 파일 삭제 (Widget API에 authorInfo 없음)

## Phase 5: 빌드 및 테스트

- [ ] `pnpm build` 정상 빌드 확인
- [ ] `pnpm lint` 에러 없음 확인
- [ ] MCP Playwright로 테스트:
  - [ ] 새 탭 열기 → 명언이 API Key 없이 표시되는지 확인
  - [ ] 명언 클릭 → 현재 탭에서 명언 페이지 이동 확인
  - [ ] 설정 모달 → API Key 탭 없음 확인
  - [ ] 설정 모달 → 갱신 주기 숫자 입력 + 화살표 동작 확인
  - [ ] 명언 텍스트 크기 증가 확인
