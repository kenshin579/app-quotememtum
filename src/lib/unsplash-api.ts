import { UNSPLASH_BASE_URL, UNSPLASH_CLIENT_ID, UNSPLASH_COLLECTION_ID } from './constants';

export interface UnsplashPhoto {
  id: string;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  user: { name: string; links: { html: string } };
  location?: { title: string };
  links: { html: string };
}

export async function fetchRandomPhoto(): Promise<UnsplashPhoto> {
  const params = new URLSearchParams({
    client_id: UNSPLASH_CLIENT_ID,
    collections: UNSPLASH_COLLECTION_ID,
    orientation: 'landscape',
  });

  const res = await fetch(`${UNSPLASH_BASE_URL}/photos/random?${params}`);
  if (!res.ok) {
    throw new Error(`Unsplash API Error: ${res.status}`);
  }
  return res.json();
}

export function buildHighQualityUrl(rawUrl: string, width?: number): string {
  const w = width ?? Math.min(window.screen.width, 2560);
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  const params = new URLSearchParams({
    w: String(Math.round(w * dpr)),
    q: '85',
    fm: 'jpg',
    fit: 'max',
    auto: 'format',
  });
  return `${rawUrl}&${params}`;
}
