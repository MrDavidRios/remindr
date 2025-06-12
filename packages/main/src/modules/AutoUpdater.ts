import { ipcMain } from "electron";
import log from "electron-log";
import type { UpdateDownloadedEvent } from "electron-updater";
import electronUpdater, {
  type AppUpdater,
  type Logger,
} from "electron-updater";
import { AppModule } from "../AppModule.js";
import { getMainWindow } from "../utils/getMainWindow.js";
import { isAutoUpdateEnabled } from "../utils/storeUserData.js";

type DownloadNotification = Parameters<
  AppUpdater["checkForUpdatesAndNotify"]
>[0];

export class AutoUpdater implements AppModule {
  readonly #logger: Logger | null;
  readonly #notification: DownloadNotification;

  constructor({
    logger = null,
    downloadNotification = undefined,
  }: {
    logger?: Logger | null | undefined;
    downloadNotification?: DownloadNotification;
  } = {}) {
    this.#logger = logger;
    this.#notification = downloadNotification;
  }

  async enable(): Promise<void> {
    await this.runAutoUpdater();
  }

  getAutoUpdater(): AppUpdater {
    // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
    // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
    const { autoUpdater } = electronUpdater;
    return autoUpdater;
  }

  async runAutoUpdater() {
    const updater = this.getAutoUpdater();
    try {
      updater.logger = this.#logger || null;
      updater.fullChangelog = true;

      if (import.meta.env.VITE_DISTRIBUTION_CHANNEL) {
        updater.channel = import.meta.env.VITE_DISTRIBUTION_CHANNEL;
      }

      log.transports.file.level = "info";
      updater.logger = log;

      updater.addListener("error", (error: Error) => {
        getMainWindow()?.webContents.send("update-error", error.message);
        updater.logger!.error("update error");
        updater.logger!.error(error);
      });

      updater.addListener("checking-for-update", () => {
        getMainWindow()?.webContents.send("checking-for-update");
        log.info("(AutoUpdater) Checking for update...");
      });

      updater.addListener("update-available", () => {
        getMainWindow()?.webContents.send("update-available");
        log.info("(AutoUpdater) Update available!");
      });

      updater.addListener("update-not-available", () => {
        getMainWindow()?.webContents.send("update-not-available");
        log.info("(AutoUpdater) Update not available.");
      });

      // Once downloaded, the program will update.
      updater.addListener(
        "update-downloaded",
        (info: UpdateDownloadedEvent) => {
          getMainWindow()?.webContents.send(
            "update-downloaded",
            info.releaseName
          );
          updater.logger!.info("update-downloaded");
          updater.logger!.info(info);
          log.info("(AutoUpdater) Update downloaded:", info.releaseName);
        }
      );

      ipcMain.on("check-for-updates", async () => {
        log.info("(AutoUpdater) Checking for updates...");

        const result = await updater.checkForUpdates();
        if (!result) {
          log.info("(AutoUpdater) No updates found.");
          getMainWindow()?.webContents.send("update-not-available");
          return;
        }
      });

      // If auto update is not defined in settings, treat it as enabled by default
      if (isAutoUpdateEnabled() ?? true) {
        log.info(
          "(AutoUpdater) Auto update is enabled. Checking for updates..."
        );
        await updater.checkForUpdates();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("No published versions")) {
          return null;
        }
      }

      throw error;
    }
  }
}

export function autoUpdater(
  ...args: ConstructorParameters<typeof AutoUpdater>
) {
  return new AutoUpdater(...args);
}
