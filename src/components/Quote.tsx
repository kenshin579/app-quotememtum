import { INSPIREME_BASE_URL } from '../lib/constants';
import type { Quote as QuoteType, QuoteOfTheDay } from '../types/quote';
import { BookmarkButton } from './BookmarkButton';
import { AuthorInfo } from './AuthorInfo';

interface QuoteProps {
  quote: QuoteType | null;
  loading: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function Quote({ quote, loading, isBookmarked, onToggleBookmark }: QuoteProps) {
  if (loading) {
    return (
      <div className="text-center text-white/50 animate-pulse">
        <div className="mx-auto h-6 w-64 rounded bg-white/10 mb-4" />
        <div className="mx-auto h-6 w-48 rounded bg-white/10 mb-4" />
        <div className="mx-auto h-4 w-32 rounded bg-white/10" />
      </div>
    );
  }

  if (!quote) return null;

  const hasLink = quote.id && quote.id.length > 0;
  const quoteUrl = `${INSPIREME_BASE_URL}/quotes/${quote.id}`;
  const authorInfo = (quote as QuoteOfTheDay).authorInfo;

  const textContent = (
    <>
      <p className="text-2xl font-light leading-relaxed drop-shadow-lg max-w-2xl">
        &ldquo;{quote.content}&rdquo;
      </p>
      <p className="mt-4 text-lg text-white/80 drop-shadow-md">— {quote.author}</p>
    </>
  );

  return (
    <div className="text-center animate-fade-in">
      {hasLink ? (
        <a
          href={quoteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          {textContent}
        </a>
      ) : (
        textContent
      )}

      <div className="mt-2 flex items-center justify-center gap-3">
        {hasLink && onToggleBookmark && (
          <BookmarkButton active={isBookmarked ?? false} onClick={onToggleBookmark} />
        )}
        {authorInfo && <AuthorInfo authorInfo={authorInfo} />}
      </div>
    </div>
  );
}
