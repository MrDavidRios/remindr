import { test as base } from "@playwright/test";
import { globSync } from "glob";
import { platform } from "node:process";
import type { ElectronApplication } from "playwright";
import { _electron as electron } from "playwright";

/**
 * Boilerplate code for getting Electron instance running in e2e tests.
 *
 * Import `test` from testFixtures.ts throughout these test files.
 */

// Declare the types of your fixtures.
export type TestFixtures = {
  customEnv?: NodeJS.ProcessEnv;
  electronApp: ElectronApplication;
  electronVersions: NodeJS.ProcessVersions;
};

export const test = base.extend<TestFixtures>({
  customEnv: [
    async ({}, use) => {
      await use(undefined); // default is undefined, can be overridden per test
    },
    { scope: "worker", auto: true } as any,
  ],
  electronApp: [
    async ({ customEnv }, use) => {
      /**
       * Executable path depends on root package name!
       */
      let executablePattern = "dist/*/Remindr{,.*}";
      if (platform === "darwin") {
        executablePattern += "/Contents/*/Remindr";
      }
      if (platform === "linux") {
        executablePattern = "dist/*-unpacked/*";
      }

      const [executablePath] = globSync(executablePattern);
      if (!executablePath) {
        throw new Error("App Executable path not found");
      }

      const electronApp = await electron.launch({
        executablePath,
        args: ["--no-sandbox"],
        env: {
          ...process.env,
          NODE_ENV: "development",
          ...customEnv,
        },
      });

      electronApp.on("console", (msg) => {
        if (msg.type() === "error") {
          console.error(`[electron][${msg.type()}] ${msg.text()}`);
        }

        if (msg.type() === "log") {
          console.log(`[electron][${msg.type()}] ${msg.text()}`);
        }

        if (msg.type() === "info") {
          console.log(`[electron][${msg.type()}] ${msg.text()}`);
        }
      });

      await use(electronApp);

      // This code runs after all the tests in the worker process.
      await electronApp.close();
    },
    { scope: "worker", auto: true } as any,
  ],

  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    // capture errors
    page.on("pageerror", (error) => {
      console.error(error);
    });
    // capture console messages
    page.on("console", (msg) => {
      console.log(msg.text());
    });

    await page.waitForLoadState("load");
    await use(page);
  },

  electronVersions: async ({ electronApp }, use) => {
    await use(await electronApp.evaluate(() => process.versions));
  },
});
