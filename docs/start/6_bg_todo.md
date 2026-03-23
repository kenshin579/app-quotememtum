# Unsplash 배경 이미지 고퀄리티 개선 — TODO

## Phase 1: API 및 타입 수정

- [x] `src/lib/unsplash-api.ts` — `UnsplashPhoto` 타입의 `urls`에 `raw`, `full` 필드 추가
- [x] `src/lib/unsplash-api.ts` — `fetchRandomPhoto()` 파라미터에 `orientation: 'landscape'` 추가
- [x] `src/lib/unsplash-api.ts` — `buildHighQualityUrl(rawUrl, width?)` 함수 추가
  - `screen.width × devicePixelRatio` 기반 동적 너비 (최대 2560px, dpr 최대 2x)
  - Imgix 파라미터: `w`, `q=85`, `fm=jpg`, `fit=max`, `auto=format`

## Phase 2: useBackground 훅 수정

- [x] `src/hooks/useBackground.ts` — `buildHighQualityUrl` import 추가
- [x] `src/hooks/useBackground.ts` — `preloadImage()` 프리로딩 함수 추가
- [x] `src/hooks/useBackground.ts` — `setBgUrl(photo.urls.regular)` → `buildHighQualityUrl(photo.urls.raw)` + 프리로딩 적용
- [x] `src/hooks/useBackground.ts` — 캐시 저장 URL도 동일하게 변경

## Phase 3: 테스트 및 검증

- [ ] `pnpm dev`로 개발 서버 실행 후 새 탭에서 배경 이미지 확인
- [ ] MCP Playwright로 새 탭 열어 배경 이미지 로딩 확인
  - 이미지 URL에 `w=`, `q=85`, `auto=format` 파라미터 포함되는지 확인
  - `orientation=landscape`로 가로 이미지만 반환되는지 확인
- [ ] 캐시 동작 확인: 새 탭 재오픈 시 캐시된 고퀄리티 이미지 표시
- [ ] Unsplash API 에러 시 기본 배경(default-bg.jpg) 폴백 동작 확인
- [ ] `pnpm build` 프로덕션 빌드 정상 완료 확인
- [ ] `pnpm lint` 린트 통과 확인
