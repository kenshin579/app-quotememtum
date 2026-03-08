import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { DEFAULT_SETTINGS, type UserSettings } from '../types/settings';

const STORAGE_KEY = 'settings';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.get<UserSettings>(STORAGE_KEY).then((saved) => {
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...saved });
      }
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await storage.set(STORAGE_KEY, next);
    },
    [settings],
  );

  return { settings, updateSettings, loaded };
}
