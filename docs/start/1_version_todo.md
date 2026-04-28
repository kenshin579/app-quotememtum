# 정보 화면 버전 동적 표시 — TODO

> Issue: #72
> PRD: `docs/start/1_version_prd.md`

## Phase 1: About 컴포넌트 수정

- [x] `src/components/settings/About.tsx` — `Version 2.0.0` 하드코딩 제거
- [x] `src/components/settings/About.tsx` — `chrome.runtime.getManifest().version` 으로 동적 표시 (`Version {version}`)

## Phase 2: 검증

- [ ] `pnpm compile` (tsc --noEmit) 타입 검사 통과
- [ ] `pnpm lint` 린트 통과
- [ ] `pnpm build` 프로덕션 빌드 정상 완료
- [ ] 빌드된 `manifest.json`의 `version`이 `package.json` 버전과 일치하는지 확인
- [ ] Chrome에 빌드 결과 로드 후 설정 > 정보 탭에서 `Version 2.2.2` 표시 확인
