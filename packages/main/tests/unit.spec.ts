import { BrowserWindow, Menu, Tray } from 'electron';
import type { MockedClass, MockedObject } from 'vitest';
import { expect, test, vi } from 'vitest';
import { restoreOrCreateWindow } from '../src/mainWindow.js';

/**
 * Mock real electron BrowserWindow API
 */
vi.mock('electron', () => {
  // Use "as unknown as" because vi.fn() does not have static methods
  const bw = vi.fn() as unknown as MockedClass<typeof BrowserWindow>;
  bw.getAllWindows = vi.fn(() => bw.mock.instances);
  bw.prototype.loadURL = vi.fn((_: string, __?: Electron.LoadURLOptions) => Promise.resolve());
  bw.prototype.loadFile = vi.fn((_: string, __?: Electron.LoadFileOptions) => Promise.resolve());
  bw.prototype.on = vi.fn<never>();
  bw.prototype.destroy = vi.fn();
  bw.prototype.isDestroyed = vi.fn();
  bw.prototype.isMinimized = vi.fn();
  bw.prototype.focus = vi.fn();
  bw.prototype.restore = vi.fn();
  bw.prototype.removeMenu = vi.fn();

  Object.defineProperty(bw.prototype, 'webContents', {
    value: { once: vi.fn(), send: vi.fn() },
  });

  const app = vi.fn() as unknown as Electron.App;
  app.on = vi.fn();
  app.quit = vi.fn();
  app.getAppPath = vi.fn(() => '');
  // Keeping this true helps us avoid dealing with mocking process.exit
  app.requestSingleInstanceLock = vi.fn(() => true);
  app.disableHardwareAcceleration = vi.fn();
  app.whenReady = vi.fn(() => Promise.resolve());
  app.setLoginItemSettings = vi.fn();

  const nativeTheme = vi.fn() as unknown as Electron.NativeTheme;
  nativeTheme.on = vi.fn();

  const ipcMain: Pick<Electron.IpcMain, 'on' | 'handle'> = {
    on: vi.fn(),
    handle: vi.fn(),
  };

  const menu = vi.fn() as unknown as MockedClass<typeof Menu>;
  menu.buildFromTemplate = vi.fn();

  const tray = vi.fn() as unknown as MockedClass<typeof Tray>;
  tray.prototype.setToolTip = vi.fn();
  tray.prototype.setContextMenu = vi.fn();
  tray.prototype.setIgnoreDoubleClickEvents = vi.fn();
  tray.prototype.on = vi.fn<never>();

  return { BrowserWindow: bw, Menu: menu, Tray: tray, app, ipcMain, nativeTheme };
});

vi.mock('@main/appUpdater', () => {
  return {
    initAutoUpdaterEventHandlers: vi.fn(),
  };
});

vi.mock('electron-store', () => {
  return {
    default: vi.fn(() => {
      return {
        get: vi.fn(() => {}),
        set: vi.fn(() => {}),
        delete: vi.fn(() => {}),
      };
    }),
  };
});

vi.mock('electron-updater', () => {
  return {
    default: {
      checkForUpdatesAndNotify: vi.fn(),
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    },
  };
});

test('Should create a new window', async () => {
  const { mock } = vi.mocked(BrowserWindow);
  expect(mock.instances).toHaveLength(0);

  await restoreOrCreateWindow();
  expect(mock.instances).toHaveLength(1);
  const instance = mock.instances[0] as MockedObject<BrowserWindow>;
  const loadURLCalls = instance.loadURL.mock.calls.length;
  const loadFileCalls = instance.loadFile.mock.calls.length;
  expect(loadURLCalls + loadFileCalls).toBe(1);
  if (loadURLCalls === 1) {
    expect(instance.loadURL).toHaveBeenCalledWith(expect.stringMatching(/index\.html$/));
  } else {
    expect(instance.loadFile).toHaveBeenCalledWith(expect.stringMatching(/index\.html$/));
  }
});

test('Should restore an existing window', async () => {
  const { mock } = vi.mocked(BrowserWindow);

  // Create a window and minimize it.
  await restoreOrCreateWindow();
  expect(mock.instances).toHaveLength(1);
  const appWindow = vi.mocked(mock.instances[0]);
  appWindow.isMinimized.mockReturnValueOnce(true);

  await restoreOrCreateWindow();
  expect(mock.instances).toHaveLength(1);
  expect(appWindow.restore).toHaveBeenCalledOnce();
});

test('Should create a new window if the previous one was destroyed', async () => {
  const { mock } = vi.mocked(BrowserWindow);

  // Create a window and destroy it.
  await restoreOrCreateWindow();
  expect(mock.instances).toHaveLength(1);
  const appWindow = vi.mocked(mock.instances[0]);
  appWindow.isDestroyed.mockReturnValueOnce(true);

  await restoreOrCreateWindow();
  expect(mock.instances).toHaveLength(2);
});
