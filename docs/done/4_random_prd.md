# 랜덤 명언 모드 캐시 버그 수정 PRD

## 1. 스펙 정리

### 모드별 갱신 규칙

| 모드 | 갱신 조건 | `quoteFrequency` 사용 여부 |
|------|----------|--------------------------|
| **오늘의 명언 (qotd)** | 날짜가 바뀌면 갱신 (하루 1회 고정) | 사용 안 함 |
| **랜덤 명언 (random)** | `quoteFrequency` 시간마다 갱신 (SWR) | 사용함 |

- "오늘의 명언"은 `quoteFrequency` 값과 **무관하게** 하루에 1번만 바뀐다
- "명언 갱신 주기" 설정은 **랜덤 명언 모드에서만 유효**한 옵션이다
- 랜덤 모드에서 캐시가 만료되었을 때, 이전 명언을 먼저 보여주고 백그라운드에서 새 명언을 가져와 교체한다 (SWR)

## 2. 현재 상태 분석

### 현재 캐시 플로우 (useQuote.ts)

```
새 탭 열림
  ↓
storage.get('quote')로 캐시 조회  ← 캐시 키가 'quote'로 고정
  ↓
캐시 유효? (timestamp + quoteFrequency 시간 이내)
  ├─ YES → 캐시된 명언 즉시 표시, API 호출 없이 return  ← ★ 문제
  └─ NO  → stale 명언 표시 → 백그라운드 API 호출 → 교체
```

### 문제점

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| 1 | **모드 전환 시 캐시가 무효화되지 않음** | `useQuote.ts:31-38` — 캐시 키 `'quote'`에 quoteMode 미포함 | "오늘의 명언" → "랜덤 명언" 전환해도 이전 모드의 캐시가 유효하면 **같은 명언이 계속 표시됨** |
| 2 | **오늘의 명언에 `quoteFrequency` 적용됨** | `useQuote.ts:34` — 두 모드 모두 `isExpired(timestamp, quoteFrequency)` 사용 | 오늘의 명언은 하루 단위여야 하지만 `quoteFrequency`(기본 1시간)에 좌우됨 |
| 3 | **랜덤 모드에서 캐시 유효 시 API 미호출** | `useQuote.ts:34-37` — 캐시 유효하면 early return | 랜덤 모드에서도 `quoteFrequency` 동안 동일 명언 반복 (SWR 미적용) |
| 4 | **캐시에 모드 정보 미저장** | `CachedQuote` 인터페이스에 `quoteMode` 필드 없음 | 어떤 모드로 가져온 명언인지 구분 불가 |

### 재현 시나리오

```
1. 설정에서 "오늘의 명언" 선택 (기본값) → 명언 A 표시됨
2. 설정에서 "랜덤 명언"으로 변경 → 명언 A 그대로 (변경 안 됨 ★)
3. 새 탭 열기 → 명언 A 그대로 (캐시 1시간 미만이므로 ★)
4. 1시간 후 새 탭 열기 → 비로소 랜덤 API 호출 → 명언 B 표시
5. 다시 새 탭 열기 → 명언 B 그대로 (1시간 대기 필요 ★)
```

### 현재 코드 분석

```typescript
// useQuote.ts — 현재 구조
interface CachedQuote {
  quote: Quote;
  timestamp: number;
  // ← quoteMode 없음
}

function isExpired(timestamp: number, hours: number): boolean {
  return Date.now() - timestamp > hours * 60 * 60 * 1000;
}

const loadQuote = useCallback(async () => {
  const cached = await storage.get<CachedQuote>('quote');

  // ★ 문제: 모드 구분 없이 동일한 만료 로직 적용
  if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
    setQuote(cached.quote);
    setLoading(false);
    return; // ← 랜덤 모드여도 여기서 빠져나감
  }

  // ... SWR 로직 (위에서 return되면 도달하지 못함)
}, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);
```

## 3. 개선 방안

### 핵심 원칙

1. **오늘의 명언**: 날짜 기반 캐시 — 같은 날이면 캐시 즉시 표시, 날짜가 바뀌면 SWR
2. **랜덤 명언**: `quoteFrequency` 기반 캐시 — 만료 시 SWR (이전 명언 즉시 → 백그라운드 갱신)
3. **모드 전환**: 캐시 무효화 — fallback 표시 후 API 호출

### 캐시 만료 판정 로직

```typescript
// 오늘의 명언: 날짜가 바뀌었는지 판정
function isDayChanged(timestamp: number): boolean {
  const cached = new Date(timestamp);
  const now = new Date();
  return cached.toDateString() !== now.toDateString();
}

// 랜덤 명언: quoteFrequency 시간 경과 판정 (기존 isExpired 유지)
function isExpired(timestamp: number, hours: number): boolean {
  return Date.now() - timestamp > hours * 60 * 60 * 1000;
}
```

### 모드별 동작 비교

| 조건 | 오늘의 명언 (qotd) | 랜덤 명언 (random) |
|------|-------------------|-------------------|
| 캐시 유효 + 같은 모드 | 같은 날 → 캐시 즉시 표시, API 호출 없음 | `quoteFrequency` 미만 → 캐시 즉시 표시 → **SWR: 백그라운드 API → 교체** |
| 캐시 만료 + 같은 모드 | 날짜 변경 → stale 표시 → API → 교체 | `quoteFrequency` 초과 → stale 표시 → API → 교체 |
| 모드 전환됨 | fallback 표시 → API → 교체 | fallback 표시 → API → 교체 |
| 캐시 없음 (최초) | fallback 표시 → API → 교체 | fallback 표시 → API → 교체 |
| API 실패 | stale 또는 fallback 유지 | stale 또는 fallback 유지 |

### 변경 내용 (useQuote.ts)

```typescript
// 1. CachedQuote에 quoteMode 필드 추가
interface CachedQuote {
  quote: Quote;
  timestamp: number;
  quoteMode: QuoteMode; // ← 추가
}

// 2. 날짜 변경 판정 함수 추가
function isDayChanged(timestamp: number): boolean {
  const cached = new Date(timestamp);
  const now = new Date();
  return cached.toDateString() !== now.toDateString();
}

const loadQuote = useCallback(async () => {
  setError(null);

  const cached = await storage.get<CachedQuote>('quote');
  const modeChanged = cached?.quoteMode !== settings.quoteMode;

  // 1) 캐시 유효 판정 — 모드별 분기
  if (cached && !modeChanged) {
    if (settings.quoteMode === 'qotd') {
      // 오늘의 명언: 같은 날이면 캐시 표시 후 종료
      if (!isDayChanged(cached.timestamp)) {
        setQuote(cached.quote);
        setLoading(false);
        return;
      }
    }
    // 랜덤 명언: 캐시 유효 여부와 관계없이 항상 SWR 진행 (early return 없음)
  }

  // 2) stale 데이터 또는 fallback을 즉시 표시 (SWR)
  //    - 모드가 전환된 경우: 이전 모드 캐시 대신 fallback 사용
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
      quoteMode: settings.quoteMode, // ← 모드 정보 함께 저장
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }
}, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);
```

### 설정 UI 변경 (GeneralSettings.tsx)

"명언 갱신 주기"는 랜덤 모드에서만 유효하므로, 오늘의 명언 모드일 때 숨긴다.

```
명언 모드: [오늘의 명언 ▼]
명언 갱신 주기:                    ← 숨김 (qotd는 하루 1회 고정)

명언 모드: [랜덤 명언 ▼]
명언 갱신 주기: 1 시간             ← 표시 (random에서만 의미 있음)
```

## 4. 변경 파일 요약

| 파일 | 변경 내용 | 복잡도 |
|------|----------|--------|
| `src/hooks/useQuote.ts` | `CachedQuote`에 `quoteMode` 추가, `isDayChanged()` 함수 추가, 모드별 캐시 분기 로직 | 낮음 |
| `src/components/settings/GeneralSettings.tsx` | `quoteMode === 'qotd'`일 때 "명언 갱신 주기" 행 숨김 | 낮음 |

## 5. 기대 효과

| 시나리오 | Before | After |
|----------|--------|-------|
| **qotd + 같은 날 새 탭** | `quoteFrequency` 후 갱신 (잘못된 동작) | **같은 날이면 동일 명언 유지** |
| **qotd + 날짜 변경 후 새 탭** | `quoteFrequency` 후 갱신 | **어제 명언 즉시 → 오늘의 명언으로 교체** |
| **random + 새 탭 열기** | `quoteFrequency` 동안 동일 명언 고정 | **이전 명언 즉시 → 새 랜덤 명언으로 교체** |
| **qotd → random 모드 전환** | 변경 없음 (이전 캐시 그대로) | **fallback 즉시 → 랜덤 명언으로 교체** |
| **random → qotd 모드 전환** | 변경 없음 (이전 캐시 그대로) | **fallback 즉시 → 오늘의 명언으로 교체** |
| **random + API 장애** | 캐시된 명언 유지 | **이전 명언 표시 유지 (빈 화면 방지)** |

## 6. 리스크 및 고려사항

- **명언 교체 시 깜빡임**: 랜덤 모드에서 이전 명언 → 새 명언 교체 시 텍스트가 바뀜. 기존 Quote 컴포넌트의 fade-in 트랜지션으로 자연스럽게 전환 가능. 필요 시 crossfade 효과 추가 검토
- **API 호출 빈도 증가**: 랜덤 모드에서 새 탭마다 API 호출 발생. rate limit(60회/분)에 주의. 일반적 사용 패턴에서는 문제 없음
- **하위 호환성**: 기존 캐시에 `quoteMode` 필드가 없으므로 `cached?.quoteMode`가 `undefined`가 됨. `modeChanged = cached?.quoteMode !== settings.quoteMode`에서 `undefined !== 'random'`은 `true`이므로 모드 전환으로 처리되어 안전하게 동작
- **qotd 모드의 날짜 경계**: `toDateString()` 비교는 로컬 타임존 기준. 자정에 탭을 열면 새 명언으로 갱신. 서버의 "오늘의 명언" 갱신 시각과 약간의 차이가 있을 수 있으나 실사용에 문제 없음
