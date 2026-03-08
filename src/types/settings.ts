export type ClockFormat = '12h' | '24h';
export type QuoteFrequency = 2 | 6 | 12;
export type QuoteMode = 'qotd' | 'random';
export type Language = 'ko' | 'en';
export type BackgroundSource = 'unsplash' | 'qotd' | 'both';

export interface UserSettings {
  clockFormat: ClockFormat;
  quoteFrequency: QuoteFrequency;
  quoteMode: QuoteMode;
  language: Language;
  darkMode: boolean;
  backgroundSource: BackgroundSource;
}

export const DEFAULT_SETTINGS: UserSettings = {
  clockFormat: '24h',
  quoteFrequency: 6,
  quoteMode: 'qotd',
  language: 'ko',
  darkMode: false,
  backgroundSource: 'unsplash',
};
