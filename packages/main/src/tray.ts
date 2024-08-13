import { BrowserWindow, Menu, MenuItemConstructorOptions, Tray, ipcMain } from 'electron';
import { actionOnSave } from './dataFunctions.js';
import { getMainAssetPath } from './utils/getMainAssetPath.js';

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

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildTray() {
    const defaultTrayIconPath = getMainAssetPath('tray-icon.png');
    const tray = new Tray(defaultTrayIconPath);

    const template = buildDefaultTemplate();
    const contextMenu = Menu.buildFromTemplate(template);

    tray.setToolTip('Remindr');
    tray.setContextMenu(contextMenu);
    tray.setIgnoreDoubleClickEvents(true);

    tray.on('click', () => this.mainWindow.show());

    ipcMain.on('update-tray-icon', (_event, badgeNumber) => {
      if (badgeNumber === 0) tray?.setImage(defaultTrayIconPath);
      else tray.setImage(getMainAssetPath('alert-overlays/tray-icon-alert.png'));
    });

    ipcMain.on('update-tray-tooltip', (_e, tooltip) => {
      tray?.setToolTip(tooltip);
    });
  }
}
