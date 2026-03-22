export type ClockFormat = '12h' | '24h';
export type QuoteMode = 'qotd' | 'random';
export type Language = 'ko' | 'en';
export type BackgroundSource = 'unsplash' | 'qotd' | 'both';

export const QUOTE_FONTS = [
  { value: 'system', label: '시스템 기본', family: '' },
  { value: 'noto-serif-kr', label: 'Noto Serif Korean', family: "'Noto Serif KR', serif" },
  { value: 'nanum-myeongjo', label: '나눔명조', family: "'Nanum Myeongjo', serif" },
  { value: 'gowun-batang', label: '고운바탕', family: "'Gowun Batang', serif" },
  { value: 'nanum-gothic', label: '나눔고딕', family: "'Nanum Gothic', sans-serif" },
  { value: 'gaegu', label: '개구', family: "'Gaegu', cursive" },
] as const;

export type QuoteFont = (typeof QUOTE_FONTS)[number]['value'];

export interface UserSettings {
  clockFormat: ClockFormat;
  quoteFrequency: number;
  quoteMode: QuoteMode;
  language: Language;
  darkMode: boolean;
  backgroundSource: BackgroundSource;
  quoteFont: QuoteFont;
  quoteFontSize: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  clockFormat: '24h',
  quoteFrequency: 1,
  quoteMode: 'qotd',
  language: 'ko',
  darkMode: false,
  backgroundSource: 'unsplash',
  quoteFont: 'noto-serif-kr',
  quoteFontSize: 36,
};
