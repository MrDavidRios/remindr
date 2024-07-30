import { AppMode } from '@remindr/shared';
import { app, ipcMain } from 'electron';
import Store from 'electron-store';

const store = new Store();

let appMode: AppMode = store.get('app-mode', AppMode.Online) as AppMode;

/**
 * Initializes listeners that handle app state (e.g. sync app mode, get version)
 */
export function initAppStateListeners() {
  /**
   * Updates the app mode in main, since the app mode is stored/maintained in the Redux store on the renderer.
   */
  ipcMain.handle('sync-app-mode', (_event, updatedAppMode: AppMode) => {
    appMode = updatedAppMode;
  });

  ipcMain.on('get-version', event => {
    event.returnValue = app.getVersion();
  });
}

export function getAppMode(): AppMode {
  return appMode;
}
