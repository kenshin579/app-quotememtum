import { useState, useEffect, useMemo } from 'react';
import type { ClockFormat } from '../types/settings';

export function useClock(format: ClockFormat) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = useMemo(() => {
    return time.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
    });
  }, [time, format]);

  const dateStr = useMemo(() => {
    return time.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, [time]);

  return { formatted, dateStr };
}
