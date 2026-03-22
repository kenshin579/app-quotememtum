import { INSPIREME_BASE_URL } from '../lib/constants';
import type { Quote as QuoteType } from '../types/quote';
import { BookmarkButton } from './BookmarkButton';

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
        <div className="mx-auto h-8 w-80 rounded bg-white/10 mb-4" />
        <div className="mx-auto h-8 w-64 rounded bg-white/10 mb-4" />
        <div className="mx-auto h-5 w-40 rounded bg-white/10" />
      </div>
    );
  }

  if (!quote) return null;

  const hasLink = quote.id && quote.id.length > 0;
  const quoteUrl = `${INSPIREME_BASE_URL}/quotes/${quote.id}`;
  const authorUrl = quote.authorSlug
    ? `${INSPIREME_BASE_URL}/authors/${quote.authorSlug}`
    : undefined;

  const quoteContent = (
    <p className="text-4xl font-light leading-relaxed drop-shadow-lg max-w-3xl">
      &ldquo;{quote.content}&rdquo;
    </p>
  );

  return (
    <div className="text-center animate-fade-in">
      {hasLink ? (
        <a href={quoteUrl} className="cursor-pointer hover:opacity-80 transition-opacity">
          {quoteContent}
        </a>
      ) : (
        quoteContent
      )}

      <p className="mt-4 text-xl text-white/80 drop-shadow-md">
        —{' '}
        {authorUrl ? (
          <a href={authorUrl} className="hover:underline">{quote.author}</a>
        ) : (
          quote.author
        )}
      </p>

      <div className="mt-2 flex items-center justify-center gap-3">
        {hasLink && onToggleBookmark && (
          <BookmarkButton active={isBookmarked ?? false} onClick={onToggleBookmark} />
        )}
      </div>
    </div>
  );
}
