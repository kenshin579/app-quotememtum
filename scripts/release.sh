#!/bin/bash
set -e

VERSION_TYPE=${1:-patch}

# package.json에서 현재 버전 읽기 (Chrome extension 버전의 source of truth)
CURRENT_VERSION=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' package.json)

# 버전 파싱
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# 버전 범프
case $VERSION_TYPE in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "Usage: $0 [patch|minor|major]"; exit 1 ;;
esac

NEW_VERSION="v${MAJOR}.${MINOR}.${PATCH}"
NEW_VERSION_NUM="${MAJOR}.${MINOR}.${PATCH}"

echo "Current version: v${CURRENT_VERSION}"
echo "New version: $NEW_VERSION"

# package.json 버전 업데이트
sed -i '' "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION_NUM}\"/" package.json
echo "Updated package.json to ${NEW_VERSION_NUM}"

# 이전 zip 정리 후 빌드
rm -f .output/*-chrome.zip
echo "Building and zipping extension..."
pnpm zip

ZIP_FILE=$(ls .output/*-chrome.zip 2>/dev/null | head -1)

if [ -z "$ZIP_FILE" ]; then
  echo "Error: zip file not found in .output/"
  exit 1
fi

echo "Created: $ZIP_FILE"

# 버전 변경 커밋
git add package.json
git commit -m "[release] ${NEW_VERSION}"

# Git 태그 생성 및 푸시
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"
git push origin HEAD
git push origin "$NEW_VERSION"

# GitHub 릴리스 생성 (zip 첨부)
gh release create "$NEW_VERSION" "$ZIP_FILE" \
  --title "$NEW_VERSION" \
  --generate-notes

echo ""
echo "Released: $NEW_VERSION"
echo "Asset: $ZIP_FILE"
