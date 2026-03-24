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

const API_TIMEOUT_MS = 5000;

async function apiFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = params?.toString()
    ? `${INSPIREME_API_URL}${path}?${params}`
    : `${INSPIREME_API_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new ApiError(res.status, body);
    }

    const json: QuoteApiResponse<T> = await res.json();
    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
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
