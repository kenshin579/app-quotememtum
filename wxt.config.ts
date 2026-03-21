import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Quotememtum',
    version: '2.0.0',
    description: '새 탭에서 매일 영감을 주는 명언을 만나보세요',
    permissions: ['storage'],
    host_permissions: [
      'https://inspire-me.advenoh.pe.kr/*',
      'https://api.unsplash.com/*',
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
