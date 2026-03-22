# Widget API 전환 PRD

## 배경

현재 Chrome Extension은 `/api/v1/*` (Public API)를 사용하며 **API Key 인증이 필수**다. 사용자가 직접 API Key를 발급받아 설정에 입력해야 명언이 표시되고, 없으면 로컬 fallback 명언만 보인다.

반면 iOS 위젯 앱(`inspireme.ios`)은 `/api/widget/*` 엔드포인트를 사용하며 **인증 없이** 바로 동작한다. Chrome Extension도 동일하게 Widget API로 전환하여 설치 즉시 동작하도록 개선한다.

## 목표

- API Key 없이 설치 즉시 명언 표시
- iOS 위젯과 동일한 Widget API 사용
- 설정에서 API Key 탭 제거
- 명언 클릭 시 해당 명언 페이지를 현재 탭에서 열기
- 명언 텍스트 크기 키우기

## API 비교

### 현재 (Public API — `/api/v1/*`)

| 항목 | 값 |
|------|---|
| 오늘의 명언 | `GET /api/v1/quote-of-the-day?language=ko` |
| 랜덤 명언 | `GET /api/v1/quotes/random?language=ko&count=1` |
| 인증 | `Authorization: Bearer <apiKey>` 필수 |
| Rate Limit | API Key 기반 |
| 응답 필드 | `{ id, content, author, language, tags }` |

### 변경 후 (Widget API — `/api/widget/*`)

| 항목 | 값 |
|------|---|
| 오늘의 명언 | `GET /api/widget/quote-of-the-day?lang=ko` |
| 랜덤 명언 | `GET /api/widget/random?lang=ko&count=1` |
| 인증 | 없음 |
| Rate Limit | IP 기반 (60회/분) |
| 응답 필드 | `{ id, content, author, authorSlug, language, topics }` |

### 주요 차이

| | Public API | Widget API |
|---|---|---|
| 쿼리 파라미터 | `language=ko` | `lang=ko` |
| 랜덤 경로 | `/quotes/random` | `/random` |
| 인증 | Bearer Token | 없음 |
| `authorSlug` | 없음 | 있음 |
| `topics` | 없음 | 있음 |
| `tags` | 있음 | 없음 |

## 변경 범위

### 1. API 클라이언트 (`src/lib/inspireme-api.ts`)

- Base path: `/api/v1` → `/api/widget`
- `apiKey` 파라미터 및 `Authorization` 헤더 제거
- 엔드포인트 경로 변경:
  - `/quote-of-the-day?language=` → `/quote-of-the-day?lang=`
  - `/quotes/random?language=&count=` → `/random?lang=&count=`

### 2. 타입 정의 (`src/types/quote.ts`)

Widget API 응답에 맞게 통합:

```typescript
export interface Quote {
  id: string;
  content: string;
  author: string;
  authorSlug: string;   // 추가
  language: 'ko' | 'en';
  topics: string[];     // 추가 (tags 대체)
}
```

- `QuoteOfTheDay` 별도 타입 불필요 → `Quote`로 통합
- `AuthorInfo` 인터페이스 제거

### 3. 상수 (`src/lib/constants.ts`)

```typescript
// 변경 전
export const INSPIREME_API_URL = `${INSPIREME_BASE_URL}/api/v1`;

// 변경 후
export const INSPIREME_API_URL = `${INSPIREME_BASE_URL}/api/widget`;
```

### 4. useQuote 훅 (`src/hooks/useQuote.ts`)

- API Key 확인 로직 제거 (`syncStorage.getApiKey()`)
- API Key 없을 때 fallback 분기 제거 → 항상 API 호출
- 401 에러 처리 제거
- 네트워크 에러 시에만 fallback 명언 사용

### 5. 설정 UI 정리

| 파일 | 변경 |
|------|------|
| `SettingsModal.tsx` | `apiKey` 탭 제거, 탭 2개만 유지 (일반, 정보) |
| `ApiKeySettings.tsx` | **파일 삭제** |

### 6. 스토리지 (`src/lib/storage.ts`)

- `getApiKey()`, `setApiKey()`, `removeApiKey()` 메서드 제거

### 7. Quote 컴포넌트 (`src/components/Quote.tsx`)

- 명언 클릭 시 `target="_blank"` 제거 → **현재 탭에서** 명언 페이지 열기
  - URL: `https://inspire-me.advenoh.pe.kr/quotes/{id}`
- `authorSlug` 활용하여 작가 이름 클릭 시 작가 페이지 링크
  - URL: `https://inspire-me.advenoh.pe.kr/authors/{authorSlug}`
- `AuthorInfo` 관련 코드 제거 (Widget API에 해당 필드 없음)
- 명언 텍스트 크기 키우기: `text-2xl` → `text-4xl`, 작가 이름 `text-lg` → `text-xl`

### 8. fallback 명언 (`src/assets/fallback-quotes.json`)

- Widget API 응답 형식에 맞게 `authorSlug`, `topics` 필드 추가
- `tags` 필드 제거

### 9. manifest 권한

- `host_permissions`는 동일하게 유지 (`https://inspire-me.advenoh.pe.kr/*`)

### 10. 일반 설정 — 명언 갱신 주기 개선 (`src/components/settings/GeneralSettings.tsx`, `src/types/settings.ts`)

현재 `select`로 2/6/12시간 고정값만 선택 가능 → **숫자 입력 + 화살표(stepper)** 방식으로 변경.

- `QuoteFrequency` 타입: `2 | 6 | 12` → `number` (1~24시간 범위)
- `DEFAULT_SETTINGS.quoteFrequency`: 6 (유지)
- UI: `<input type="number" min={1} max={24} step={1}>` — 직접 입력 가능, 브라우저 기본 up/down 화살표 제공
- 단위 표시: 입력 필드 옆에 "시간" 텍스트

## 변경하지 않는 것

- Unsplash API (배경 사진) — 변경 없음
- Google Analytics — 변경 없음
- 일반 설정 (언어, 명언 모드, 시계 형식, 다크 모드) — 변경 없음
- 북마크 기능 — 변경 없음
