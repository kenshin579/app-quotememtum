# Chrome Extension 초기 로딩 속도 개선 — 구현 문서

## 변경 대상 파일

| 파일 | 방안 | 변경 요약 |
|------|------|----------|
| `src/hooks/useQuote.ts` | A (SWR) | stale 캐시/fallback 즉시 표시 + 백그라운드 갱신 |
| `src/components/Quote.tsx` | A (SWR) | 명언 교체 시 fade 트랜지션 추가 |
| `src/entrypoints/newtab/App.tsx` | B | `if (!loaded) return null` 블로킹 제거 |
| `src/lib/inspireme-api.ts` | C | AbortController 기반 5초 타임아웃 |
| `src/hooks/useBackground.ts` | D | 기본 배경 먼저 표시 + 고화질 preload 후 교체 |

---

## 방안 A: useQuote.ts — SWR 패턴 적용

### 현재 코드 (28-56행)

```typescript
const loadQuote = useCallback(async () => {
  setLoading(true);
  setError(null);

  const cached = await storage.get<CachedQuote>('quote');
  if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
    setQuote(cached.quote);
    setLoading(false);
    return;
  }

  try {
    let newQuote: Quote;
    if (settings.quoteMode === 'qotd') {
      newQuote = await fetchQuoteOfTheDay(settings.language);
    } else {
      newQuote = await fetchRandomQuote(settings.language);
    }
    setQuote(newQuote);
    await storage.set<CachedQuote>('quote', { quote: newQuote, timestamp: Date.now() });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    }
    loadFallbackQuote();
  } finally {
    setLoading(false);
  }
}, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);
```

### 변경 코드

```typescript
const loadQuote = useCallback(async () => {
  setError(null);

  const cached = await storage.get<CachedQuote>('quote');

  // 1) 캐시 유효 → 즉시 표시, API 호출 없이 종료
  if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
    setQuote(cached.quote);
    setLoading(false);
    return;
  }

  // 2) stale 캐시 또는 fallback을 즉시 표시
  if (cached) {
    setQuote(cached.quote);
  } else {
    loadFallbackQuote();
  }
  setLoading(false);

  // 3) 백그라운드 revalidate
  try {
    let newQuote: Quote;
    if (settings.quoteMode === 'qotd') {
      newQuote = await fetchQuoteOfTheDay(settings.language);
    } else {
      newQuote = await fetchRandomQuote(settings.language);
    }
    setQuote(newQuote);
    await storage.set<CachedQuote>('quote', { quote: newQuote, timestamp: Date.now() });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    }
    // stale/fallback이 이미 표시 중이므로 loadFallbackQuote() 불필요
  }
}, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);
```

### 핵심 변경점

- `setLoading(true)` 제거 — stale/fallback 즉시 표시를 위해 초기 loading 상태를 유지하되, 캐시 확인 후 바로 `setLoading(false)`
- 캐시 만료 시에도 `cached.quote`를 먼저 `setQuote()` → skeleton 없이 이전 명언 표시
- catch 블록에서 `loadFallbackQuote()` 제거 — 이미 2단계에서 표시됨

---

## 방안 A 보조: Quote.tsx — 명언 교체 fade 트랜지션

SWR 패턴에서 stale → fresh 명언 교체 시 자연스러운 전환을 위해 `key` prop으로 fade-in을 트리거한다.

### 현재 코드 (42행)

```tsx
<div className="text-center animate-fade-in">
```

### 변경 코드

```tsx
<div key={quote.id || quote.content} className="text-center animate-fade-in">
```

`key`가 바뀌면 React가 DOM을 재생성하면서 `animate-fade-in`이 다시 재생된다.

---

## 방안 B: App.tsx — Settings 블로킹 제거

### 현재 코드 (36행)

```tsx
if (!loaded) return null;
```

### 변경 코드

해당 라인을 삭제한다.

### 근거

`useSettings`의 초기값이 이미 `DEFAULT_SETTINGS`이므로 (`useState<UserSettings>(DEFAULT_SETTINGS)`), `loaded` 전에도 기본값으로 정상 렌더링 가능하다.

---

## 방안 C: inspireme-api.ts — API 타임아웃

### 현재 코드 (14-28행)

```typescript
async function apiFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = params?.toString()
    ? `${INSPIREME_API_URL}${path}?${params}`
    : `${INSPIREME_API_URL}${path}`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  const json: QuoteApiResponse<T> = await res.json();
  return json.data;
}
```

### 변경 코드

```typescript
const API_TIMEOUT_MS = 5000;

async function apiFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = params?.toString()
    ? `${INSPIREME_API_URL}${path}?${params}`
    : `${INSPIREME_API_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new ApiError(res.status, body);
    }

    const json: QuoteApiResponse<T> = await res.json();
    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### 핵심 변경점

- `AbortController` + `setTimeout(5초)` 조합으로 타임아웃 구현
- `finally` 블록에서 `clearTimeout`으로 정상 응답 시 타이머 정리
- 타임아웃 발생 시 `AbortError` throw → useQuote의 catch에서 처리됨

---

## 방안 D: useBackground.ts — 배경 점진적 표시

### 현재 코드 (32-58행)

```typescript
const loadBackground = useCallback(async () => {
  setLoading(true);

  const cached = await storage.get<CachedWallpaper>('wallpaper');
  if (cached && !isExpired(cached.timestamp)) {
    setBgUrl(cached.url);
    setPhotoInfo(cached.photo);
    setLoading(false);
    return;
  }

  try {
    const photo = await fetchRandomPhoto();
    const hqUrl = buildHighQualityUrl(photo.urls.raw);
    await preloadImage(hqUrl);
    setBgUrl(hqUrl);
    setPhotoInfo(photo);
    await storage.set<CachedWallpaper>('wallpaper', { ... });
  } catch {
    setBgUrl(defaultBgUrl);
  } finally {
    setLoading(false);
  }
}, []);
```

### 변경 코드

```typescript
const loadBackground = useCallback(async () => {
  setLoading(true);

  const cached = await storage.get<CachedWallpaper>('wallpaper');
  if (cached && !isExpired(cached.timestamp)) {
    setBgUrl(cached.url);
    setPhotoInfo(cached.photo);
    setLoading(false);
    return;
  }

  // stale 캐시가 있으면 먼저 표시, 없으면 기본 배경
  if (cached) {
    setBgUrl(cached.url);
    setPhotoInfo(cached.photo);
  } else {
    setBgUrl(defaultBgUrl);
  }
  setLoading(false);

  try {
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
  } catch {
    // stale/기본 배경이 이미 표시 중
  }
}, []);
```

### 핵심 변경점

- 캐시 만료 시에도 stale URL을 먼저 표시 (useQuote와 동일한 SWR 패턴)
- 최초 설치 시 `defaultBgUrl` 즉시 표시
- preload 완료 후 고화질 이미지로 교체 — `Background` 컴포넌트의 `transition-opacity duration-1000`이 자연스러운 전환 처리
