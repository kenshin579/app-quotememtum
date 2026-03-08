import { useSettings } from '../../hooks/useSettings';
import { useQuote } from '../../hooks/useQuote';
import { useClock } from '../../hooks/useClock';
import { useBackground } from '../../hooks/useBackground';
import { Background } from '../../components/Background';
import { Clock } from '../../components/Clock';
import { Quote } from '../../components/Quote';
import { WallpaperInfo } from '../../components/WallpaperInfo';

export default function App() {
  const { settings, loaded } = useSettings();
  const { quote, loading: quoteLoading } = useQuote(settings);
  const { formatted, dateStr } = useClock(settings.clockFormat);
  const { bgUrl, photoInfo } = useBackground();

  if (!loaded) return null;

  return (
    <main className="relative flex h-screen flex-col justify-between text-white">
      <Background url={bgUrl} />

      <div className="flex justify-end p-5">
        <Clock time={formatted} date={dateStr} />
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <Quote quote={quote} loading={quoteLoading} />
      </div>

      <div className="flex items-end justify-between p-5">
        <WallpaperInfo photo={photoInfo} />
      </div>
    </main>
  );
}
