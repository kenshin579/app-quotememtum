import { INSPIREME_API_URL } from './constants';
import type { Quote, QuoteOfTheDay, QuoteApiResponse } from '../types/quote';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, apiKey: string, params?: URLSearchParams): Promise<T> {
  const url = params?.toString()
    ? `${INSPIREME_API_URL}${path}?${params}`
    : `${INSPIREME_API_URL}${path}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  const json: QuoteApiResponse<T> = await res.json();
  return json.data;
}

export async function fetchQuoteOfTheDay(
  apiKey: string,
  language?: 'ko' | 'en',
): Promise<QuoteOfTheDay> {
  const params = new URLSearchParams();
  if (language) params.set('language', language);
  return apiFetch<QuoteOfTheDay>('/quote-of-the-day', apiKey, params);
}

export async function fetchRandomQuote(
  apiKey: string,
  language?: 'ko' | 'en',
): Promise<Quote> {
  const params = new URLSearchParams();
  if (language) params.set('language', language);
  params.set('count', '1');
  return apiFetch<Quote>('/quotes/random', apiKey, params);
}
