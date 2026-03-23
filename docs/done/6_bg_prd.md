# Unsplash 배경 이미지 고퀄리티 개선 PRD

## 1. 현재 상태 분석

### 현재 구현

| 항목 | 현재 값 | 비고 |
|------|---------|------|
| API 엔드포인트 | `GET /photos/random` | 랜덤 사진 1장 |
| 파라미터 | `client_id`, `collections=1065861` | 컬렉션 필터만 사용 |
| 사용 URL 변형 | `urls.regular` | **w=1080, q=75** |
| 캐시 | 24시간 (chrome.storage) | - |
| 표시 방식 | CSS `background-image` + `bg-cover` | 전체 화면 |

### 문제점

1. **해상도 부족**: `regular`은 **1080px** 너비로, Full HD(1920px) 이상 모니터에서 이미지가 확대되어 흐릿하게 보임
2. **JPEG 품질 낮음**: `q=75`로 압축된 이미지 — 배경 전체 화면에서는 압축 아티팩트가 눈에 띔
3. **방향 미지정**: portrait(세로) 이미지도 반환되어 새 탭(가로)에서 crop되면서 품질 저하
4. **`raw`, `full` URL 미활용**: API 응답에 포함되는 고해상도 URL을 사용하지 않음
5. **UnsplashPhoto 타입에 `raw`, `full` 누락**: 타입 정의에서 `regular`, `small`, `thumb`만 선언

### Unsplash 이미지 URL 변형 비교

| 변형 | 해상도 | 품질 | URL 예시 |
|------|--------|------|----------|
| `raw` | 원본 (커스텀 가능) | 원본 | `photo-xxx` (Imgix 파라미터 추가 가능) |
| `full` | 원본 크기 | q=75 | `photo-xxx?q=75&fm=jpg` |
| `regular` | **w=1080** | q=75 | `photo-xxx?q=75&fm=jpg&w=1080&fit=max` |
| `small` | w=400 | q=75 | 썸네일용 |
| `thumb` | w=200 | q=75 | 아이콘용 |

> **핵심**: `raw` URL에 Imgix 파라미터를 직접 추가하면 해상도와 품질을 자유롭게 제어할 수 있음

## 2. 채택 방안: `raw` URL + 커스텀 Imgix 파라미터

`urls.raw`에 Imgix 파라미터를 붙여서 화면 크기에 최적화된 고퀄리티 이미지를 요청한다.

```
{urls.raw}?w={screen.width×dpr}&q=85&fm=jpg&fit=max&auto=format
```

| 파라미터 | 값 | 설명 |
|----------|-----|------|
| `w` | `screen.width × dpr` | 화면 해상도 기반 동적 설정 (최대 2560px, dpr 최대 2x) |
| `q` | `85` | 품질 85% — 시각적 차이 거의 없으면서 용량 절약 |
| `fit` | `max` | 원본 비율 유지하며 지정 크기 이내로 리사이즈 |
| `auto` | `format` | 브라우저 지원 시 WebP 자동 전환 (용량 ~30% 절감) |

추가로 API 호출에 `orientation=landscape` 파라미터를 적용하여 가로 이미지만 반환받는다.

> 구현 세부사항은 `6_bg_implementation.md` 참고

## 3. 변경 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `src/lib/unsplash-api.ts` | `UnsplashPhoto` 타입에 `raw`, `full` 추가 / `orientation=landscape` 파라미터 / `buildHighQualityUrl()` 함수 |
| `src/hooks/useBackground.ts` | `urls.regular` → `buildHighQualityUrl(urls.raw)` / 이미지 프리로딩 |

## 4. 기대 효과

| 항목 | Before | After |
|------|--------|-------|
| 이미지 너비 | 1080px 고정 | 화면 해상도 기반 동적 (최대 2560px) |
| JPEG 품질 | q=75 | q=85 |
| 이미지 방향 | 랜덤 (세로 포함) | 가로(landscape) 전용 |
| Retina 지원 | 없음 | devicePixelRatio 반영 (최대 2x) |
| 포맷 최적화 | JPEG 고정 | WebP 자동 전환 (auto=format) |
| 용량 증가 | - | ~200KB → ~500KB (WebP 시 ~350KB) |
| 로딩 UX | 즉시 표시 (저퀄) | 프리로딩 후 표시 (고퀄) |

## 5. 리스크 및 고려사항

- **네트워크 용량 증가**: 이미지 용량이 ~2~3배 증가하지만, 24시간 캐시로 실사용 영향 미미
- **첫 로딩 시간**: 프리로딩 추가로 첫 표시까지 약간의 지연 발생 → 기본 배경(default-bg.jpg) 또는 blur placeholder로 커버
- **API 제한**: Unsplash free tier는 시간당 50회 제한 — 기존과 동일 (요청 횟수 변화 없음)
- **`collections`와 `query` 동시 사용 불가**: Unsplash API 제약 — 현재 `collections` 사용 중이므로 `query` 파라미터 추가 불가. 컬렉션 내 이미지 품질 개선은 컬렉션 자체를 관리하거나, 컬렉션 대신 `query=nature wallpaper`로 전환하는 것을 별도 검토
