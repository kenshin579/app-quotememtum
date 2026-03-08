export interface Quote {
  id: string;
  content: string;
  author: string;
  language: 'ko' | 'en';
  tags?: string[];
}

export interface QuoteOfTheDay extends Quote {
  topics?: string[];
  translations?: { lang: string; content: string }[];
  backgroundImageUrl?: string;
  authorInfo?: AuthorInfo;
  date?: string;
}

export interface AuthorInfo {
  id?: string;
  name: string;
  bio?: string;
  nationality?: string;
}

export interface QuoteApiResponse<T> {
  data: T;
}
