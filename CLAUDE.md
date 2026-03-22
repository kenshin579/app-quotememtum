# InspireMe Chrome Extension — CLAUDE.md

## 프로젝트 개요

InspireMe 명언 플랫폼의 Chrome Extension. 새 탭에서 명언과 배경 사진을 표시.

## 기술 스택

- React 19 + TypeScript, WXT (Vite 기반 Chrome Extension 프레임워크)
- Tailwind CSS v4, Chrome Manifest v3
- 외부 API: InspireMe Widget API, Unsplash API

## 빌드 & 실행

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 (HMR, Chrome 자동 열림)
pnpm build          # 프로덕션 빌드 (.output/chrome-mv3/)
pnpm zip            # 빌드 + zip 생성
pnpm lint           # ESLint
pnpm format         # Prettier
```

### Makefile

```bash
make dev             # 개발 서버
make build           # 프로덕션 빌드
make zip             # 빌드 + zip
make tag patch       # 버전 범프 + GitHub Release (zip 첨부)
make tag minor
make tag major
```

## 프로젝트 구조

```
inspireme.chrome/
├── src/
│   ├── entrypoints/newtab/   # Chrome 새 탭 진입점 (App.tsx, main.tsx)
│   ├── components/           # React 컴포넌트
│   │   ├── Quote.tsx         # 명언 표시 (클릭 시 사이트 이동)
│   │   ├── Clock.tsx         # 시계
│   │   ├── Background.tsx    # 배경 이미지
│   │   ├── WallpaperInfo.tsx # Unsplash 사진 정보
│   │   ├── SettingsIcon.tsx  # 설정 아이콘
│   │   └── settings/         # 설정 모달 (GeneralSettings, About)
│   ├── hooks/                # 커스텀 훅
│   │   ├── useQuote.ts       # 명언 fetch + 캐시
│   │   ├── useBackground.ts  # 배경 사진
│   │   ├── useClock.ts       # 시계
│   │   └── useSettings.ts    # 사용자 설정
│   ├── lib/                  # 유틸리티
│   │   ├── inspireme-api.ts  # Widget API 클라이언트 (인증 불필요)
│   │   ├── unsplash-api.ts   # Unsplash API
│   │   ├── storage.ts        # chrome.storage 래퍼
│   │   ├── constants.ts      # API URL, 상수
│   │   └── analytics.ts      # Google Analytics
│   ├── types/                # TypeScript 타입
│   └── assets/               # 기본 배경, fallback 명언
├── public/icon/              # Extension 아이콘 (16~128px)
├── wxt.config.ts             # WXT 설정 (manifest, 권한)
├── scripts/release.sh        # 릴리스 스크립트
└── Makefile
```

## API

Widget API (`/api/widget/*`) 사용 — 인증 불필요, IP 기반 rate limit (60회/분).

| 엔드포인트 | 용도 |
|-----------|------|
| `GET /api/widget/quote-of-the-day?lang=ko` | 오늘의 명언 |
| `GET /api/widget/random?lang=ko&count=1` | 랜덤 명언 |

## 릴리스

```bash
make tag patch   # package.json 버전 범프 → 빌드 → zip → git tag → GitHub Release
```

- 버전은 `package.json`이 source of truth (wxt.config.ts에서 자동 읽기)
- GitHub Release에 zip 파일 첨부 → 다운로드 후 Chrome에서 로드 가능

## Git Commit Convention

```
[#이슈번호] 간결한 설명
```
