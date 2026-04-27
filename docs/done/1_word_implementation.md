# 명언 줄바꿈 시 단어 분리 방지 — 구현 문서

## 1. Quote 컴포넌트에 `break-keep` 클래스 추가

**파일**: `src/components/Quote.tsx`

명언 본문과 저자 `<p>` 요소의 `className`에 Tailwind v4 `break-keep`(= `word-break: keep-all`) 유틸리티 추가.

### 1-1. 명언 본문 (`Quote.tsx:37`)

```tsx
// Before
const quoteContent = (
  <p className="font-light drop-shadow-lg max-w-3xl" style={quoteStyle}>
    &ldquo;{quote.content}&rdquo;
  </p>
);

// After
const quoteContent = (
  <p className="font-light drop-shadow-lg max-w-3xl break-keep" style={quoteStyle}>
    &ldquo;{quote.content}&rdquo;
  </p>
);
```

### 1-2. 저자 (`Quote.tsx:52`)

```tsx
// Before
<p className="mt-4 text-xl text-white/80 drop-shadow-md" style={{ fontFamily: fontFamily || undefined }}>

// After
<p className="mt-4 text-xl text-white/80 drop-shadow-md break-keep" style={{ fontFamily: fontFamily || undefined }}>
```

## 2. 동작 원리

| 속성 값 | 동작 |
|---------|------|
| `normal` (기본) | CJK 문자를 단어 경계로 인정하지 않음 → 어절 중간에서 끊김 |
| **`keep-all` (적용)** | **CJK 텍스트는 공백/구두점에서만 줄바꿈** → 어절 보존 |

Tailwind CSS v4의 `break-keep` 유틸리티가 `word-break: keep-all`을 그대로 매핑하므로 별도 설정 변경 불필요.

## 3. 변경 파일 요약

| 파일 | 변경 사항 |
|------|----------|
| `src/components/Quote.tsx` | 명언 본문 `<p>`(line 37) `className`에 `break-keep` 추가 / 저자 `<p>`(line 52) `className`에 `break-keep` 추가 |
