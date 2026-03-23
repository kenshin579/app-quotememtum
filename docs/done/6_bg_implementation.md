# Unsplash 배경 이미지 고퀄리티 개선 — 구현 문서

## 1. UnsplashPhoto 타입 확장

**파일**: `src/lib/unsplash-api.ts`

`urls` 타입에 `raw`, `full` 추가:

```typescript
export interface UnsplashPhoto {
  id: string;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  user: { name: string; links: { html: string } };
  location?: { title: string };
  links: { html: string };
}
```

## 2. API 호출에 `orientation=landscape` 추가

**파일**: `src/lib/unsplash-api.ts`

`fetchRandomPhoto()`의 `URLSearchParams`에 `orientation` 파라미터 추가:

```typescript
const params = new URLSearchParams({
  client_id: UNSPLASH_CLIENT_ID,
  collections: UNSPLASH_COLLECTION_ID,
  orientation: 'landscape',
});
```

> 새 탭은 항상 가로이므로 가로 이미지만 반환받아 crop 손실 방지

## 3. 고퀄리티 URL 생성 함수 추가

**파일**: `src/lib/unsplash-api.ts`

`raw` URL에 Imgix 파라미터를 붙여 화면 크기 맞춤 고퀄리티 URL 생성:

```typescript
export function buildHighQualityUrl(rawUrl: string, width?: number): string {
  const screenW = width ?? window.screen.width;
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  const finalW = Math.min(Math.round(screenW * dpr), 2560);
  const params = new URLSearchParams({
    w: String(finalW),
    q: '85',
    fm: 'jpg',
    fit: 'max',
    auto: 'format',
  });
  return `${rawUrl}&${params}`;
}
```

| 파라미터 | 설명 |
|----------|------|
| `w` | `min(screen.width × dpr, 2560)` — 최종 너비가 2560px을 초과하지 않도록 cap |
| `q=85` | 품질 85% — 시각적 차이 없이 용량 절약 |
| `fit=max` | 원본 비율 유지 리사이즈 |
| `auto=format` | WebP 지원 브라우저에서 자동 전환 (~30% 절감) |

## 4. useBackground 훅에서 고퀄리티 URL 사용

**파일**: `src/hooks/useBackground.ts`

### 4-1. 이미지 프리로딩 함수 추가

고해상도 이미지는 용량이 크므로 `Image` 객체로 프리로딩 후 배경 적용:

```typescript
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}
```

### 4-2. `urls.regular` → `buildHighQualityUrl(urls.raw)` 변경

```typescript
import { fetchRandomPhoto, buildHighQualityUrl, type UnsplashPhoto } from '../lib/unsplash-api';

// loadBackground 내부
const photo = await fetchRandomPhoto();
const hqUrl = buildHighQualityUrl(photo.urls.raw);
await preloadImage(hqUrl);
setBgUrl(hqUrl);
setPhotoInfo(photo);
await storage.set<CachedWallpaper>('wallpaper', {
  url: hqUrl,
  photo,
  timestamp: Date.now(),
});
```

## 5. 변경 파일 요약

| 파일 | 변경 사항 |
|------|----------|
| `src/lib/unsplash-api.ts` | `UnsplashPhoto.urls`에 `raw`, `full` 추가 / `orientation=landscape` 파라미터 / `buildHighQualityUrl()` 함수 |
| `src/hooks/useBackground.ts` | `buildHighQualityUrl` import / `preloadImage()` 함수 / URL 교체 (`regular` → `raw` 기반) |
