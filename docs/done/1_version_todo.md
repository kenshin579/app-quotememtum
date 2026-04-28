# 정보 화면 버전 동적 표시 — TODO

> Issue: #72
> PRD: `docs/start/1_version_prd.md`

## Phase 1: About 컴포넌트 수정

- [x] `src/components/settings/About.tsx` — `Version 2.0.0` 하드코딩 제거
- [x] `src/components/settings/About.tsx` — `chrome.runtime.getManifest().version` 으로 동적 표시 (`Version {version}`)

## Phase 2: 검증

- [~] `pnpm compile` — `chrome` 글로벌 타입 누락 에러는 기존 master(storage.ts)에도 동일하게 존재. 본 변경으로 인한 신규 에러 없음. (`@types/chrome` 추가는 별도 이슈로 분리)
- [~] `pnpm lint` — 기존 `useQuote.ts`/`useBackground.ts`의 `react-hooks/set-state-in-effect` 에러만 존재. About.tsx 관련 신규 에러 없음.
- [x] `pnpm build` 프로덕션 빌드 정상 완료
- [x] 빌드된 `manifest.json`의 `version`이 `package.json`과 일치 확인 (2.2.2)
- [x] 빌드 번들에 `Version 2.0.0` 하드코딩이 사라지고 `getManifest` 호출이 포함됨 확인
- [ ] (사용자 검증) Chrome에 빌드 결과 로드 후 설정 > 정보 탭에서 `Version 2.2.2` 표시 확인
