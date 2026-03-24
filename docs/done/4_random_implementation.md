# 랜덤 명언 모드 캐시 버그 수정 — 구현 문서

## 변경 대상 파일

| 파일 | 변경 요약 |
|------|----------|
| `src/hooks/useQuote.ts` | `CachedQuote`에 `quoteMode` 추가, `isDayChanged()` 추가, 모드별 캐시 분기 |
| `src/components/settings/GeneralSettings.tsx` | "명언 갱신 주기"를 랜덤 모드에서만 표시 |

---

## 1. useQuote.ts — 모드별 캐시 분기 + 랜덤 모드 SWR

### 현재 코드

```typescript
interface CachedQuote {
  quote: Quote;
  timestamp: number;
}

function isExpired(timestamp: number, hours: number): boolean {
  return Date.now() - timestamp > hours * 60 * 60 * 1000;
}

export function useQuote(settings: UserSettings) {
  // ...

  const loadQuote = useCallback(async () => {
    setError(null);

    const cached = await storage.get<CachedQuote>('quote');

    // 1) 캐시 유효 → 즉시 표시, API 호출 없이 종료
    if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
      setQuote(cached.quote);
      setLoading(false);
      return;
    }

    // 2) stale 캐시 또는 fallback을 즉시 표시 (SWR)
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
    }
  }, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);

  // ...
}
```

### 변경 코드

```typescript
import type { QuoteMode, UserSettings } from '../types/settings';

interface CachedQuote {
  quote: Quote;
  timestamp: number;
  quoteMode: QuoteMode; // ← 추가
}

function isExpired(timestamp: number, hours: number): boolean {
  return Date.now() - timestamp > hours * 60 * 60 * 1000;
}

function isDayChanged(timestamp: number): boolean {
  const cached = new Date(timestamp);
  const now = new Date();
  return cached.toDateString() !== now.toDateString();
}

export function useQuote(settings: UserSettings) {
  // ...

  const loadQuote = useCallback(async () => {
    setError(null);

    const cached = await storage.get<CachedQuote>('quote');
    const modeChanged = cached?.quoteMode !== settings.quoteMode;

    // 1) 캐시 유효 판정 — 모드별 분기
    if (cached && !modeChanged) {
      if (settings.quoteMode === 'qotd') {
        // 오늘의 명언: 같은 날이면 캐시 표시 후 종료 (quoteFrequency 무시)
        if (!isDayChanged(cached.timestamp)) {
          setQuote(cached.quote);
          setLoading(false);
          return;
        }
      }
      // 랜덤 명언: early return 없음 → 항상 SWR 진행
    }

    // 2) stale 데이터 또는 fallback을 즉시 표시 (SWR)
    //    - 모드 전환 시: 이전 모드 캐시 대신 fallback 사용
    if (cached && !modeChanged) {
      setQuote(cached.quote);
    } else {
      loadFallbackQuote();
    }
    setLoading(false);

    // 3) 백그라운드 API 호출 → 응답 시 교체
    try {
      let newQuote: Quote;
      if (settings.quoteMode === 'qotd') {
        newQuote = await fetchQuoteOfTheDay(settings.language);
      } else {
        newQuote = await fetchRandomQuote(settings.language);
      }
      setQuote(newQuote);
      await storage.set<CachedQuote>('quote', {
        quote: newQuote,
        timestamp: Date.now(),
        quoteMode: settings.quoteMode, // ← 모드 정보 저장
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  }, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);

  // ...
}
```

### 핵심 변경점

1. **`CachedQuote`에 `quoteMode` 필드 추가** — 캐시된 명언이 어떤 모드에서 가져온 것인지 식별
2. **`isDayChanged()` 함수 추가** — 오늘의 명언의 날짜 기반 만료 판정
3. **모드별 캐시 유효 분기**:
   - qotd: 같은 날 → 캐시 즉시 반환 (`quoteFrequency` 무시)
   - random: early return 없음 → 항상 SWR (stale 표시 후 백그라운드 갱신)
4. **모드 전환 감지** — `modeChanged`가 true면 이전 캐시 무시하고 fallback 표시
5. **하위 호환성** — 기존 캐시에 `quoteMode`가 없으면 `undefined !== settings.quoteMode` → 모드 전환으로 처리

### import 변경

`QuoteMode` 타입을 추가로 import한다:

```typescript
// 현재
import type { UserSettings } from '../types/settings';

// 변경
import type { QuoteMode, UserSettings } from '../types/settings';
```

---

## 2. GeneralSettings.tsx — "명언 갱신 주기" 조건부 표시

### 현재 코드 (35-45행)

```tsx
<SettingRow label="명언 갱신 주기">
  <NumberInput
    value={settings.quoteFrequency}
    min={1}
    max={24}
    step={1}
    fallback={1}
    unit="시간"
    onChange={(v) => onUpdate({ quoteFrequency: v })}
  />
</SettingRow>
```

### 변경 코드

```tsx
{settings.quoteMode === 'random' && (
  <SettingRow label="명언 갱신 주기">
    <NumberInput
      value={settings.quoteFrequency}
      min={1}
      max={24}
      step={1}
      fallback={1}
      unit="시간"
      onChange={(v) => onUpdate({ quoteFrequency: v })}
    />
  </SettingRow>
)}
```

### 핵심 변경점

- `settings.quoteMode === 'random'` 조건으로 감싸서 랜덤 모드일 때만 렌더링
- 오늘의 명언은 하루 1회 고정이므로 갱신 주기 설정이 불필요
