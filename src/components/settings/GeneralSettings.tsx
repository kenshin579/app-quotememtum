import type { UserSettings, ClockFormat, QuoteFrequency, QuoteMode, Language } from '../../types/settings';

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
        <select
          value={settings.quoteFrequency}
          onChange={(e) => onUpdate({ quoteFrequency: Number(e.target.value) as QuoteFrequency })}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white"
        >
          <option value={2}>2시간</option>
          <option value={6}>6시간</option>
          <option value={12}>12시간</option>
        </select>
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
