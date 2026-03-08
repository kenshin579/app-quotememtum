import { INSPIREME_BASE_URL } from '../lib/constants';
import type { Quote as QuoteType } from '../types/quote';

interface QuoteProps {
  quote: QuoteType | null;
  loading: boolean;
}

export function Quote({ quote, loading }: QuoteProps) {
  if (loading) {
    return (
      <div className="text-center text-white/50">
        <p className="text-lg">불러오는 중...</p>
      </div>
    );
  }

  if (!quote) return null;

  const hasLink = quote.id && quote.id.length > 0;
  const quoteUrl = `${INSPIREME_BASE_URL}/quotes/${quote.id}`;

  const content = (
    <>
      <p className="text-2xl font-light leading-relaxed drop-shadow-lg max-w-2xl">
        &ldquo;{quote.content}&rdquo;
      </p>
      <p className="mt-4 text-lg text-white/80 drop-shadow-md">— {quote.author}</p>
    </>
  );

  if (hasLink) {
    return (
      <a
        href={quoteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        {content}
      </a>
    );
  }

  return <div className="text-center">{content}</div>;
}
