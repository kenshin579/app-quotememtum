import { useEffect } from 'react';
import { QUOTE_FONTS, type QuoteFont } from '../types/settings';

const GOOGLE_FONT_NAMES: Record<string, string> = {
  'noto-serif-kr': 'Noto+Serif+KR:wght@300;400',
  'nanum-myeongjo': 'Nanum+Myeongjo:wght@400;700',
  'gowun-batang': 'Gowun+Batang:wght@400;700',
  'nanum-gothic': 'Nanum+Gothic:wght@400;700',
  'gaegu': 'Gaegu:wght@300;400',
};

export function useGoogleFont(font: QuoteFont) {
  useEffect(() => {
    if (font === 'system') return;

    const googleName = GOOGLE_FONT_NAMES[font];
    if (!googleName) return;

    const id = `google-font-${font}`;
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleName}&display=swap`;
    document.head.appendChild(link);
  }, [font]);
}

export function getQuoteFontFamily(font: QuoteFont): string {
  const found = QUOTE_FONTS.find((f) => f.value === font);
  return found?.family || '';
}
