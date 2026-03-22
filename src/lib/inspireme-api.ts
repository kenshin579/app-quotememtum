import { INSPIREME_API_URL } from './constants';
import type { Quote, QuoteApiResponse } from '../types/quote';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = params?.toString()
    ? `${INSPIREME_API_URL}${path}?${params}`
    : `${INSPIREME_API_URL}${path}`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  const json: QuoteApiResponse<T> = await res.json();
  return json.data;
}

export async function fetchQuoteOfTheDay(
  language?: 'ko' | 'en',
): Promise<Quote> {
  const params = new URLSearchParams();
  if (language) params.set('lang', language);
  return apiFetch<Quote>('/quote-of-the-day', params);
}

export async function fetchRandomQuote(
  language?: 'ko' | 'en',
): Promise<Quote> {
  const params = new URLSearchParams();
  if (language) params.set('lang', language);
  params.set('count', '1');
  return apiFetch<Quote>('/random', params);
}
