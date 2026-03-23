# Widget API 전환 — 구현 문서

## 1. 타입 정의 변경 (`src/types/quote.ts`)

Widget API 응답에 맞게 `Quote` 인터페이스 통합, 불필요한 타입 제거.

```typescript
export interface Quote {
  id: string;
  content: string;
  author: string;
  authorSlug: string;
  language: 'ko' | 'en';
  topics: string[];
}

export interface QuoteApiResponse<T> {
  data: T;
}
```

제거 대상: `QuoteOfTheDay`, `AuthorInfo`.

## 2. 상수 변경 (`src/lib/constants.ts`)

```typescript
export const INSPIREME_API_URL = `${INSPIREME_BASE_URL}/api/widget`;
```

## 3. API 클라이언트 (`src/lib/inspireme-api.ts`)

인증 제거, 엔드포인트 변경. `ApiError` 클래스는 유지 (429 등 에러 처리 필요).

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

export async function fetchQuoteOfTheDay(language?: 'ko' | 'en'): Promise<Quote> {
  const params = new URLSearchParams();
  if (language) params.set('lang', language);
  return apiFetch<Quote>('/quote-of-the-day', params);
}

export async function fetchRandomQuote(language?: 'ko' | 'en'): Promise<Quote> {
  const params = new URLSearchParams();
  if (language) params.set('lang', language);
  params.set('count', '1');
  return apiFetch<Quote>('/random', params);
}
```

변경 포인트:
- `apiKey` 파라미터 제거
- `Authorization` 헤더 제거
- `language` → `lang` 파라미터명
- `/quotes/random` → `/random`

## 4. useQuote 훅 (`src/hooks/useQuote.ts`)

API Key 관련 로직 전부 제거, 항상 API 호출.

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

제거: `syncStorage.getApiKey()`, `apiKey` 없을 때 fallback 분기, 401 에러 처리.

## 5. 스토리지 (`src/lib/storage.ts`)

`syncStorage` 객체 전체 제거 (`getApiKey`, `setApiKey`, `removeApiKey`).

## 6. 설정 UI

### `SettingsModal.tsx`

- `ApiKeySettings` import 제거
- `apiKey` 탭 제거 → 탭 2개만 유지: `general`, `about`
- `Tab` 타입: `'general' | 'apiKey' | 'about'` → `'general' | 'about'`

### `ApiKeySettings.tsx`

파일 삭제.

### `GeneralSettings.tsx` — 명언 갱신 주기

`select` → `input type="number"` 변경:

```tsx
<SettingRow label="명언 갱신 주기">
  <div className="flex items-center gap-2">
    <input
      type="number"
      min={1}
      max={24}
      step={1}
      value={settings.quoteFrequency}
      onChange={(e) => {
        const v = Math.min(24, Math.max(1, Number(e.target.value) || 1));
        onUpdate({ quoteFrequency: v });
      }}
      className="w-16 rounded bg-gray-700 px-2 py-1.5 text-center text-sm text-white"
    />
    <span className="text-sm text-gray-400">시간</span>
  </div>
</SettingRow>
```

### `settings.ts` 타입

```typescript
// 변경 전
export type QuoteFrequency = 2 | 6 | 12;

// 변경 후 (타입 제거, number 사용)
// QuoteFrequency 타입 삭제
// UserSettings에서 quoteFrequency: number (1~24)
```

## 7. Quote 컴포넌트 (`src/components/Quote.tsx`)

### 명언 클릭 → 현재 탭에서 열기

`target="_blank"` 제거, `rel="noopener noreferrer"` 제거:

```tsx
<a href={quoteUrl} className="cursor-pointer hover:opacity-80 transition-opacity">
  {textContent}
</a>
```

### 작가 이름 → 작가 페이지 링크

`authorSlug` 활용:

```tsx
const authorUrl = quote.authorSlug
  ? `${INSPIREME_BASE_URL}/authors/${quote.authorSlug}`
  : undefined;

// 작가 이름 부분
{authorUrl ? (
  <a href={authorUrl} className="hover:underline">— {quote.author}</a>
) : (
  <span>— {quote.author}</span>
)}
```

### 텍스트 크기

- 명언: `text-2xl` → `text-4xl`
- 작가: `text-lg` → `text-xl`

### 제거

- `AuthorInfo` 컴포넌트 import 및 렌더링
- `QuoteOfTheDay` 타입 캐스팅 (`quote as QuoteOfTheDay`)

## 8. fallback 명언 (`src/assets/fallback-quotes.json`)

각 항목에 `authorSlug`, `topics` 추가:

```json
{
  "id": "",
  "content": "...",
  "author": "...",
  "authorSlug": "",
  "language": "ko",
  "topics": []
}
```

## 9. 불필요 파일 정리

| 파일 | 조치 |
|------|------|
| `src/components/settings/ApiKeySettings.tsx` | 삭제 |
| `src/components/AuthorInfo.tsx` | 삭제 (Widget API에 authorInfo 없음) |
