import { STORAGE_PREFIX } from './constants';

function prefixKey(name: string): string {
  return `${STORAGE_PREFIX}_${name}`;
}

export const storage = {
  async get<T>(name: string): Promise<T | null> {
    const result = await chrome.storage.local.get(prefixKey(name));
    return (result[prefixKey(name)] as T) ?? null;
  },

  async set<T>(name: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [prefixKey(name)]: value });
  },

  async remove(name: string): Promise<void> {
    await chrome.storage.local.remove(prefixKey(name));
  },
};

export const syncStorage = {
  async getApiKey(): Promise<string | null> {
    const result = await chrome.storage.sync.get(prefixKey('apiKey'));
    return (result[prefixKey('apiKey')] as string) ?? null;
  },

  async setApiKey(apiKey: string): Promise<void> {
    await chrome.storage.sync.set({ [prefixKey('apiKey')]: apiKey });
  },

  async removeApiKey(): Promise<void> {
    await chrome.storage.sync.remove(prefixKey('apiKey'));
  },
};
