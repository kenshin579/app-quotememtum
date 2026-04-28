# 정보 화면 버전 동적 표시 PRD

## 1. 현재 상태 분석

### 현재 구현

| 항목 | 현재 값 | 비고 |
|------|---------|------|
| 표시 위치 | 설정 모달 > 정보 탭 | `src/components/settings/About.tsx` |
| 표시 문자열 | `Version 2.0.0` | **하드코딩** |
| 실제 배포 버전 | `2.2.2` | `package.json` 기준 |
| 버전 관리 | `make tag patch/minor/major` | `package.json` → wxt가 manifest.json에 자동 매핑 |

### 문제점

1. **버전 불일치**: `package.json`은 `2.2.2`인데 정보 화면은 `2.0.0`으로 고정 표시
2. **유지보수 누락**: 릴리스 시 `make tag`로 `package.json`은 자동 범프되지만 `About.tsx`는 수동 수정해야 해서 갱신이 누락됨
3. **Source of Truth 분산**: CLAUDE.md에 "버전은 `package.json`이 source of truth"라고 명시되어 있으나 화면 표시는 별도 하드코딩 값에 의존

### 관련 파일

```
src/components/settings/About.tsx   # "Version 2.0.0" 하드코딩
package.json                         # version: "2.2.2" (source of truth)
wxt.config.ts                        # manifest 정의 (version은 package.json에서 자동 주입)
```

## 2. 채택 방안: `chrome.runtime.getManifest().version` 사용

WXT는 빌드 시 `package.json`의 `version` 값을 자동으로 `manifest.json`의 `version` 필드에 주입한다. 따라서 런타임에 `chrome.runtime.getManifest().version`을 호출하면 현재 배포된 버전 문자열을 그대로 가져올 수 있다.

> 기존 `src/lib/storage.ts`에서 `chrome.storage` API를 사용 중이므로 `chrome.*` 네임스페이스로 통일.

```
package.json (2.2.2)
   │
   ▼  (wxt build)
manifest.json (version: "2.2.2")
   │
   ▼  (런타임)
chrome.runtime.getManifest().version  →  "2.2.2"
   │
   ▼
About.tsx 화면 표시
```

### 대안 비교

| 방안 | 장점 | 단점 | 채택 |
|------|------|------|------|
| `chrome.runtime.getManifest().version` | Chrome Extension 표준 API, 추가 설정 불필요, manifest와 항상 동기화 | newtab 외 컨텍스트에서도 `chrome` 객체 필요 (이미 사용 중) | ✅ |
| `import pkg from '../../package.json'` | 단순 | package.json 전체가 번들에 포함될 수 있음, JSON import 설정 필요 | ❌ |
| Vite `define`으로 `__APP_VERSION__` 주입 | 번들 크기 최소 | wxt.config.ts 수정 필요, 빌드 타임 고정 | ❌ |
| `import.meta.env.WXT_*` 환경 변수 | WXT 친화적 | 표준 환경 변수에 version 미포함, 커스텀 설정 필요 | ❌ |

## 3. 변경 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `src/components/settings/About.tsx` | `"Version 2.0.0"` 하드코딩 제거 → `chrome.runtime.getManifest().version`으로 동적 표시 (`Version {version}`) |

> 다른 파일 변경 불필요. WXT가 이미 `package.json` → `manifest.json` 버전 매핑을 자동 처리.

## 4. 동작 시나리오

| 시점 | 동작 |
|------|------|
| 개발자가 `make tag patch` 실행 | `package.json` 버전 범프 (예: 2.2.2 → 2.2.3) |
| `pnpm build` / `wxt build` | `manifest.json`에 새 버전 자동 반영 |
| 사용자가 새 버전 설치 후 설정 > 정보 | `Version 2.2.3` 자동 표시 |

## 5. 기대 효과

| 항목 | Before | After |
|------|--------|-------|
| 표시 버전 | `2.0.0` (고정) | `package.json` / `manifest.json`과 동일 |
| 릴리스 시 작업 | `make tag` + `About.tsx` 수동 수정 | `make tag`만 실행 |
| Source of Truth | `package.json` + `About.tsx` (이중) | `package.json` 단일화 |

## 6. 리스크 및 고려사항

- **테스트 환경에서의 표시**: `pnpm dev` 시에도 `manifest.json`이 생성되므로 정상 동작. 단, Storybook 같은 Extension 외부 환경에서 `About` 컴포넌트를 렌더하면 `chrome.runtime`이 undefined → 현재 코드는 newtab 진입점에서만 사용되므로 문제 없음. 추후 외부 사용 시 fallback(`?? 'dev'`) 검토.
- **버전 포맷**: `manifest.json`의 version은 Chrome 규칙상 `x.y.z` 또는 `x.y.z.w` 형태. semver의 prerelease 태그(`-beta.1` 등)는 자동 제거되므로 화면 표기와 일치. 별도 처리 불필요.
- **타입**: `chrome.runtime.getManifest()` 반환 타입은 `chrome.runtime.Manifest`로 `version: string` 필드가 정의되어 있어 추가 타입 단언 불필요.
