import { ipcMain } from 'electron';
import { getMainWindow } from './getMainWindow.js';

/**
 * Sets up window event listeners (e.g. minimize, maximize, close, hide, show, etc.)
 * @param mainWindow
 */
export default function initWindowEventListeners() {
  const mainWindow = getMainWindow();

  mainWindow?.on('minimize', () => {
    mainWindow?.getChildWindows().forEach((notification) => {
      notification.show();
    });
  });

  ipcMain.on('send-to-main-window', async (_event, arg) => {
    const { channel, ...args } = arg;
    mainWindow?.webContents.send(channel, args);
  });

  mainWindow?.on('maximize', () => mainWindow?.webContents.send('window-maximized'));
  mainWindow?.on('unmaximize', () => mainWindow?.webContents.send('window-unmaximized'));
  ipcMain.on('minimize-window', () => mainWindow?.minimize());
  ipcMain.on('maximize-window', () => mainWindow?.maximize());
  ipcMain.on('unmaximize-window', () => mainWindow?.unmaximize());

  ipcMain.on('hide-window', hideWindow);

  ipcMain.on('show-window', showWindow);

  ipcMain.on('get-window-width', (event) => {
    event.returnValue = mainWindow?.getBounds().width;
  });

  ipcMain.on('get-window-height', (event) => {
    event.returnValue = mainWindow?.getBounds().height;
  });
}

export function hideWindow() {
  const mainWindow = getMainWindow();

  mainWindow?.hide();
  mainWindow?.webContents.send('window-hidden');
}

function showWindow() {
  const mainWindow = getMainWindow();

  mainWindow?.show();
  mainWindow?.webContents.send('window-shown');
}
