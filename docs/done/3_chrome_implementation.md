# InspireMe Chrome Extension 현대화 - 구현 문서

## 1. 프로젝트 초기화

### WXT + React + TypeScript 셋업

```bash
cd inspireme.chrome
# 기존 소스 백업 후 WXT 프로젝트 초기화
pnpm dlx wxt@latest init . --template react
```

**wxt.config.ts**:
```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'InspireMe',
    version: '2.0.0',
    description: '새 탭에서 매일 영감을 주는 명언을 만나보세요',
    permissions: ['storage'],
    host_permissions: [
      'https://inspireme.advenoh.pe.kr/*',
      'https://api.unsplash.com/*'
    ],
  },
});
```

### Tailwind CSS v4 설정

```bash
pnpm add tailwindcss @tailwindcss/vite
```

**vite 설정에 Tailwind 플러그인 추가** (WXT가 Vite 기반이므로 wxt.config.ts에서 설정):
```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
```

---

## 2. 디렉토리 구조

```
inspireme.chrome/
├── src/
│   ├── entrypoints/
│   │   └── newtab/               # WXT newtab 엔트리포인트
│   │       ├── index.html
│   │       ├── main.tsx
│   │       └── App.tsx
│   ├── components/
│   │   ├── Clock.tsx
│   │   ├── Quote.tsx
│   │   ├── Background.tsx
│   │   ├── WallpaperInfo.tsx
│   │   └── settings/
│   │       ├── SettingsModal.tsx
│   │       ├── GeneralSettings.tsx
│   │       ├── ApiKeySettings.tsx
│   │       └── About.tsx
│   ├── hooks/
│   │   ├── useQuote.ts
│   │   ├── useClock.ts
│   │   ├── useSettings.ts
│   │   └── useBackground.ts
│   ├── lib/
│   │   ├── inspireme-api.ts      # InspireMe API 클라이언트
│   │   ├── unsplash-api.ts       # Unsplash API 클라이언트
│   │   ├── storage.ts            # chrome.storage 래퍼
│   │   └── constants.ts
│   ├── types/
│   │   ├── quote.ts
│   │   └── settings.ts
│   └── assets/
│       ├── fallback-quotes.json
│       └── default-bg.jpg
├── public/
│   └── icons/
├── wxt.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. 타입 정의

### types/quote.ts

```typescript
export interface Quote {
  id: string;
  content: string;
  author: string;
  language: 'ko' | 'en';
  tags?: string[];
}

export interface QuoteOfTheDay extends Quote {
  topics?: string[];
  translations?: { lang: string; content: string }[];
  backgroundImageUrl?: string;
  authorInfo?: AuthorInfo;
  date?: string;
}

export interface AuthorInfo {
  id?: string;
  name: string;
  bio?: string;
  nationality?: string;
}

export interface QuoteApiResponse<T> {
  data: T;
}
```

### types/settings.ts

```typescript
export type ClockFormat = '12h' | '24h';
export type QuoteFrequency = 2 | 6 | 12; // hours
export type QuoteMode = 'qotd' | 'random';
export type Language = 'ko' | 'en';
export type BackgroundSource = 'unsplash' | 'qotd' | 'both';

export interface UserSettings {
  clockFormat: ClockFormat;
  quoteFrequency: QuoteFrequency;
  quoteMode: QuoteMode;
  language: Language;
  darkMode: boolean;
  backgroundSource: BackgroundSource;
  apiKey?: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  clockFormat: '24h',
  quoteFrequency: 6,
  quoteMode: 'qotd',
  language: 'ko',
  darkMode: false,
  backgroundSource: 'unsplash',
};
```

---

## 4. InspireMe API 클라이언트

### lib/inspireme-api.ts

```typescript
const BASE_URL = 'https://inspireme.advenoh.pe.kr/api/v1';

export async function fetchQuoteOfTheDay(
  apiKey: string,
  language?: 'ko' | 'en'
): Promise<QuoteOfTheDay> {
  const params = new URLSearchParams();
  if (language) params.set('language', language);

  const res = await fetch(`${BASE_URL}/quote-of-the-day?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new ApiError(res.status, await res.json());
  const { data } = await res.json();
  return data;
}

export async function fetchRandomQuotes(
  apiKey: string,
  options?: { language?: 'ko' | 'en'; count?: number }
): Promise<Quote | Quote[]> {
  const params = new URLSearchParams();
  if (options?.language) params.set('language', options.language);
  if (options?.count) params.set('count', String(options.count));

  const res = await fetch(`${BASE_URL}/quotes/random?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new ApiError(res.status, await res.json());
  const { data } = await res.json();
  return data;
}

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API Error: ${status}`);
  }
}
```

---

## 5. Unsplash API 클라이언트

### lib/unsplash-api.ts

기존 Unsplash API 호출 유지. Client ID와 Collection ID 그대로 사용.

```typescript
const UNSPLASH_BASE = 'https://api.unsplash.com';
const CLIENT_ID = '4469e676a2a92f3481a1546533824178cbf5eed9d773394924d93a70e77c6ab8';
const COLLECTION_ID = '1065861';

export interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string; thumb: string };
  user: { name: string; links: { html: string } };
  location?: { title: string };
  links: { html: string };
}

export async function fetchRandomPhoto(): Promise<UnsplashPhoto> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    collections: COLLECTION_ID,
  });

  const res = await fetch(`${UNSPLASH_BASE}/photos/random?${params}`);
  if (!res.ok) throw new Error(`Unsplash API Error: ${res.status}`);
  return res.json();
}
```

---

## 6. chrome.storage 래퍼

### lib/storage.ts

```typescript
const PREFIX = 'IM';

function key(name: string): string {
  return `${PREFIX}_${name}`;
}

export const storage = {
  async get<T>(name: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key(name));
    return result[key(name)] ?? null;
  },

  async set<T>(name: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key(name)]: value });
  },

  async remove(name: string): Promise<void> {
    await chrome.storage.local.remove(key(name));
  },
};

// API Key는 sync storage 사용 (기기 간 동기화)
export const syncStorage = {
  async getApiKey(): Promise<string | null> {
    const result = await chrome.storage.sync.get(key('apiKey'));
    return result[key('apiKey')] ?? null;
  },

  async setApiKey(apiKey: string): Promise<void> {
    await chrome.storage.sync.set({ [key('apiKey')]: apiKey });
  },
};
```

---

## 7. 핵심 Hooks

### hooks/useQuote.ts

```typescript
export function useQuote(settings: UserSettings) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuote();
  }, [settings.quoteMode, settings.language]);

  async function loadQuote() {
    setLoading(true);

    // 캐시 확인
    const cached = await storage.get<{ quote: Quote; timestamp: number }>('quote');
    if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
      setQuote(cached.quote);
      setLoading(false);
      return;
    }

    try {
      const apiKey = await syncStorage.getApiKey();
      if (!apiKey) {
        loadFallbackQuote();
        return;
      }

      let newQuote: Quote;
      if (settings.quoteMode === 'qotd') {
        newQuote = await fetchQuoteOfTheDay(apiKey, settings.language);
      } else {
        newQuote = await fetchRandomQuotes(apiKey, { language: settings.language }) as Quote;
      }

      setQuote(newQuote);
      await storage.set('quote', { quote: newQuote, timestamp: Date.now() });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // API Key 문제 → 폴백
      }
      loadFallbackQuote();
    } finally {
      setLoading(false);
    }
  }

  function loadFallbackQuote() {
    const quotes = fallbackQuotes as Quote[];
    const randomIdx = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIdx]);
  }

  return { quote, loading, refresh: loadQuote };
}
```

### hooks/useClock.ts

```typescript
export function useClock(format: ClockFormat) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = useMemo(() => {
    return time.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
    });
  }, [time, format]);

  const dateStr = useMemo(() => {
    return time.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, [time]);

  return { formatted, dateStr };
}
```

### hooks/useSettings.ts

```typescript
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    storage.get<UserSettings>('settings').then((saved) => {
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
    });
  }, []);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await storage.set('settings', next);
  }, [settings]);

  return { settings, updateSettings };
}
```

### hooks/useBackground.ts

```typescript
export function useBackground(source: BackgroundSource) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [photoInfo, setPhotoInfo] = useState<UnsplashPhoto | null>(null);

  useEffect(() => {
    loadBackground();
  }, [source]);

  async function loadBackground() {
    // 캐시 확인 (24시간)
    const cached = await storage.get<{ url: string; photo: UnsplashPhoto; timestamp: number }>('wallpaper');
    if (cached && !isExpired(cached.timestamp, 24)) {
      setBgUrl(cached.url);
      setPhotoInfo(cached.photo);
      return;
    }

    try {
      const photo = await fetchRandomPhoto();
      setBgUrl(photo.urls.regular);
      setPhotoInfo(photo);
      await storage.set('wallpaper', {
        url: photo.urls.regular,
        photo,
        timestamp: Date.now(),
      });
    } catch {
      // 기본 배경 이미지 사용
      setBgUrl('/assets/default-bg.jpg');
    }
  }

  return { bgUrl, photoInfo, refresh: loadBackground };
}
```

---

## 8. 명언 클릭 → InspireMe 사이트 이동

명언을 클릭하면 InspireMe 사이트의 해당 명언 상세 페이지로 이동한다.

**URL 패턴**: `https://inspireme.advenoh.pe.kr/quotes/{id}`

### Quote 컴포넌트 (클릭 링크 포함)

```tsx
const INSPIREME_BASE_URL = 'https://inspireme.advenoh.pe.kr';

interface QuoteProps {
  quote: Quote | null;
  loading: boolean;
}

export function Quote({ quote, loading }: QuoteProps) {
  if (loading || !quote) return null;

  const quoteUrl = `${INSPIREME_BASE_URL}/quotes/${quote.id}`;

  return (
    <a
      href={quoteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-center cursor-pointer hover:opacity-80 transition-opacity"
    >
      <p className="text-2xl font-light mb-4 text-shadow">
        "{quote.content}"
      </p>
      <p className="text-lg text-shadow">— {quote.author}</p>
    </a>
  );
}
```

- 폴백 명언(로컬 JSON)은 `id`가 없으므로 링크 비활성화 처리
- `target="_blank"`로 새 탭에서 열기 (현재 새 탭 페이지 유지)

---

## 9. 주요 컴포넌트

### App.tsx (루트)

```tsx
export default function App() {
  const { settings, updateSettings } = useSettings();
  const { quote, loading, refresh } = useQuote(settings);
  const { formatted, dateStr } = useClock(settings.clockFormat);
  const { bgUrl, photoInfo } = useBackground(settings.backgroundSource);

  return (
    <main className="relative flex flex-col justify-between h-screen text-white">
      <Background url={bgUrl} />

      <div className="flex justify-end p-5">
        <Clock time={formatted} date={dateStr} />
        <SettingsIcon onClick={toggleSettings} />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Quote quote={quote} loading={loading} />
      </div>

      <div className="flex justify-between items-end p-5">
        <WallpaperInfo photo={photoInfo} />
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
```

---

## 10. Google Analytics (Manifest v3 대응)

Manifest v3에서는 원격 스크립트 로딩 불가. GA4 Measurement Protocol 사용:

```typescript
// lib/analytics.ts
const GA_MEASUREMENT_ID = 'G-6G6FHKMQGB';
const GA_API_SECRET = '<서버 측에서 생성>';

export async function trackEvent(name: string, params?: Record<string, string>) {
  const clientId = await getOrCreateClientId();

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name, params }],
      }),
    }
  );
}

async function getOrCreateClientId(): Promise<string> {
  let clientId = await storage.get<string>('ga_client_id');
  if (!clientId) {
    clientId = crypto.randomUUID();
    await storage.set('ga_client_id', clientId);
  }
  return clientId;
}
```

---

## 11. 에러 핸들링 전략

| 시나리오 | 대응 |
|----------|------|
| API Key 미설정 | 로컬 폴백 명언 표시 + 설정 안내 토스트 |
| API Key 만료/유효하지 않음 (401) | 로컬 폴백 + 설정 화면 안내 |
| Rate Limit 초과 (429) | 캐시된 명언 사용, Retry-After 후 자동 재시도 |
| 네트워크 오류 | 캐시된 명언/배경 사용, 네트워크 복구 시 갱신 |
| Unsplash API 실패 | 기본 배경 이미지 (default-bg.jpg) 사용 |
