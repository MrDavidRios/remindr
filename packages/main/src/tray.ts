import { BrowserWindow, Menu, MenuItemConstructorOptions, Tray, ipcMain } from 'electron';
import { actionOnSave } from './dataFunctions.js';

function buildDefaultTemplate(): MenuItemConstructorOptions[] {
  const trayTemplate = [
    {
      label: 'Restart',
      click() {
        actionOnSave('restart');
      },
      accelerator: 'CmdOrCtrl+R',
    },
    {
      label: 'Quit',
      click() {
        actionOnSave('quit');
      },
      accelerator: 'CmdOrCtrl+Q',
    },
  ];

  return trayTemplate;
}

export default class TrayBuilder {
  mainWindow: BrowserWindow;

  rendererAssetsPath: string;

  constructor(mainWindow: BrowserWindow, rendererAssetsPath: string) {
    this.mainWindow = mainWindow;
    this.rendererAssetsPath = rendererAssetsPath;
  }

  buildTray() {
    const tray = new Tray(`${this.rendererAssetsPath}/tray-icon.png`);

    const template = buildDefaultTemplate();
    const contextMenu = Menu.buildFromTemplate(template);

    tray.setToolTip('Remindr');
    tray.setContextMenu(contextMenu);
    tray.setIgnoreDoubleClickEvents(true);

    tray.on('click', () => this.mainWindow.show());

    ipcMain.on('update-tray-icon', (_event, badgeNumber) => {
      if (badgeNumber === 0) tray?.setImage(`${this.rendererAssetsPath}/tray-icon.png`);
      else tray.setImage(`${this.rendererAssetsPath}/icons/alert-overlays/tray-icon-alert.png`);
    });

    ipcMain.on('update-tray-tooltip', (_e, tooltip) => {
      tray?.setToolTip(tooltip);
    });
  }
}
