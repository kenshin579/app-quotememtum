import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { fetchQuoteOfTheDay, fetchRandomQuote, ApiError } from '../lib/inspireme-api';
import type { Quote } from '../types/quote';
import type { QuoteMode, UserSettings } from '../types/settings';
import fallbackQuotes from '../assets/fallback-quotes.json';

interface CachedQuote {
  quote: Quote;
  timestamp: number;
  quoteMode: QuoteMode;
}

function isDayChanged(timestamp: number): boolean {
  const cached = new Date(timestamp);
  const now = new Date();
  return cached.toDateString() !== now.toDateString();
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
    const modeChanged = cached?.quoteMode !== settings.quoteMode;

    // 1) 캐시 유효 판정 — 모드별 분기
    if (cached && !modeChanged) {
      if (settings.quoteMode === 'qotd') {
        // 오늘의 명언: 같은 날이면 캐시 표시 후 종료 (quoteFrequency 무시)
        if (!isDayChanged(cached.timestamp)) {
          setQuote(cached.quote);
          setLoading(false);
          return;
        }
      }
      // 랜덤 명언: early return 없음 → 항상 SWR 진행
    }

    // 2) stale 데이터 또는 fallback을 즉시 표시 (SWR)
    //    - 모드 전환 시: 이전 모드 캐시 대신 fallback 사용
    if (cached && !modeChanged) {
      setQuote(cached.quote);
    } else {
      loadFallbackQuote();
    }
    setLoading(false);

    // 3) 백그라운드 API 호출 → 응답 시 교체
    try {
      let newQuote: Quote;
      if (settings.quoteMode === 'qotd') {
        newQuote = await fetchQuoteOfTheDay(settings.language);
      } else {
        newQuote = await fetchRandomQuote(settings.language);
      }
      setQuote(newQuote);
      await storage.set<CachedQuote>('quote', {
        quote: newQuote,
        timestamp: Date.now(),
        quoteMode: settings.quoteMode,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  }, [settings.quoteMode, settings.language, loadFallbackQuote]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  return { quote, loading, error, refresh: loadQuote };
}
