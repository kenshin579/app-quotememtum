import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import type { Quote } from '../types/quote';

const STORAGE_KEY = 'bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Quote[]>([]);

  useEffect(() => {
    storage.get<Quote[]>(STORAGE_KEY).then((saved) => {
      if (saved) setBookmarks(saved);
    });
  }, []);

  const isBookmarked = useCallback(
    (quoteId: string) => bookmarks.some((b) => b.id === quoteId),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    async (quote: Quote) => {
      let next: Quote[];
      if (isBookmarked(quote.id)) {
        next = bookmarks.filter((b) => b.id !== quote.id);
      } else {
        next = [...bookmarks, quote];
      }
      setBookmarks(next);
      await storage.set(STORAGE_KEY, next);
    },
    [bookmarks, isBookmarked],
  );

  return { bookmarks, isBookmarked, toggleBookmark };
}
