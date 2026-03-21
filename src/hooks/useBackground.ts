import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { fetchRandomPhoto, type UnsplashPhoto } from '../lib/unsplash-api';
import defaultBgUrl from '../assets/default-bg.jpg';

interface CachedWallpaper {
  url: string;
  photo: UnsplashPhoto;
  timestamp: number;
}

const CACHE_HOURS = 24;

function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_HOURS * 60 * 60 * 1000;
}

export function useBackground() {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [photoInfo, setPhotoInfo] = useState<UnsplashPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBackground = useCallback(async () => {
    setLoading(true);

    const cached = await storage.get<CachedWallpaper>('wallpaper');
    if (cached && !isExpired(cached.timestamp)) {
      setBgUrl(cached.url);
      setPhotoInfo(cached.photo);
      setLoading(false);
      return;
    }

    try {
      const photo = await fetchRandomPhoto();
      setBgUrl(photo.urls.regular);
      setPhotoInfo(photo);
      await storage.set<CachedWallpaper>('wallpaper', {
        url: photo.urls.regular,
        photo,
        timestamp: Date.now(),
      });
    } catch {
      setBgUrl(defaultBgUrl);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackground();
  }, [loadBackground]);

  return { bgUrl, photoInfo, loading, refresh: loadBackground };
}
