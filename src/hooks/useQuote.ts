import { useState, useEffect, useCallback } from 'react';
import { storage, syncStorage } from '../lib/storage';
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
    setLoading(true);
    setError(null);

    const cached = await storage.get<CachedQuote>('quote');
    if (cached && !isExpired(cached.timestamp, settings.quoteFrequency)) {
      setQuote(cached.quote);
      setLoading(false);
      return;
    }

    try {
      const apiKey = await syncStorage.getApiKey();
      if (!apiKey) {
        loadFallbackQuote();
        setLoading(false);
        return;
      }

      let newQuote: Quote;
      if (settings.quoteMode === 'qotd') {
        newQuote = await fetchQuoteOfTheDay(apiKey, settings.language);
      } else {
        newQuote = await fetchRandomQuote(apiKey, settings.language);
      }

      setQuote(newQuote);
      await storage.set<CachedQuote>('quote', { quote: newQuote, timestamp: Date.now() });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('API Key가 유효하지 않습니다. 설정에서 확인해 주세요.');
        } else if (err.status === 429) {
          setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
        }
      }
      loadFallbackQuote();
    } finally {
      setLoading(false);
    }
  }, [settings.quoteMode, settings.language, settings.quoteFrequency, loadFallbackQuote]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  return { quote, loading, error, refresh: loadQuote };
}
