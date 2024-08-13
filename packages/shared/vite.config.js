/* eslint-env node */

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  test: {
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
};

export default config;
