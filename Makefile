.PHONY: help dev build zip tag

# ========================================
# 도움말
# ========================================

help:
	@echo "InspireMe Chrome Extension 명령어"
	@echo ""
	@echo "개발:"
	@echo "  dev      개발 서버 실행 (HMR)"
	@echo "  build    프로덕션 빌드"
	@echo "  zip      빌드 + zip 생성"
	@echo ""
	@echo "릴리스:"
	@echo "  make tag patch|minor|major   버전 태그 + GitHub Release (zip 첨부)"

# ========================================
# 개발
# ========================================

dev:
	@pnpm dev

build:
	@pnpm build

zip:
	@pnpm zip

# ========================================
# 릴리스
# ========================================

# 태그 및 릴리스 (인자: patch, minor, major)
# 사용법: make tag patch / make tag minor / make tag major
tag:
	@./scripts/release.sh $(filter-out $@,$(MAKECMDGOALS))

# 인자를 타겟으로 인식하지 않도록 처리
%:
	@:
