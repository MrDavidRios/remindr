/* eslint-env node */

import react from '@vitejs/plugin-react';
import { join } from 'node:path';
import { renderer } from 'unplugin-auto-expose';
import { chrome } from '../../.electron-vendors.cache.json';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  resolve: {
    alias: {
      '@renderer/': join(PACKAGE_ROOT, 'src') + '/',
      '@assets/': join(PACKAGE_ROOT, 'assets') + '/',
      '@hooks/': join(PACKAGE_ROOT, 'src/scripts/utils/hooks') + '/',
      '@mocks/': join(PACKAGE_ROOT, 'tests/mocks') + '/',
      '@renderer-types/': join(PACKAGE_ROOT, 'types') + '/',
    },
  },
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: {
        main: join(PACKAGE_ROOT, 'index.html'),
        notification: join(PACKAGE_ROOT, 'src/notifications/notification.html'),
        groupNotification: join(PACKAGE_ROOT, 'src/notifications/groupnotification.html'),
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  test: {
    environment: 'happy-dom',
    coverage: {
      reporter: ['text', 'lcov'],
    },
    setupFiles: ['/tests/mocks/setup.ts', '/tests/mocks/store-utils.tsx'],
  },
  plugins: [
    react(),
    renderer.vite({
      preloadEntry: join(PACKAGE_ROOT, '../preload/src/index.tsx'),
    }),
  ],
};

export default config;
