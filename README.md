# InspireMe Chrome Extension

새 탭에서 매일 영감을 주는 명언을 만나보세요.

[Momentum](https://momentumdash.com/)에서 영감을 받아 만든 Chrome Extension으로, **명언**을 메인으로 보여줍니다.

## 기능

- 매일 새로운 명언 (InspireMe Widget API 연동, 인증 불필요)
  - 오늘의 명언 / 랜덤 명언 모드
  - 한국어 / English 전환
  - 명언 클릭 시 InspireMe 사이트로 이동
  - 명언 갱신 주기 설정 (1~24시간)
- 실시간 시계 (12/24시간 형식)
- Unsplash 랜덤 배경 이미지
- 다크 모드
- 설정: 시계 형식, 명언 모드/주기, 언어

## 기술 스택

- React 19 + TypeScript
- WXT (Chrome Extension 빌드 프레임워크)
- Tailwind CSS v4
- Chrome Manifest v3

## 설치

### GitHub Release에서 설치

1. [Releases](https://github.com/kenshin579/inspireme.chrome/releases) 페이지에서 최신 zip 다운로드
2. 압축 해제
3. `chrome://extensions` 접속
4. "개발자 모드" 활성화
5. "압축 해제된 확장 프로그램을 로드합니다" 클릭
6. 압축 해제한 폴더 선택

### 소스에서 빌드

```bash
pnpm install
pnpm build
```

1. `chrome://extensions` 접속
2. "개발자 모드" 활성화
3. "압축 해제된 확장 프로그램을 로드합니다" 클릭
4. `.output/chrome-mv3` 폴더 선택

## 개발

```bash
pnpm install    # 의존성 설치
pnpm dev        # 개발 서버 (HMR, Chrome 자동 열림)
pnpm build      # 프로덕션 빌드
pnpm lint       # ESLint
pnpm format     # Prettier
```

## 릴리스

```bash
make tag patch   # v2.0.1 → v2.0.2 + GitHub Release (zip 첨부)
make tag minor   # v2.0.2 → v2.1.0
make tag major   # v2.1.0 → v3.0.0
```

## 스크린샷

![screenshot](images/screenshot-v2.png)
![settings](images/screenshot-settings.png)
