import initializeNotificationScreenListeners from '@main/notifications.js';
import { isHideOnStartupEnabled } from '@main/utils/storeUserData.js';
import { initializeTaskLoop } from '@main/utils/taskLoop.js';
import { app, BrowserWindow } from 'electron';
import Store from 'electron-store';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callSetupFunctions } from './index.js';
import TrayBuilder from './tray.js';
import { getMainWindow } from './utils/getMainWindow.js';

const store = new Store();

async function createWindow() {
  const storedWidth = (store.get('appWidth') as number) || 800;
  const storedHeight = (store.get('appHeight') as number) || 650;

  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    frame: false,
    fullscreenable: false,

    minWidth: 460,
    width: storedWidth,

    minHeight: 660,
    height: storedHeight,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  browserWindow.removeMenu();

  const trayBuilder = new TrayBuilder(browserWindow);
  trayBuilder.buildTray();

  callSetupFunctions(browserWindow);

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    const hiddenOnStartup = process.argv.includes('--hidden');

    // TODO: write e2e test for this function!
    if (hiddenOnStartup && isHideOnStartupEnabled()) {
      browserWindow?.hide();
    } else {
      browserWindow?.show();
    }

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  browserWindow.webContents.once('did-finish-load', () => {
    // This makes sure events are sent to renderer process (and then notification windows) after the main window
    // renderer process is done loading. This way, no information is lost in the events.
    initializeTaskLoop(browserWindow);

    initializeNotificationScreenListeners();
  });

  browserWindow.on('closed', () => {
    if (import.meta.env.PROD) {
      store.delete('task-list-current');
    }

    app.quit();
  });

  /**
   * Load the main page of the main window.
   */
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
    /**
     * Load from the Vite dev server for development.
     */
    await browserWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
  } else {
    /**
     * Load from the local file system for production and test.
     *
     * Use BrowserWindow.loadFile() instead of BrowserWindow.loadURL() for WhatWG URL API limitations
     * when path contains special characters like `#`.
     * Let electron handle the path quirks.
     * @see https://github.com/nodejs/node/issues/12682
     * @see https://github.com/electron/electron/issues/6869
     */
    await browserWindow.loadFile(fileURLToPath(new URL('./../../renderer/dist/index.html', import.meta.url)));
  }

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = getMainWindow();

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
