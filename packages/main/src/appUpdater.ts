import { ipcMain } from 'electron';
import log from 'electron-log';
import type { UpdateDownloadedEvent } from 'electron-updater';
import updater from 'electron-updater';
import { getMainWindow } from './utils/getMainWindow.js';
import { isAutoUpdateEnabled } from './utils/storeUserData.js';

const { autoUpdater } = updater;

export const initAutoUpdaterEventHandlers = () => {
  console.log('initializing auto updater event handlers...');

  log.transports.file.level = 'info';
  autoUpdater.logger = log;

  // If auto update is not defined in settings, treat it as enabled by default
  if (isAutoUpdateEnabled() ?? true) autoUpdater.checkForUpdates();

  autoUpdater.addListener('checking-for-update', () => {
    getMainWindow()?.webContents.send('checking-for-update');
  });

  autoUpdater.addListener('update-available', () => {
    getMainWindow()?.webContents.send('update-available');
  });

  autoUpdater.addListener('update-not-available', () => {
    getMainWindow()?.webContents.send('update-not-available');
  });

  // Once downloaded, the program will update.
  autoUpdater.addListener('update-downloaded', (info: UpdateDownloadedEvent) => {
    getMainWindow()?.webContents.send('update-downloaded', info.releaseName);
    autoUpdater.logger!.info('update-downloaded');
    autoUpdater.logger!.info(info);
  });

  ipcMain.on('check-for-updates', () => {
    log.info('checking for updates...');

    autoUpdater.checkForUpdates();
  });
};
