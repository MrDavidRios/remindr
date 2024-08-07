import type { BadgeInfo, Task } from '@remindr/shared';
import type { BrowserWindow, MessageBoxOptions } from 'electron';
import { app, dialog, ipcMain, nativeImage, nativeTheme, shell } from 'electron';
import Store from 'electron-store';
import updater from 'electron-updater';
import type { EncodingOption } from 'fs';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { platform } from 'node:process';
import path, { join } from 'path';
import { AppUpdater } from './appUpdater.js';
import { deleteAccountData, isSaving, loadData, saveData, setMainWindowForDataFunctions } from './dataFunctions.js';
import { initNotificationEventListeners } from './notifications.js';
import './security-restrictions';
import { initAppStateListeners } from './utils/appState.js';
import initAuthEventListeners from './utils/auth.js';
import { initFirebase } from './utils/firebase.js';
import { getMainWindow } from './utils/getMainWindow.js';
import { getPageTitle } from './utils/getPageTitle.js';
import hasNetworkConnection from './utils/hasNetworkConnection.js';
import initWindowEventListeners from './utils/window.js';
import { restoreOrCreateWindow } from '/@/mainWindow.js';
import initUserDataListeners, { isAutoStartupEnabled, isHideOnStartupEnabled } from '/@/utils/storeUserData.js';

const { autoUpdater } = updater;

const store = new Store();

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

initFirebase();

export const callSetupFunctions = (window: BrowserWindow) => {
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  initWindowEventListeners(window);
  initNotificationEventListeners(window);

  // Listeners that aren't dependent on renderer to work
  initAppStateListeners();
  initUserDataListeners();

  // Dependent on Firebase
  initAuthEventListeners(window);

  setMainWindowForDataFunctions(window);
};

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(async () => {
    console.log('creating window...');

    await restoreOrCreateWindow();
  })
  .catch((e) => console.error('Failed create window:', e));

/**
 * Install extensions in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
if (import.meta.env.DEV) {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then((module) => {
      const { default: installExtension, REDUX_DEVTOOLS } =
        //@ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
        typeof module.default === 'function' ? module : (module.default as typeof module);

      //@ts-expect-error installExtension typing isn't working
      return installExtension([REDUX_DEVTOOLS], {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
      });
    })
    .catch((e) => console.error('Failed install extension:', e));
}

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check and install updates:', e));
}

// TODO: REFACTOR THESE INTO THEIR OWN SEPARATE SCRIPTS
app.setLoginItemSettings({
  openAtLogin: isAutoStartupEnabled(),
  args: isHideOnStartupEnabled() ? ['--hidden'] : [],
});

export function quitApp() {
  app.quit();
}

export function restartApp() {
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
  app.exit();
}

export function restartAndUpdateApp() {
  autoUpdater.quitAndInstall();
}

/** Events / Functionality */

// #region Electron
ipcMain.on('open-external', (_event, url) => {
  shell.openExternal(url);
});

ipcMain.on('show-in-folder', (_event, url) => {
  shell.showItemInFolder(url);
});

ipcMain.on('is-packaged', (event) => {
  event.returnValue = app.isPackaged;
});

ipcMain.on('is-debug', (event) => {
  event.returnValue = !import.meta.env.PROD;
});

ipcMain.on('open-dev-tools', () => {
  getMainWindow()?.webContents.openDevTools();
});

ipcMain.on('get-system-theme', (event) => {
  event.returnValue = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

// Event listener for nativeTheme change
nativeTheme.on('updated', () => {
  const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  getMainWindow()?.webContents.send('system-theme-changed', theme);
});
// #endregion

// #region Dialog
ipcMain.handle('show-open-dialog', async (_event, options) => {
  const mainWindow = getMainWindow();
  if (mainWindow) return dialog.showOpenDialog(mainWindow, options);

  return undefined;
});
// #endregion

// #region Store
ipcMain.on('store-get', (event, value) => {
  event.returnValue = store.get(value);
});

ipcMain.on('store-set', (_event, key, value) => {
  store.set(key, value);
});

ipcMain.on('store-delete', (_event, key) => {
  store.delete(key);
});
// #endregion

// #region Badge
ipcMain.on('update-badge', (_event, badgeInfo: number | BadgeInfo | null) => {
  const mainWindow = getMainWindow();

  if (process.platform === 'darwin' || process.platform === 'linux') {
    app.setBadgeCount(badgeInfo as number);

    if (badgeInfo === 0 || badgeInfo === null) app.setBadgeCount(0);
    return;
  }

  if (badgeInfo === null) {
    mainWindow?.setOverlayIcon(null, '');
    return;
  }

  //TODO: migrate this into separate assets folder in main
  const badgeImagePath = join(app.getAppPath(), `packages/renderer/assets/${(badgeInfo as BadgeInfo).badgePath}`);
  const badgeImage = nativeImage.createFromPath(badgeImagePath);
  mainWindow?.setOverlayIcon(badgeImage, (badgeInfo as BadgeInfo).description);
});
// #endregion

// #region fs
ipcMain.on('fs-write-file-sync', async (_event, filePath: string, data: string) => {
  writeFileSync(filePath, data);
});

ipcMain.on('fs-read-file-sync', async (event, filePath: string, encoding?: EncodingOption) => {
  event.returnValue = readFileSync(filePath, encoding);
});

ipcMain.on('fs-exists-sync', async (event, filePath: string) => {
  event.returnValue = existsSync(filePath);
});

ipcMain.on('fs-unlink-sync', async (_event, filePath: string) => {
  unlinkSync(filePath);
});
// #endregion

// #region Message Box
ipcMain.handle('show-message-box', (_event, options: MessageBoxOptions) => {
  return dialog.showMessageBox(options);
});
// #endregion

// #region Data
ipcMain.handle('save-data', (_event, scope: string, stringifiedData: string) => {
  saveData(scope, stringifiedData);
});

ipcMain.handle('load-data', (_event, scope: 'user' | 'tasks' | 'all') => {
  return loadData(scope);
});

ipcMain.handle('delete-account-data', () => {
  return deleteAccountData();
});
// #endregion

// #region Paths
ipcMain.on('get-user-path', (event) => {
  event.returnValue = app.getPath('userData');
});

ipcMain.on('path-basename', (event, pathString: string) => {
  event.returnValue = path.basename(pathString);
});
// #endregion

// #region Notification Operations
ipcMain.on('open-task-in-edit-panel', (_event, task) => {
  const mainWindow = getMainWindow();

  mainWindow?.show();
  mainWindow?.webContents.send('open-task-in-edit-panel', task);
});

ipcMain.on('close-notification', (_event, notifId: number) => {
  getMainWindow()?.webContents.send('close-notification', notifId);
});

ipcMain.on('open-reminder', (_event, taskData: { task: Task; index: number }) => {
  const mainWindow = getMainWindow();

  mainWindow?.show();
  mainWindow?.webContents.send('open-reminder-in-edit-menu', taskData);
});

ipcMain.on('complete-task', (_event, taskData: { task: Task; index: number }) => {
  getMainWindow()?.webContents.send('complete-task', taskData);
});

ipcMain.on('snooze-reminder', (_event, taskData: { task: Task; index: number; time: number; add?: boolean }) => {
  console.log('snooze reminder!!!');

  getMainWindow()?.webContents.send('snooze-reminder', taskData);
});

ipcMain.on('initialize-group-notification', () => {
  getMainWindow()?.webContents.send('initialize-group-notification');
});
// #endregion

// #region Network

ipcMain.handle('has-network-connection', () => {
  return hasNetworkConnection();
});

ipcMain.on('is-saving', (event) => {
  event.returnValue = isSaving();
});

// #endregion

ipcMain.handle('get-background-image', async () => {
  const backgroundFilePath = `${app.getPath('userData')}\\background.jpg`;

  // check if file exists. if not, return undefined
  if (!existsSync(backgroundFilePath)) return undefined;

  const buffer = await readFile(backgroundFilePath);
  const buffString = Buffer.from(buffer).toString('base64');

  return buffString;
});

ipcMain.on('is-platform-windows-or-mac', (event) => {
  event.returnValue = process.platform === 'win32' || process.platform === 'darwin';
});

ipcMain.on('is-platform-windows', (event) => {
  event.returnValue = process.platform === 'win32';
});

ipcMain.on('is-platform-mac', (event) => {
  event.returnValue = process.platform === 'darwin';
});

ipcMain.on('is-platform-linux', (event) => {
  event.returnValue = process.platform === 'linux';
});

ipcMain.on('open-dev-tools', () => {
  getMainWindow()?.webContents.openDevTools();
});

ipcMain.handle('get-page-title', async (_event, url) => {
  const pageTitle = await getPageTitle(url);
  return pageTitle;
});
