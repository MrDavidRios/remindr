import { BadgeInfo } from "@remindr/shared";
import {
  app,
  dialog,
  ipcMain,
  MessageBoxOptions,
  nativeImage,
  nativeTheme,
  shell,
  Task,
} from "electron";
import Store from "electron-store";
import { readFile } from "fs/promises";
import {
  EncodingOption,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { AppInitConfig } from "./AppInitConfig.js";
import {
  deleteAccountData,
  isSaving,
  loadStreamsData,
  loadTaskData,
  loadUserData,
  saveStreamsData,
  saveTaskData,
  saveUserData,
} from "./dataFunctions.js";
import { createModuleRunner } from "./ModuleRunner.js";
import { terminateAppOnLastWindowClose } from "./modules/ApplicationTerminatorOnLastWindowClose.js";
import { AutoUpdater } from "./modules/AutoUpdater.js";
import { allowInternalOrigins } from "./modules/BlockNotAllowdOrigins.js";
import { allowExternalUrls } from "./modules/ExternalUrls.js";
import { hardwareAccelerationMode } from "./modules/HardwareAccelerationModule.js";
import { disallowMultipleAppInstance } from "./modules/SingleInstanceApp.js";
import { createWindowManagerModule } from "./modules/WindowManager.js";
import { initNotificationEventListeners } from "./notifications.js";
import { initializeTaskLoop } from "./taskLoop.js";
import { initAppStateListeners } from "./utils/appState.js";
import { initAuthEventListeners } from "./utils/auth.js";
import { initFirebase } from "./utils/firebase.js";
import { getMainAssetPath } from "./utils/getMainAssetPath.js";
import { getMainWindow } from "./utils/getMainWindow.js";
import { getPageTitle } from "./utils/getPageTitle.js";
import { hasNetworkConnection } from "./utils/hasNetworkConnection.js";
import {
  initUserDataListeners,
  isAutoStartupEnabled,
  isHideOnStartupEnabled,
} from "./utils/storeUserData.js";

const autoUpdater: AutoUpdater = new AutoUpdater();

export async function initApp(initConfig: AppInitConfig) {
  callSetupFunctions();

  const moduleRunner = createModuleRunner()
    .init(
      createWindowManagerModule({
        initConfig,
        openDevTools: import.meta.env.DEV,
      })
    )
    .init(disallowMultipleAppInstance())
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({ enable: false }))
    .init(autoUpdater)

    // Security
    .init(
      allowInternalOrigins(
        new Set(
          initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : []
        )
      )
    )
    .init(
      allowExternalUrls(new Set(initConfig.renderer instanceof URL ? [] : []))
    );

  // chromeDevToolsExtension is currently not working on linux. Further investigation is needed if
  // linux is to be used as a development platform.
  if (import.meta.env.DEV && process.platform !== "linux") {
    const { chromeDevToolsExtension } = await import(
      "./modules/ChromeDevToolsExtension.js"
    );

    moduleRunner
      .init(chromeDevToolsExtension({ extension: "REACT_DEVELOPER_TOOLS" }))
      .init(chromeDevToolsExtension({ extension: "REDUX_DEVTOOLS" }));
  }

  await moduleRunner;

  // TODO: convert to module
  initializeTaskLoop();
}

const store = new Store();

// TODO: convert to modules
export const callSetupFunctions = () => {
  initFirebase();

  initNotificationEventListeners();

  // Listeners that aren't dependent on renderer to work
  initAppStateListeners();

  initUserDataListeners();

  // Dependent on Firebase
  initAuthEventListeners();
};

// TODO: REFACTOR THESE INTO THEIR OWN SEPARATE SCRIPTS
app.setLoginItemSettings({
  openAtLogin: isAutoStartupEnabled(),
  args: isHideOnStartupEnabled() ? ["--hidden"] : [],
});

export function quitApp() {
  app.quit();
}

export function restartApp() {
  app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
  app.exit();
}

export function restartAndUpdateApp() {
  // TODO: Refactor this code to be in AutoUpdater class (maybe listen for an event instead?)
  autoUpdater.getAutoUpdater().quitAndInstall();
}

/** Events / Functionality */

// #region Electron
ipcMain.on("open-external", (_event, url) => {
  shell.openExternal(url);
});

ipcMain.on("show-in-folder", (_event, url) => {
  shell.showItemInFolder(url);
});

ipcMain.on("is-packaged", (event) => {
  event.returnValue = app.isPackaged;
});

ipcMain.on("is-debug", (event) => {
  event.returnValue = !import.meta.env.PROD;
});

ipcMain.on("open-dev-tools", () => {
  getMainWindow()?.webContents.openDevTools();
});

ipcMain.on("get-system-theme", (event) => {
  event.returnValue = nativeTheme.shouldUseDarkColors ? "dark" : "light";
});

// Event listener for nativeTheme change
nativeTheme.on("updated", () => {
  const theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
  getMainWindow()?.webContents.send("system-theme-changed", theme);
});
// #endregion

// #region Dialog
ipcMain.handle("show-open-dialog", async (_event, options) => {
  const mainWindow = getMainWindow();
  if (mainWindow) return dialog.showOpenDialog(mainWindow, options);

  return undefined;
});
// #endregion

// #region Store
ipcMain.on("store-get", (event, value) => {
  event.returnValue = store.get(value);
});

ipcMain.on("store-set", (_event, key, value) => {
  store.set(key, value);
});

ipcMain.on("store-delete", (_event, key) => {
  store.delete(key);
});
// #endregion

// #region Badge
ipcMain.on("update-badge", (_event, badgeInfo: number | BadgeInfo | null) => {
  const mainWindow = getMainWindow();

  if (process.platform === "darwin" || process.platform === "linux") {
    app.setBadgeCount(badgeInfo as number);

    if (badgeInfo === 0 || badgeInfo === null) app.setBadgeCount(0);
    return;
  }

  if (badgeInfo === null) {
    mainWindow?.setOverlayIcon(null, "");
    return;
  }

  const badgeImagePath = getMainAssetPath((badgeInfo as BadgeInfo).badgePath);
  const badgeImage = nativeImage.createFromPath(badgeImagePath);
  mainWindow?.setOverlayIcon(badgeImage, (badgeInfo as BadgeInfo).description);
});
// #endregion

// #region fs
ipcMain.on(
  "fs-write-file-sync",
  async (_event, filePath: string, data: string) => {
    writeFileSync(filePath, data);
  }
);

ipcMain.on(
  "fs-read-file-sync",
  async (event, filePath: string, encoding?: EncodingOption) => {
    event.returnValue = readFileSync(filePath, encoding);
  }
);

ipcMain.on("fs-exists-sync", async (event, filePath: string) => {
  event.returnValue = existsSync(filePath);
});

ipcMain.on("fs-unlink-sync", async (_event, filePath: string) => {
  unlinkSync(filePath);
});
// #endregion

// #region Message Box
ipcMain.handle("show-message-box", (_event, options: MessageBoxOptions) => {
  return dialog.showMessageBox(options);
});
// #endregion

// #region Data
ipcMain.handle("save-user-data", () => {
  saveUserData();
});

ipcMain.handle("save-task-data", (_event, stringifiedTaskList: string) => {
  saveTaskData(stringifiedTaskList);
});

ipcMain.handle("save-streams-data", (_event, stringifiedStreamList: string) => {
  saveStreamsData(stringifiedStreamList);
});

ipcMain.handle("load-user-data", () => {
  return loadUserData();
});

ipcMain.handle("load-task-data", () => {
  return loadTaskData();
});

ipcMain.handle("load-streams-data", () => {
  return loadStreamsData();
});

ipcMain.handle("delete-account-data", () => {
  return deleteAccountData();
});
// #endregion

// #region Paths
ipcMain.on("get-user-path", (event) => {
  event.returnValue = app.getPath("userData");
});

ipcMain.on("path-basename", (event, pathString: string) => {
  event.returnValue = path.basename(pathString);
});
// #endregion

// #region Notification Operations
ipcMain.on("open-task-in-edit-panel", (_event, task) => {
  const mainWindow = getMainWindow();

  mainWindow?.show();
  mainWindow?.webContents.send("open-task-in-edit-panel", task);
});

ipcMain.on("close-notification", (_event, notifId: number) => {
  getMainWindow()?.webContents.send("close-notification", notifId);
});

ipcMain.on(
  "open-reminder",
  (_event, taskData: { task: Task; index: number }) => {
    const mainWindow = getMainWindow();

    mainWindow?.show();
    mainWindow?.webContents.send("open-reminder-in-edit-menu", taskData);
  }
);

ipcMain.on(
  "complete-task",
  (_event, taskData: { task: Task; index: number }) => {
    getMainWindow()?.webContents.send("complete-task", taskData);
  }
);

ipcMain.on(
  "snooze-reminder",
  (
    _event,
    taskData: { task: Task; index: number; time: number; add?: boolean }
  ) => {
    getMainWindow()?.webContents.send("snooze-reminder", taskData);
  }
);

ipcMain.on("initialize-group-notification", () => {
  getMainWindow()?.webContents.send("initialize-group-notification");
});
// #endregion

// #region Network

ipcMain.handle("has-network-connection", () => {
  return hasNetworkConnection();
});

ipcMain.on("is-saving", (event) => {
  event.returnValue = isSaving();
});

// #endregion

ipcMain.handle("get-background-image", async () => {
  const backgroundFilePath = `${app.getPath("userData")}\\background.jpg`;

  // check if file exists. if not, return undefined
  if (!existsSync(backgroundFilePath)) return undefined;

  const buffer = await readFile(backgroundFilePath);
  const buffString = Buffer.from(buffer).toString("base64");

  return buffString;
});

ipcMain.on("is-platform-windows-or-mac", (event) => {
  event.returnValue =
    process.platform === "win32" || process.platform === "darwin";
});

ipcMain.on("is-platform-windows", (event) => {
  event.returnValue = process.platform === "win32";
});

ipcMain.on("is-platform-mac", (event) => {
  event.returnValue = process.platform === "darwin";
});

ipcMain.on("is-platform-linux", (event) => {
  event.returnValue = process.platform === "linux";
});

ipcMain.on("open-dev-tools", () => {
  getMainWindow()?.webContents.openDevTools();
});

ipcMain.handle("get-page-title", async (_event, url) => {
  const pageTitle = await getPageTitle(url);
  return pageTitle;
});
