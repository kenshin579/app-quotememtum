import { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useQuote } from '../../hooks/useQuote';
import { useClock } from '../../hooks/useClock';
import { useBackground } from '../../hooks/useBackground';

import { Background } from '../../components/Background';
import { Clock } from '../../components/Clock';
import { Quote } from '../../components/Quote';
import { WallpaperInfo } from '../../components/WallpaperInfo';
import { SettingsIcon } from '../../components/SettingsIcon';
import { SettingsModal } from '../../components/settings/SettingsModal';
import { trackPageView } from '../../lib/analytics';

export default function App() {
  const { settings, updateSettings, loaded } = useSettings();
  const { quote, loading: quoteLoading } = useQuote(settings);
  const { formatted, dateStr } = useClock(settings.clockFormat);
  const { bgUrl, photoInfo } = useBackground();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  if (!loaded) return null;

  return (
    <main className="relative flex h-screen flex-col justify-between text-white animate-fade-in">
      <Background url={bgUrl} />

      <div className="flex items-start justify-end p-5">
        <Clock time={formatted} date={dateStr} />
        <SettingsIcon onClick={() => setShowSettings(true)} />
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <Quote
          quote={quote}
          loading={quoteLoading}
        />
      </div>

      <div className="flex items-end justify-between p-5">
        <WallpaperInfo photo={photoInfo} />
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
