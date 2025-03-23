import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  Tray,
  ipcMain,
  nativeImage,
} from "electron";
import log from "electron-log";
import { actionOnSave } from "./dataFunctions.js";
import { getMainAssetPath } from "./utils/getMainAssetPath.js";

function buildDefaultTemplate(): MenuItemConstructorOptions[] {
  const trayTemplate = [
    {
      label: "Restart",
      click() {
        actionOnSave("restart");
      },
      accelerator: "CmdOrCtrl+R",
    },
    {
      label: "Quit",
      click() {
        actionOnSave("quit");
      },
      accelerator: "CmdOrCtrl+Q",
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
    log.info("[TrayBuilder] tryna get main asset path");

    const defaultTrayIconPath = getMainAssetPath("tray-icon.png");

    log.info("[TrayBuilder] got main asset path:", defaultTrayIconPath);

    const icon = nativeImage.createFromPath(defaultTrayIconPath);
    const tray = new Tray(icon);

    const template = buildDefaultTemplate();
    const contextMenu = Menu.buildFromTemplate(template);

    log.info("[TrayBuilder] Built tray from template");

    tray.setToolTip("Remindr");
    tray.setContextMenu(contextMenu);
    tray.setIgnoreDoubleClickEvents(true);

    tray.on("click", () => this.mainWindow.show());

    ipcMain.on("update-tray-icon", (_event, badgeNumber) => {
      if (badgeNumber === 0) tray?.setImage(icon);
      else {
        const iconWithAlertBadge = nativeImage.createFromPath(
          getMainAssetPath("alert-overlays/tray-icon-alert.png")
        );
        tray.setImage(iconWithAlertBadge);
      }
    });

    ipcMain.on("update-tray-tooltip", (_e, tooltip) => {
      tray?.setToolTip(tooltip);
    });
  }
}
