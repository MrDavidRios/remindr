/**
 * @module preload
 */

import type { Settings } from '@remindr/shared/src/types';
import type { IpcRendererEvent, MessageBoxOptions, OpenDialogOptions } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import type { AppMode } from '../../shared/src/types/classes/appMode.js';
import type { Channels } from './channels.js';

const DEBUG_IPC_RENDERER = true;
const devHandler = {
  removeDataEventListeners: () => {
    ipcRenderer.send('dev-remove-data-event-listeners');
  },
};

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => {
        if (DEBUG_IPC_RENDERER) console.log('ipcRenderer:', channel, args);
        return func(...args);
      };

      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  remote: {
    isPackaged: () => {
      return ipcRenderer.sendSync('is-packaged');
    },
    isDebug: () => {
      return ipcRenderer.sendSync('is-debug');
    },
    openDevTools: () => {
      return ipcRenderer.sendSync('open-dev-tools');
    },
  },
  shell: {
    openExternal: (url: string) => {
      ipcRenderer.send('open-external', url);
    },
    showInFolder: (url: string) => {
      ipcRenderer.send('show-in-folder', url);
    },
    getPageTitle: (url: string): Promise<string> => {
      return ipcRenderer.invoke('get-page-title', url);
    },
  },
  theme: {
    getSystemTheme(): string {
      return ipcRenderer.sendSync('get-system-theme');
    },
  },
  process: {
    isWindowsOrMac(): boolean {
      return ipcRenderer.sendSync('is-platform-windows-or-mac');
    },
    isWindows(): boolean {
      return ipcRenderer.sendSync('is-platform-windows');
    },
    isMac(): boolean {
      return ipcRenderer.sendSync('is-platform-mac');
    },
    isLinux(): boolean {
      return ipcRenderer.sendSync('is-platform-linux');
    },
  },
  path: {
    basename(path: string): string {
      return ipcRenderer.sendSync('path-basename', path);
    },
  },
};

const mainWindowHandler = {
  webContents: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send('send-to-main-window', { channel, ...args });
    },
  },
  minimize() {
    ipcRenderer.send('minimize-window');
  },
  maximize() {
    ipcRenderer.send('maximize-window');
  },
  unmaximize() {
    ipcRenderer.send('unmaximize-window');
  },
  hide() {
    ipcRenderer.send('hide-window');
  },
  show() {
    ipcRenderer.send('show-window');
  },
  getWidth(): number {
    return ipcRenderer.sendSync('get-window-width');
  },
  getHeight(): number {
    return ipcRenderer.sendSync('get-window-height');
  },
  openDevTools() {
    return ipcRenderer.sendSync('open-dev-tools');
  },
};

const storeHandler = {
  set(key: string, value: unknown) {
    ipcRenderer.send('store-set', key, value);
  },
  get(key: string) {
    return ipcRenderer.sendSync('store-get', key);
  },
  delete(key: string) {
    ipcRenderer.send('store-delete', key);
  },
};

const dialogHandler = {
  showOpenDialog(options: OpenDialogOptions): Promise<{ canceled: boolean; filePaths: string[] }> {
    return ipcRenderer.invoke('show-open-dialog', options);
  },
  /** Returns the index of the clicked button. */
  showMessageDialog(options: MessageBoxOptions): Promise<number> {
    return ipcRenderer.invoke('show-message-box', options);
  },
};

const fsHandler = {
  writeFileSync(path: string, data: string) {
    ipcRenderer.send('fs-write-file-sync', path, data);
  },

  readFileSync(path: string, encoding?: string) {
    return ipcRenderer.sendSync('fs-read-file-sync', path, encoding);
  },

  existsSync(path: string): boolean {
    return ipcRenderer.sendSync('fs-exists-sync', path);
  },

  unlinkSync(path: string) {
    return ipcRenderer.send('fs-unlink-sync', path);
  },
};

const firebaseHandler = {
  auth: {
    createUserWithEmailAndPassword: async (email: string, password: string): Promise<string> => {
      // create auth instance in main to pass in the actual firebase function
      return ipcRenderer.invoke('create-user', email, password);
    },
    reauthenticateWithCredential: (email: string, password: string): Promise<unknown> => {
      return ipcRenderer.invoke('reauthenticate-user', email, password);
    },
    resetPassword: (email: string): Promise<boolean | Error> => {
      return ipcRenderer.invoke('reset-password', email);
    },
    sendEmailVerification: (): Promise<boolean | string> => {
      return ipcRenderer.invoke('send-email-verification');
    },
    sendPasswordResetEmail: (email: string): Promise<boolean | string> => {
      return ipcRenderer.invoke('send-password-reset-email', email);
    },
    signInWithEmailAndPassword: (email: string, password: string): Promise<boolean | Error> => {
      return ipcRenderer.invoke('sign-in-user', email, password);
    },
    signOutUser(): Promise<void> {
      return ipcRenderer.invoke('sign-out-user');
    },
    getEmail: (): string | undefined => {
      return ipcRenderer.sendSync('get-user-email');
    },
    updateEmail: (newEmail: string): Promise<boolean | string> => {
      return ipcRenderer.invoke('update-user-email', newEmail);
    },
    updateUserFromStorage(): Promise<boolean | string> {
      return ipcRenderer.invoke('update-user-from-storage');
    },
    authCredentialExists(): boolean {
      return ipcRenderer.sendSync('auth-credential-exists');
    },
    deleteAuthCredential() {
      return ipcRenderer.invoke('delete-auth-credential');
    },
    deleteFirebaseUser() {
      ipcRenderer.send('delete-firebase-user');
    },
    currentlySignedIn(): boolean {
      return ipcRenderer.sendSync('check-if-user-signed-in');
    },
    emailVerified(): boolean | string {
      return ipcRenderer.sendSync('check-if-user-email-verified');
    },
    getUID(): string | undefined {
      return ipcRenderer.sendSync('get-user-uid');
    },
    getCurrentUser(): string | undefined {
      return ipcRenderer.sendSync('get-current-user');
    },
  },
};

const dataHandler = {
  saveUserData: () => {
    return ipcRenderer.invoke('save-user-data');
  },
  saveTaskData: (stringifiedTaskList: string) => {
    return ipcRenderer.invoke('save-task-data', stringifiedTaskList);
  },
  loadUserData: () => {
    return ipcRenderer.invoke('load-user-data');
  },
  loadTaskData: () => {
    return ipcRenderer.invoke('load-task-data');
  },
  deleteAccountData: () => {
    return ipcRenderer.invoke('delete-account-data');
  },
  getUserPath: () => {
    return ipcRenderer.sendSync('get-user-path');
  },
  getBackgroundImage: (): Promise<string> => {
    return ipcRenderer.invoke('get-background-image');
  },
  isSaving: (): boolean => {
    return ipcRenderer.sendSync('is-saving');
  },
  restartFirestore: (completeAppData: string): Promise<string> => {
    return ipcRenderer.invoke('restart-firestore', completeAppData);
  },
};

/**
 * Object containing methods to handle the application state.
 */
const appStateHandler = {
  /**
   * Updates the app mode value stored in main.
   */
  syncAppMode: (mode: AppMode) => {
    ipcRenderer.invoke('sync-app-mode', mode);
  },

  /**
   * Checks if the user has internet access.
   * @returns A promise that resolves to a boolean value indicating whether the user's device has internet connection.
   */
  hasNetworkConnection: (): Promise<boolean> => {
    return ipcRenderer.invoke('has-network-connection');
  },

  getVersion: (): string => {
    return ipcRenderer.sendSync('get-version');
  },
};

const userStateHandler = {
  setUserProfile: (stringifiedUser: string) => {
    ipcRenderer.invoke('set-user-profile', stringifiedUser);
  },
  getUserProfile: (): string => {
    return ipcRenderer.sendSync('get-user-profile');
  },
  /**
   * Saves the user's settings locally.
   * @param settings
   */
  saveSettings: (settings: Settings) => {
    ipcRenderer.invoke('set-settings-profile', JSON.stringify(settings));
  },
  /**
   * Loads the user's settings from disk.
   */
  loadSettings: (): Settings | undefined => {
    const stringifiedLoadedSettings: string = ipcRenderer.sendSync('get-settings-profile');
    const loadedSettings = JSON.parse(stringifiedLoadedSettings);

    // If there are no settings, return undefined
    if (Object.keys(loadedSettings).length === 0) return undefined;

    return loadedSettings;
  },
};

const notificationHandler = {
  notify: (stringifiedTask: string, scheduledReminderIdx: number) => {
    ipcRenderer.send('notify', stringifiedTask, scheduledReminderIdx);
  },
};

contextBridge.exposeInMainWorld('dev', devHandler);
contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('mainWindow', mainWindowHandler);
contextBridge.exposeInMainWorld('store', storeHandler);
contextBridge.exposeInMainWorld('dialog', dialogHandler);
contextBridge.exposeInMainWorld('fs', fsHandler);
contextBridge.exposeInMainWorld('firebase', firebaseHandler);
contextBridge.exposeInMainWorld('data', dataHandler);
contextBridge.exposeInMainWorld('appState', appStateHandler);
contextBridge.exposeInMainWorld('userState', userStateHandler);
contextBridge.exposeInMainWorld('notifications', notificationHandler);

export type DevHandler = typeof devHandler;
export type ElectronHandler = typeof electronHandler;
export type MainWindowHandler = typeof mainWindowHandler;
export type StoreHandler = typeof storeHandler;
export type DialogHandler = typeof dialogHandler;
export type FsHandler = typeof fsHandler;
export type FirebaseHandler = typeof firebaseHandler;
export type DataHandler = typeof dataHandler;
export type AppStateHandler = typeof appStateHandler;
export type UserStateHandler = typeof userStateHandler;
export type NotificationHandler = typeof notificationHandler;
