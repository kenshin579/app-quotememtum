# Chrome Extension 초기 로딩 속도 개선 PRD

## 1. 현재 상태 분석

### 현재 로딩 플로우

```
새 탭 열림
  ↓
React 앱 로드 (JS 번들 파싱)
  ↓
useSettings() — chrome.storage.local.get() [비동기]
  ↓
if (!loaded) return null  ← 전체 UI 블로킹 (빈 화면)
  ↓
settings 로드 완료 → UI 렌더링 시작
  ↓
useQuote() + useBackground() 동시 시작
  ├─ Quote: storage 캐시 확인 → 캐시 미스 시 API 호출 (500ms~2s)
  └─ Background: storage 캐시 확인 → 캐시 미스 시 Unsplash API + 이미지 preload (1~3s)
  ↓
Quote skeleton(animate-pulse) 표시
  ↓
API 응답 수신 → 명언 표시 + fade-in (0.5s)
```

### 문제점

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| 1 | **Settings 로딩이 전체 UI를 블로킹** | `App.tsx:36` — `if (!loaded) return null` | settings 로드 전까지 완전한 빈 화면. 시계, 배경 등 settings와 무관한 요소도 표시되지 않음 |
| 2 | **캐시 미스 시 API 호출 지연** | `useQuote.ts:39-45` | 최초 설치 또는 캐시 만료 시 InspireMe API 응답까지 500ms~2초 소요. skeleton만 표시 |
| 3 | **배경 이미지 preload가 표시를 차단** | `useBackground.ts:46` — `await preloadImage(hqUrl)` | 고화질 이미지(최대 2560px) 완전 다운로드까지 배경 미표시. 1~3초 소요 |
| 4 | **fallback 명언을 에러 시에만 사용** | `useQuote.ts:49-53` | `fallback-quotes.json`에 10개 명언이 있지만, API 에러 발생 시에만 사용. 즉시 표시용으로 활용하지 않음 |
| 5 | **API 타임아웃 미설정** | `inspireme-api.ts:19` — `fetch(url)` | 타임아웃 없이 브라우저 기본값(~300초) 사용. 서버 응답 지연 시 무한 대기 |

### 측정 기준 (현재)

| 시나리오 | 첫 화면 표시 (FCP) | 명언 표시 | 배경 표시 |
|----------|-------------------|----------|----------|
| 캐시 히트 | ~100ms | ~150ms | ~150ms |
| 캐시 미스 (최초 설치) | ~100ms | **1~3초** | **2~4초** |
| API 장애 시 | ~100ms | **무한 대기** (타임아웃 없음) | fallback 배경 표시 |

## 2. 개선 방안

### 방안 A: Stale-While-Revalidate (SWR) — 이전 명언 즉시 표시 후 교체

**Stale-While-Revalidate** 패턴을 적용한다. 캐시가 만료되더라도 저장된 이전 명언을 즉시 표시하고, 백그라운드에서 API를 호출하여 응답이 오면 교체한다. 최초 설치 시(저장된 명언 없음)에만 fallback 명언을 사용한다.

**현재 vs SWR 비교**:

| 시나리오 | 현재 동작 | SWR 적용 후 |
|----------|----------|------------|
| 캐시 유효 | 캐시된 명언 즉시 표시 | 동일 |
| 캐시 만료 | skeleton → API 대기 (1~3초) | **이전 명언 즉시 표시** → API 응답 시 교체 |
| 최초 설치 | skeleton → API 대기 (1~3초) | **fallback 명언 즉시 표시** → API 응답 시 교체 |
| API 장애 | skeleton 무한 표시 | 이전 명언 또는 fallback 유지 |

**변경 내용 (useQuote.ts)**:

```typescript
// 현재: 캐시 만료 → skeleton 표시 → API 호출 → 대기 → 표시
// 개선: 캐시 만료 → 이전 캐시값 즉시 표시 → API 호출 → 응답 시 교체
//       캐시 없음(최초) → fallback 즉시 표시 → API 호출 → 응답 시 교체

const loadQuote = useCallback(async () => {
  setError(null);

  const cached = await storage.get<CachedQuote>('quote');

  // 1) 캐시 유효: 즉시 표시하고 종료
  if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
    setQuote(cached.quote);
    setLoading(false);
    return;
  }

  // 2) 캐시 만료 또는 없음: stale 데이터 또는 fallback을 먼저 표시
  if (cached) {
    // 만료된 캐시라도 이전 명언을 즉시 표시 (SWR의 "stale" 단계)
    setQuote(cached.quote);
  } else {
    // 최초 설치: fallback 명언 표시
    loadFallbackQuote();
  }
  setLoading(false);

  // 3) 백그라운드에서 API 호출 → 응답 시 교체 (SWR의 "revalidate" 단계)
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
    // stale 데이터 또는 fallback이 이미 표시 중이므로 추가 처리 불필요
    if (err instanceof ApiError && err.status === 429) {
      setError('요청 한도를 초과했습니다.');
    }
  }
}, [/* deps */]);
```

**SWR 패턴의 장점**:
- **연속성**: 어제 봤던 명언이 먼저 보이고, 새 명언으로 자연스럽게 전환
- **다양성**: 내장 fallback 10개보다 API 결과가 훨씬 다양
- **오프라인/장애 대응**: 마지막 API 결과가 그대로 유지되어 의미 있는 콘텐츠 보장

### 방안 B: Settings 기본값으로 즉시 렌더링

settings 로딩 완료를 기다리지 않고 `DEFAULT_SETTINGS`로 먼저 렌더링한 뒤, 저장된 settings가 로드되면 업데이트한다.

**변경 내용 (App.tsx)**:

```tsx
// 현재: settings 로드 전 완전한 빈 화면
if (!loaded) return null;

// 개선: 블로킹 제거 — DEFAULT_SETTINGS로 즉시 렌더링
// useSettings의 초기값이 이미 DEFAULT_SETTINGS이므로
// loaded 체크를 제거하면 즉시 렌더링 가능
```

> **주의**: settings 로드 후 quoteFont, clockFormat 등이 바뀌면 UI가 깜빡일 수 있음. 이를 최소화하기 위해 font/layout 관련 settings만 loaded 체크 유지하는 방안도 고려.

### 방안 C: API 타임아웃 + AbortController

API 호출에 타임아웃을 설정하여 서버 응답 지연 시 빠르게 fallback으로 전환한다.

**변경 내용 (inspireme-api.ts)**:

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

### 방안 D: 배경 이미지 점진적 표시

배경 이미지 preload 완료를 기다리지 않고, 기본 배경(또는 blur placeholder)을 먼저 표시한 뒤 고화질 이미지가 로드되면 교체한다.

**변경 내용 (useBackground.ts)**:

```typescript
// 현재: await preloadImage(hqUrl) → preload 완료까지 배경 미표시
// 개선: 먼저 기본 배경 표시 → preload 완료 후 교체

try {
  const photo = await fetchRandomPhoto();
  const hqUrl = buildHighQualityUrl(photo.urls.raw);

  // [개선] 기본 배경을 먼저 표시
  setBgUrl(defaultBgUrl);
  setPhotoInfo(photo);
  setLoading(false);

  // 고화질 이미지 로드 완료 시 교체
  await preloadImage(hqUrl);
  setBgUrl(hqUrl);
  await storage.set<CachedWallpaper>('wallpaper', { url: hqUrl, photo, timestamp: Date.now() });
} catch {
  setBgUrl(defaultBgUrl);
}
```

## 3. 채택 방안

**A + B + C를 모두 적용**한다. D는 선택 적용.

| 방안 | 우선순위 | 효과 | 복잡도 |
|------|---------|------|--------|
| **A. SWR (이전 명언 즉시 표시 + 백그라운드 갱신)** | P0 | 체감 로딩 시간 0에 가깝게 단축 | 낮음 |
| **B. Settings 블로킹 제거** | P0 | 빈 화면 시간 제거 | 낮음 |
| **C. API 타임아웃** | P1 | 서버 장애 시 무한 대기 방지 | 낮음 |
| D. 배경 점진적 표시 | P2 | 배경 표시 시간 단축 | 중간 |

## 4. 변경 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `src/entrypoints/newtab/App.tsx` | `if (!loaded) return null` 블로킹 제거 또는 완화 |
| `src/hooks/useQuote.ts` | SWR 패턴 적용 — 만료된 캐시 즉시 표시 + 백그라운드 갱신, 최초 설치 시 fallback 사용 |
| `src/lib/inspireme-api.ts` | `AbortController` 기반 5초 타임아웃 추가 |
| `src/hooks/useBackground.ts` | (선택) 기본 배경 먼저 표시 → 고화질 이미지 로드 후 교체 |

## 5. 기대 효과

| 시나리오 | Before | After |
|----------|--------|-------|
| 캐시 히트 — 명언 표시 | ~150ms | ~150ms (변화 없음) |
| 캐시 미스 — 첫 화면 | 빈 화면 ~100ms | **즉시 렌더링** |
| 캐시 만료 — 명언 표시 | **1~3초** (skeleton) | **~50ms** (이전 명언 즉시) → API 응답 시 교체 |
| 최초 설치 — 명언 표시 | **1~3초** (skeleton) | **~50ms** (fallback 즉시) → API 응답 시 교체 |
| API 장애 시 | **무한 대기** | **5초 후 fallback 유지** |
| 배경 표시 (방안 D 적용 시) | 2~4초 후 표시 | 즉시 기본 배경 → 고화질 교체 |

## 6. 리스크 및 고려사항

- **명언 교체 시 깜빡임**: stale 명언 → 새 API 명언으로 교체될 때 텍스트가 바뀌는 것이 어색할 수 있음. fade 트랜지션으로 자연스럽게 전환 필요
- **Settings 기본값과 저장값 차이**: 사용자가 font를 변경한 경우, 기본 font로 먼저 표시된 뒤 변경됨. 대부분의 사용자는 기본값을 사용하므로 영향 적음
- **캐시 히트 시 영향 없음**: 캐시 유효 경로에서는 기존과 완전히 동일하게 동작
- **Unsplash API 제한**: 기존과 동일 (50회/시간). 요청 횟수 변화 없음
- **오프라인 시 이점**: SWR 패턴 덕분에 네트워크 없이도 마지막 API 결과가 표시되어 빈 화면 방지
