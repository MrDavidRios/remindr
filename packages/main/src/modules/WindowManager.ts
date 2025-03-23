import { BrowserWindow } from "electron";
import log from "electron-log";
import Store from "electron-store";
import type { AppInitConfig } from "../AppInitConfig.js";
import type { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import TrayBuilder from "../tray.js";
import { initWindowEventListeners } from "../utils/window.js";
const store = new Store();

class WindowManager implements AppModule {
  readonly #preload: { path: string };
  readonly #renderer: { path: string } | URL;
  readonly #openDevTools;

  constructor({
    initConfig,
    openDevTools = false,
  }: {
    initConfig: AppInitConfig;
    openDevTools?: boolean;
  }) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
  }

  async enable({ app }: ModuleContext): Promise<void> {
    log.info("[WindowManager] Enabling module");

    await app.whenReady();

    log.info("[WindowManager] App is ready");

    await this.restoreOrCreateWindow(true);

    log.info("[WindowManager] Done restoring/creating window");

    app.on("second-instance", () => this.restoreOrCreateWindow(true));
    app.on("activate", () => this.restoreOrCreateWindow(true));
  }

  async createWindow(): Promise<BrowserWindow> {
    const storedWidth = (store.get("appWidth") as number) || 800;
    const storedHeight = (store.get("appHeight") as number) || 650;

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
        preload: this.#preload.path,
      },
    });

    if (this.#renderer instanceof URL) {
      log.info("[WindowManager] Loading URL");
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      log.info("[WindowManager] Loading file");
      await browserWindow.loadFile(this.#renderer.path);
    }

    log.info("[WindowManager] Removing menu");
    browserWindow.removeMenu();

    log.info("[WindowManager] Building tray");
    const trayBuilder = new TrayBuilder(browserWindow);
    trayBuilder.buildTray();

    log.info("[WindowManager] Initializing window event listeners");
    initWindowEventListeners(browserWindow);

    log.info("[WindowManager] Returning browser window");
    return browserWindow;
  }

  async restoreOrCreateWindow(show = false) {
    let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

    log.info("[WindowManager] Starting to restore/create window");

    if (window === undefined) {
      log.info("[WindowManager] Window not found, creating new window");

      window = await this.createWindow();

      log.info("[WindowManager] Window created");
    }

    log.info("[WindowManager] Showing window");

    if (!show) {
      return window;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window?.show();

    if (this.#openDevTools) {
      window?.webContents.openDevTools();
    }

    window.focus();

    return window;
  }
}

export function createWindowManagerModule(
  ...args: ConstructorParameters<typeof WindowManager>
) {
  return new WindowManager(...args);
}
