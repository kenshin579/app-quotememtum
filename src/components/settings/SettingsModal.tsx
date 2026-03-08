import { useState } from 'react';
import { GeneralSettings } from './GeneralSettings';
import { ApiKeySettings } from './ApiKeySettings';
import { About } from './About';
import type { UserSettings } from '../../types/settings';

type Tab = 'general' | 'apiKey' | 'about';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onUpdate, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: '일반' },
    { key: 'apiKey', label: 'API Key' },
    { key: 'about', label: '정보' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="닫기">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5 flex gap-1 rounded-lg bg-gray-900 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[200px]">
          {activeTab === 'general' && <GeneralSettings settings={settings} onUpdate={onUpdate} />}
          {activeTab === 'apiKey' && <ApiKeySettings />}
          {activeTab === 'about' && <About />}
        </div>
      </div>
    </div>
  );
}
