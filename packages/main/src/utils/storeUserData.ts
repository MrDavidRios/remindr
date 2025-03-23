import { ipcMain } from "electron";
import Store from "electron-store";

const store = new Store();

/**
 * Initializes listeners that handle user data (e.g. get/set user profile, get/set settings profile)
 */
export function initUserDataListeners() {
  console.debug("[storeUserData] Initializing user data listeners");

  ipcMain.handle(
    "set-user-profile",
    (_event, stringifiedUserProfile: string) => {
      store.set("user-profile", stringifiedUserProfile);
    }
  );

  ipcMain.on("get-user-profile", (event) => {
    event.returnValue = getUserProfile();
  });

  ipcMain.handle(
    "set-settings-profile",
    (_event, stringifiedSettings: string) => {
      store.set("settings-profile", stringifiedSettings);
    }
  );

  ipcMain.on("get-settings-profile", (event) => {
    event.returnValue = getSettingsProfile();
  });
}

export function getUserProfile(): string {
  return (store.get("user-profile") as string) ?? JSON.stringify({});
}

export function getSettingsProfile(): string {
  return (store.get("settings-profile") as string) ?? JSON.stringify({});
}

export function isAutoStartupEnabled(): boolean {
  return JSON.parse(getSettingsProfile()).autoStartup;
}

export function isHideOnStartupEnabled(): boolean {
  return JSON.parse(getSettingsProfile()).hideOnStartup;
}

export function isAutoUpdateEnabled(): boolean {
  return JSON.parse(getSettingsProfile()).autoUpdate;
}
