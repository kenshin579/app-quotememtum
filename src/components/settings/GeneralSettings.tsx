import type { UserSettings, ClockFormat, QuoteMode, Language } from '../../types/settings';

interface GeneralSettingsProps {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

export function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  return (
    <div className="space-y-5">
      <SettingRow label="시계 형식">
        <select
          value={settings.clockFormat}
          onChange={(e) => onUpdate({ clockFormat: e.target.value as ClockFormat })}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white"
        >
          <option value="24h">24시간</option>
          <option value="12h">12시간</option>
        </select>
      </SettingRow>

      <SettingRow label="명언 모드">
        <select
          value={settings.quoteMode}
          onChange={(e) => onUpdate({ quoteMode: e.target.value as QuoteMode })}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white"
        >
          <option value="qotd">오늘의 명언</option>
          <option value="random">랜덤 명언</option>
        </select>
      </SettingRow>

      <SettingRow label="명언 갱신 주기">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={24}
            step={1}
            value={settings.quoteFrequency}
            onChange={(e) => {
              const v = Math.min(24, Math.max(1, Number(e.target.value) || 1));
              onUpdate({ quoteFrequency: v });
            }}
            className="w-16 rounded bg-gray-700 px-2 py-1.5 text-center text-sm text-white [&::-webkit-inner-spin-button]:appearance-auto [&::-webkit-outer-spin-button]:appearance-auto"
          />
          <span className="text-sm text-gray-400">시간</span>
        </div>
      </SettingRow>

      <SettingRow label="언어">
        <select
          value={settings.language}
          onChange={(e) => onUpdate({ language: e.target.value as Language })}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </SettingRow>

      <SettingRow label="다크 모드">
        <button
          onClick={() => onUpdate({ darkMode: !settings.darkMode })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.darkMode ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              settings.darkMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </SettingRow>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      {children}
    </div>
  );
}
