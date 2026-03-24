import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { fetchRandomPhoto, buildHighQualityUrl, type UnsplashPhoto } from '../lib/unsplash-api';
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

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
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

    // stale 캐시가 있으면 먼저 표시, 없으면 기본 배경 (SWR)
    if (cached) {
      setBgUrl(cached.url);
      setPhotoInfo(cached.photo);
    } else {
      setBgUrl(defaultBgUrl);
    }
    setLoading(false);

    try {
      const photo = await fetchRandomPhoto();
      const hqUrl = buildHighQualityUrl(photo.urls.raw);
      await preloadImage(hqUrl);
      setBgUrl(hqUrl);
      setPhotoInfo(photo);
      await storage.set<CachedWallpaper>('wallpaper', {
        url: hqUrl,
        photo,
        timestamp: Date.now(),
      });
    } catch {
      // stale/기본 배경이 이미 표시 중
    }
  }, []);

  useEffect(() => {
    loadBackground();
  }, [loadBackground]);

  return { bgUrl, photoInfo, loading, refresh: loadBackground };
}
