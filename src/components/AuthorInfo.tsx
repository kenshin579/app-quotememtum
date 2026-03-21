import { useState } from 'react';
import type { AuthorInfo as AuthorInfoType } from '../types/quote';

interface AuthorInfoProps {
  authorInfo: AuthorInfoType;
}

export function AuthorInfo({ authorInfo }: AuthorInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-white/60 hover:text-white transition-colors text-xs underline"
      >
        저자 정보
      </button>

      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-gray-800 p-4 shadow-xl animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <h4 className="text-sm font-medium text-white">{authorInfo.name}</h4>
          {authorInfo.nationality && (
            <p className="mt-1 text-xs text-gray-400">{authorInfo.nationality}</p>
          )}
          {authorInfo.bio && (
            <p className="mt-2 text-xs text-gray-300 leading-relaxed">{authorInfo.bio}</p>
          )}
        </div>
      )}
    </div>
  );
}
