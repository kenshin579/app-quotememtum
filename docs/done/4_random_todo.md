# 랜덤 명언 모드 캐시 버그 수정 — Todo

## 1단계: useQuote.ts — 모드별 캐시 분기

- [x] `CachedQuote` 인터페이스에 `quoteMode: QuoteMode` 필드 추가
- [x] `QuoteMode` 타입 import 추가
- [x] `isDayChanged(timestamp: number): boolean` 함수 추가
- [x] `loadQuote` 내부 캐시 로직 변경
  - [x] `modeChanged` 변수 추가 (`cached?.quoteMode !== settings.quoteMode`)
  - [x] qotd 모드: `isDayChanged()`로 날짜 기반 캐시 유효 판정 (`quoteFrequency` 제거)
  - [x] random 모드: early return 제거 → 항상 SWR 진행
  - [x] 모드 전환 시: stale 캐시 대신 fallback 표시
- [x] `storage.set()` 호출 시 `quoteMode: settings.quoteMode` 포함
- [x] 미사용 `isExpired` 함수 제거
- [x] 의존성 배열에서 불필요한 `settings.quoteFrequency` 제거

## 2단계: GeneralSettings.tsx — 갱신 주기 조건부 표시

- [x] "명언 갱신 주기" `SettingRow`를 `settings.quoteMode === 'random'` 조건으로 감싸기

## 3단계: 빌드 및 린트

- [x] `pnpm build` 빌드 성공 확인
- [x] `pnpm lint` 린트 통과 확인 (기존 `set-state-in-effect` 에러 2개는 변경 전부터 존재, 신규 에러 없음)

## 4단계: 테스트 (MCP Playwright)

- [ ] qotd 모드 — 같은 날 새 탭 열기 → 동일 명언 유지 확인
- [ ] qotd 모드 — 설정에서 "명언 갱신 주기" 숨김 확인
- [ ] random 모드 — 새 탭 열기 → 이전 명언 즉시 표시 후 새 명언으로 교체 확인
- [ ] random 모드 — 설정에서 "명언 갱신 주기" 표시 확인
- [ ] qotd → random 모드 전환 → 명언이 변경되는지 확인
- [ ] random → qotd 모드 전환 → 명언이 변경되는지 확인
