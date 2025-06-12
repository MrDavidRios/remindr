// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Prevent running tests in parallel until e2e tests somehow no longer affect one another.
  workers: 1,
  globalSetup: "./tests/globalSetup.ts",
  projects: [
    {
      name: "offline",
      testMatch: /offline\.spec\.ts/,
    },
    {
      name: "all-e2e",
      testMatch: [/offline\.spec\.ts/],
    },
  ],
});
