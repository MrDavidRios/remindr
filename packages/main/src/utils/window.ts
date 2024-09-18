import { ipcMain, type BrowserWindow } from 'electron';

let globalMainWindow: BrowserWindow | null = null;
/**
 * Sets up window event listeners (e.g. minimize, maximize, close, hide, show, etc.)
 * @param mainWindow
 */
export default function initWindowEventListeners(mainWindow: BrowserWindow | null) {
  globalMainWindow = mainWindow;

  ipcMain.on('send-to-main-window', async (_event, arg) => {
    const { channel, ...args } = arg;
    mainWindow?.webContents.send(channel, args);
  });

  ipcMain.on('minimize-window', () => {
    mainWindow?.minimize();

    mainWindow?.getChildWindows().forEach((notification) => {
      notification.show();
    });
  });

  ipcMain.on('maximize-window', () => {
    mainWindow?.maximize();
    mainWindow?.webContents.send('window-maximized');
  });

  ipcMain.on('unmaximize-window', () => {
    mainWindow?.unmaximize();
    mainWindow?.webContents.send('window-unmaximized');
  });

  ipcMain.on('close-window', () => {
    mainWindow?.close();
    mainWindow?.webContents.send('window-closed');
  });

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
  globalMainWindow?.hide();
  globalMainWindow?.webContents.send('window-hidden');
}

function showWindow() {
  globalMainWindow?.show();
  globalMainWindow?.webContents.send('window-shown');
}
