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

- [x] Unsplash API `orientation=landscape` 호출 검증 — 가로 이미지만 반환 확인
- [x] `buildHighQualityUrl()` URL 파라미터 검증 — `w=`, `q=85`, `auto=format` 포함 확인
- [x] 이미지 크기 비교: regular 232KB → HQ 2560px 1.2MB, HQ 1920px 731KB (합리적)
- [x] 최종 너비 2560px cap 적용 — Retina(3840px) 시 과도한 용량(3.6MB) 방지
- [ ] 캐시 동작 확인: 새 탭 재오픈 시 캐시된 고퀄리티 이미지 표시
- [ ] Unsplash API 에러 시 기본 배경(default-bg.jpg) 폴백 동작 확인
- [x] `pnpm build` 프로덕션 빌드 정상 완료 확인
- [x] `pnpm lint` 린트 통과 확인
