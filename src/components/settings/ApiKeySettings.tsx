import { useState, useEffect } from 'react';
import { syncStorage } from '../../lib/storage';

export function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    syncStorage.getApiKey().then((key) => {
      if (key) {
        setApiKey(key);
        setHasKey(true);
      }
    });
  }, []);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      await syncStorage.setApiKey(trimmed);
      setHasKey(true);
    } else {
      await syncStorage.removeApiKey();
      setHasKey(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-300">InspireMe API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="im_live_..."
          className="w-full rounded bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          저장
        </button>
        {saved && <span className="text-sm text-green-400">저장되었습니다</span>}
      </div>

      <p className="text-xs text-gray-500">
        {hasKey ? 'API Key가 설정되어 있습니다.' : 'API Key가 없으면 기본 명언이 표시됩니다.'}
        {' '}
        <a
          href="https://inspire-me.advenoh.pe.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-400"
        >
          API Key 발급
        </a>
      </p>
    </div>
  );
}
