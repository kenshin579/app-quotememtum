import { UNSPLASH_BASE_URL, UNSPLASH_CLIENT_ID, UNSPLASH_COLLECTION_ID } from './constants';

export interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string; thumb: string };
  user: { name: string; links: { html: string } };
  location?: { title: string };
  links: { html: string };
}

export async function fetchRandomPhoto(): Promise<UnsplashPhoto> {
  const params = new URLSearchParams({
    client_id: UNSPLASH_CLIENT_ID,
    collections: UNSPLASH_COLLECTION_ID,
  });

  const res = await fetch(`${UNSPLASH_BASE_URL}/photos/random?${params}`);
  if (!res.ok) {
    throw new Error(`Unsplash API Error: ${res.status}`);
  }
  return res.json();
}
