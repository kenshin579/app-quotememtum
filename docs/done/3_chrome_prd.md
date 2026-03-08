# Quotememtum Chrome Extension 현대화 PRD

## 1. 현재 상태 분석

### 기존 기술 스택 (레거시)

| 항목 | 현재 버전 | 문제점 |
|------|-----------|--------|
| React | 15.6.1 | EOL, Hooks/Context 미지원 |
| Webpack | 4 | 구버전, 빌드 성능 저하 |
| Babel | 7 | Webpack 5+ 전환 시 설정 변경 필요 |
| Chrome Manifest | v2 | **2024년부터 Chrome Web Store 등록 불가** |
| ESLint | 5 | 구버전, flat config 미지원 |
| CSS | 순수 CSS 파일 | 모듈화/스코핑 없음 |

### 기존 기능

- **새 탭 오버라이드**: 새 탭 열 때 명언 + 배경화면 표시
- **시계**: 12/24시간 형식 전환 가능
- **명언 표시**: InspireMe API (`quote.advenoh.pe.kr`)에서 랜덤 명언 호출, 실패 시 로컬 JSON 폴백
- **배경화면**: Unsplash API로 랜덤 사진 로드
- **설정**: 시계 형식, 명언 갱신 주기(2/6/12시간)

### 기존 API 호출 방식

```
GET https://quote.advenoh.pe.kr/api/quotes/random
→ 응답: { quoteText, authorName, quoteId }
→ 인증 없음 (구 엔드포인트)
```

---

## 2. 현대화 목표

### 핵심 목표
1. **Chrome Manifest v3 전환** - Web Store 등록 가능하도록 필수 마이그레이션
2. **최신 React + 빌드 도구 전환** - React 19 + Vite (또는 WXT)
3. **InspireMe 신규 API 연동** - API Key 인증 기반 공개 API 사용
4. **TypeScript 도입** - 타입 안전성 확보
5. **UI/UX 개선** - Tailwind CSS, 다크 모드, 반응형 개선

### 비목표 (Scope 외)
- 다른 브라우저(Firefox, Safari) 지원
- 백엔드 변경
- 유료 기능/구독 모델

---

## 3. InspireMe API 연동 계획

### 사용할 API 엔드포인트

#### 3.1 오늘의 명언 (메인)
```
GET /api/v1/quote-of-the-day?language=ko
Authorization: Bearer im_live_xxxx...
```

**응답**:
```json
{
  "data": {
    "id": "q-abc123",
    "content": "명언 텍스트",
    "author": "저자명",
    "language": "ko",
    "topics": ["motivation"],
    "tags": ["daily"],
    "translations": [{ "lang": "en", "content": "English text" }],
    "backgroundImageUrl": "https://...",
    "authorInfo": {
      "name": "저자명",
      "bio": "...",
      "nationality": "Korea"
    }
  }
}
```

- 하루 동안 같은 명언 제공 (서버 측 24시간 캐시)
- 배경 이미지 URL 포함 (Unsplash API와 병행 사용)

#### 3.2 랜덤 명언 (갱신 시)
```
GET /api/v1/quotes/random?language=ko&count=1
Authorization: Bearer im_live_xxxx...
```

**응답**:
```json
{
  "data": {
    "id": "q-abc123",
    "content": "명언 텍스트",
    "author": "저자명",
    "language": "ko",
    "tags": ["philosophy"]
  }
}
```

- count 파라미터로 1~10개 배치 요청 가능
- 클라이언트 측 캐싱과 조합하여 API 호출 최소화

### API 인증

| 항목 | 값 |
|------|-----|
| 인증 방식 | Bearer Token (API Key) |
| API Key 형식 | `im_live_<random_string>` |
| 발급 방법 | inspireme.advenoh.pe.kr 로그인 → 설정 → API Key 관리 |
| Rate Limit | 100회/시간, 1,000회/일 |
| 응답 헤더 | `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

### API Key 관리 전략

**방안 A: 사용자 직접 발급 (권장)**
- 설정 화면에서 사용자가 자신의 API Key 입력
- `chrome.storage.sync`에 암호화 저장
- 장점: Rate limit 분산, 키 관리 부담 없음

**방안 B: 확장 프로그램 전용 키**
- 빌드 시 환경변수로 API Key 주입
- 장점: 사용자 설정 불필요
- 단점: 키 노출 위험, 모든 사용자가 동일 rate limit 공유

**→ 방안 A 권장 + 방안 B를 기본 폴백으로 제공**

### Rate Limit 대응

```
- QOTD 엔드포인트 사용 시 하루 1회 호출로 충분
- 랜덤 명언도 클라이언트 캐시 (2/6/12시간) 활용
- 429 응답 시 로컬 캐시/폴백 JSON 사용
- X-RateLimit-Remaining 헤더 모니터링
```

### 에러 핸들링

| HTTP 상태 | 코드 | 대응 |
|-----------|------|------|
| 401 | API_KEY_REQUIRED | 설정 화면으로 안내 |
| 401 | API_KEY_EXPIRED | 키 재발급 안내 |
| 429 | RATE_LIMIT_EXCEEDED | 로컬 캐시 사용, Retry-After 대기 |
| 500 | INTERNAL_ERROR | 로컬 폴백 JSON 사용 |

---

## 4. 기술 스택 전환 계획

### 신규 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **React 19** | 기존 React 코드 활용, Hooks 전환 |
| 빌드 도구 | **WXT** (또는 Vite + CRXJS) | Chrome Extension 전용 빌드 도구, HMR 지원, Manifest v3 자동 생성 |
| 언어 | **TypeScript** | 타입 안전성, API 응답 타입 정의 |
| 스타일링 | **Tailwind CSS v4** | 유틸리티 퍼스트, 빠른 UI 개발 |
| HTTP 클라이언트 | **ky** (또는 fetch API) | axios 대비 경량, 번들 크기 절감 |
| 상태 관리 | **React Context + useReducer** | 소규모 앱에 적합, 외부 라이브러리 불필요 |
| 패키지 매니저 | **pnpm** | 빠른 설치, 디스크 효율 |

### WXT vs Vite + CRXJS

| 기준 | WXT | Vite + CRXJS |
|------|-----|-------------|
| Manifest v3 지원 | 자동 생성 | 플러그인 설정 필요 |
| HMR | 내장 | CRXJS 플러그인 |
| 파일 구조 | 컨벤션 기반 | 자유 구조 |
| 커뮤니티 | 활발 | 보통 |
| **추천** | **O** | |

---

## 5. Manifest v3 마이그레이션 주요 변경점

### v2 → v3 핵심 차이

| 항목 | Manifest v2 (현재) | Manifest v3 (변경) |
|------|--------------------|--------------------|
| `manifest_version` | 2 | **3** |
| Background | background page | **Service Worker** |
| CSP | `content_security_policy` (문자열) | `content_security_policy.extension_pages` (객체) |
| 권한 | `permissions` | `permissions` + `host_permissions` 분리 |
| 원격 코드 | 허용 | **금지** (모든 JS 번들링 필수) |
| `chrome.storage` | 동일 | 동일 |
| `chrome_url_overrides` | 동일 | 동일 |

### 새 manifest.json 예시

```json
{
  "manifest_version": 3,
  "name": "Quotememtum",
  "version": "2.0.0",
  "description": "새 탭에서 매일 영감을 주는 명언을 만나보세요",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": ["storage"],
  "host_permissions": [
    "https://inspireme.advenoh.pe.kr/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

---

## 6. 기능 요구사항

### 6.1 기존 기능 유지

- [x] 새 탭 오버라이드
- [x] 실시간 시계 (12/24시간)
- [x] 명언 표시 + 캐싱
- [x] 배경 이미지
- [x] 설정 모달 (General, About)
- [x] 로컬 폴백 명언

### 6.2 신규 기능

| 기능 | 우선순위 | 설명 |
|------|----------|------|
| 한/영 전환 | P0 | API의 language 파라미터 활용, 명언 언어 전환 |
| 오늘의 명언 모드 | P0 | QOTD API 연동, 하루 1개 명언 고정 표시 |
| API Key 설정 | P0 | 사용자 API Key 입력/저장/검증 UI |
| 명언 클릭 → 사이트 이동 | P0 | 명언 클릭 시 InspireMe 사이트 해당 명언 페이지(`/quotes/{id}`)로 이동 |
| 명언 북마크 | P1 | 마음에 드는 명언 로컬 저장 |
| 다크 모드 | P1 | 시스템 설정 연동 또는 수동 전환 |
| 저자 정보 표시 | P1 | QOTD authorInfo 활용, 저자 상세 팝업 |
| 명언 배경 이미지 | P2 | QOTD backgroundImageUrl 활용 + 기존 Unsplash API 병행 |
| 카테고리 필터 | P2 | tags 기반 명언 카테고리 선택 |
| 키보드 단축키 | P2 | 새 명언 불러오기, 복사 등 |

### 6.3 제거할 기능

| 기능 | 이유 |
|------|------|
| Weather API | 미사용 코드 (UI 미렌더링), Glitch 서버 의존 |
| SNS 공유 (트위터) | 사용 빈도 낮음, 명언 클릭 시 사이트 이동으로 대체 |

---

## 7. 프로젝트 구조 (안)

```
app-quotememtum/
├── src/
│   ├── entrypoints/
│   │   └── newtab/            # WXT 컨벤션: 새 탭 페이지
│   │       ├── index.html
│   │       ├── main.tsx       # 엔트리포인트
│   │       └── App.tsx        # 루트 컴포넌트
│   ├── components/
│   │   ├── Clock.tsx
│   │   ├── Quote.tsx
│   │   ├── Background.tsx
│   │   └── settings/
│   │       ├── SettingsModal.tsx
│   │       ├── GeneralSettings.tsx
│   │       ├── ApiKeySettings.tsx
│   │       └── About.tsx
│   ├── hooks/
│   │   ├── useQuote.ts        # 명언 fetch + 캐싱 로직
│   │   ├── useClock.ts        # 시계 상태
│   │   ├── useSettings.ts     # 설정 관리 (chrome.storage)
│   │   └── useBackground.ts   # 배경 이미지 관리
│   ├── lib/
│   │   ├── api.ts             # InspireMe API 클라이언트
│   │   ├── storage.ts         # chrome.storage 래퍼
│   │   └── constants.ts
│   ├── types/
│   │   ├── quote.ts           # API 응답 타입
│   │   └── settings.ts        # 설정 타입
│   └── assets/
│       ├── fallback-quotes.json
│       └── default-bg.jpg
├── public/
│   └── icons/                 # 확장 프로그램 아이콘
├── wxt.config.ts              # WXT 설정
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. 마이그레이션 단계

### Phase 1: 프로젝트 초기화 (1주)
- [ ] WXT + React + TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설정
- [ ] Manifest v3 기본 설정
- [ ] 새 탭 페이지 빈 화면 확인

### Phase 2: 핵심 기능 이식 (1~2주)
- [ ] Clock 컴포넌트 (React Hooks로 전환)
- [ ] InspireMe API 클라이언트 구현 (TypeScript)
- [ ] Quote 컴포넌트 (useQuote 훅)
- [ ] 배경 이미지 표시
- [ ] chrome.storage 기반 설정 관리
- [ ] 로컬 폴백 명언

### Phase 3: 신규 기능 (1~2주)
- [ ] API Key 설정 UI
- [ ] 한/영 전환
- [ ] 오늘의 명언 모드
- [ ] 명언 클릭 → InspireMe 사이트 이동 (`/quotes/{id}`)
- [ ] 명언 북마크

### Phase 4: 마무리 (1주)
- [ ] UI/UX 폴리싱
- [ ] 다크 모드
- [ ] 에러 핸들링/로딩 상태
- [ ] Chrome Web Store 등록 준비 (아이콘, 스크린샷, 설명)

---

## 9. 논의사항

### 9.1 빌드 도구 선택
- **WXT**: Chrome Extension 전용, 컨벤션 기반 → 빠른 개발
- **Vite + CRXJS**: 범용적, 자유도 높음
- **Plasmo**: React 친화적이지만 lock-in 우려
- → **WXT 권장** (Manifest v3 자동 처리, 활발한 커뮤니티)

### 9.2 Unsplash API 유지
- 기존 Unsplash API 직접 호출 유지
- QOTD `backgroundImageUrl`과 Unsplash를 배경 이미지 소스로 병행 사용 가능
- 사용자 설정에서 배경 이미지 소스 선택 옵션 제공 검토

### 9.3 API Key 보안
- Chrome Extension의 소스 코드는 사용자가 볼 수 있음
- 빌드 시 키 주입 방식은 보안 취약
- → 사용자 발급 방식이 적합하나, 온보딩 복잡도 증가
- 절충안: 제한된 기본 키 + 사용자 키 입력 옵션

### 9.4 오프라인 지원
- Service Worker 활용 가능 (Manifest v3)
- 로컬 캐시된 명언으로 오프라인에서도 표시
- 네트워크 복구 시 자동 갱신

### 9.5 배포 전략
- Chrome Web Store 등록 (정식 배포)
- GitHub Releases (사이드로딩용 .zip)
- CI/CD: GitHub Actions로 자동 빌드/배포

### 9.6 기존 프로젝트 처리
- 기존 `app-quotememtum/` 디렉토리에서 작업 (덮어쓰기)
- 또는 `app-quotememtum-v2/`로 새로 시작 후 안정화되면 교체
- → **기존 디렉토리에서 진행 권장** (git 히스토리 유지)

### 9.7 모니터링/분석
- 기존 Google Analytics (G-6G6FHKMQGB) 유지
- Manifest v3에서 원격 스크립트 제한 → gtag.js 로딩 방식 검토 필요
- 옵션: `chrome.offscreen` API 활용 또는 Measurement Protocol (서버 사이드) 전환
