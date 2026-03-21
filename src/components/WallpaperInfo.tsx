import type { UnsplashPhoto } from '../lib/unsplash-api';

interface WallpaperInfoProps {
  photo: UnsplashPhoto | null;
}

export function WallpaperInfo({ photo }: WallpaperInfoProps) {
  if (!photo) return null;

  const photographerUrl = `${photo.user.links.html}?utm_source=inspireme&utm_medium=referral`;
  const unsplashUrl = 'https://unsplash.com/?utm_source=inspireme&utm_medium=referral';

  return (
    <div className="text-xs text-white/60 drop-shadow-md">
      <span>Photo by </span>
      <a
        href={photographerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/80"
      >
        {photo.user.name}
      </a>
      {photo.location?.title && <span> · {photo.location.title}</span>}
      <span> on </span>
      <a
        href={unsplashUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/80"
      >
        Unsplash
      </a>
    </div>
  );
}
