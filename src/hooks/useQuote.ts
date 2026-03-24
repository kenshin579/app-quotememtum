import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { fetchQuoteOfTheDay, fetchRandomQuote, ApiError } from '../lib/inspireme-api';
import type { Quote } from '../types/quote';
import type { UserSettings } from '../types/settings';
import fallbackQuotes from '../assets/fallback-quotes.json';

interface CachedQuote {
  quote: Quote;
  timestamp: number;
}

function isExpired(timestamp: number, hours: number): boolean {
  return Date.now() - timestamp > hours * 60 * 60 * 1000;
}

export function useQuote(settings: UserSettings) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFallbackQuote = useCallback(() => {
    const quotes = fallbackQuotes as Quote[];
    const randomIdx = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIdx]);
  }, []);

  const loadQuote = useCallback(async () => {
    setError(null);

    const cached = await storage.get<CachedQuote>('quote');

    // 1) 캐시 유효 → 즉시 표시, API 호출 없이 종료
    if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
      setQuote(cached.quote);
      setLoading(false);
      return;
    }

    // 2) stale 캐시 또는 fallback을 즉시 표시 (SWR)
    if (cached) {
      setQuote(cached.quote);
    } else {
      loadFallbackQuote();
    }
    setLoading(false);

    // 3) 백그라운드 revalidate
    try {
      let newQuote: Quote;
      if (settings.quoteMode === 'qotd') {
        newQuote = await fetchQuoteOfTheDay(settings.language);
      } else {
        newQuote = await fetchRandomQuote(settings.language);
      }
      setQuote(newQuote);
      await storage.set<CachedQuote>('quote', { quote: newQuote, timestamp: Date.now() });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  }, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  return { quote, loading, error, refresh: loadQuote };
}
