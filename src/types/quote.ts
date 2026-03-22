export interface Quote {
  id: string;
  content: string;
  author: string;
  authorSlug: string;
  language: 'ko' | 'en';
  topics: string[];
}

export interface QuoteApiResponse<T> {
  data: T;
}
