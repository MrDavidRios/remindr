import type { CompleteAppData } from "@remindr/shared";
import { AppMode, waitUntil } from "@remindr/shared";
import { ipcMain } from "electron";
import log from "electron-log";
import Store from "electron-store";
import { getApp } from "firebase/app";
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
} from "firebase/firestore";
import { deleteDoc, getDoc, getFirestore, terminate } from "firebase/firestore";
import {
  getStreamsDocRef,
  initializeStreamsDataListener,
  removeStreamsDataListener,
} from "./data/syncStreamsData.js";
import {
  getTaskDocRef,
  initializeTaskDataListener,
  removeTaskDataListener,
  saveTaskData,
} from "./data/syncTaskData.js";
import {
  getUserDocRef,
  initializeUserDataListener,
  removeUserDataListener,
  saveUserData,
} from "./data/syncUserData.js";
import { quitApp, restartAndUpdateApp, restartApp } from "./index.js";
import { getAppMode } from "./utils/appState.js";
import { deleteFirebaseUser, signOutUser } from "./utils/auth.js";
import { getMainWindow } from "./utils/getMainWindow.js";
import { showMessageBox } from "./utils/messagebox.js";
import { throwError } from "./utils/throwError.js";
import { hideWindow } from "./utils/window.js";

const store = new Store();

let firestore: Firestore | undefined;
let restartingFirestore = false;

let saveCalls = 0;
let canQuit = true;

export function getFirestoreInstance() {
  return firestore;
}

async function initializeDataListeners() {
  dataListenersRemoved = false;

  const app = getApp();
  firestore = getFirestore(app);

  initializeStreamsDataListener();
  initializeTaskDataListener();
  initializeUserDataListener();

  log.info("(initializeDataListeners) Initializing data listeners...");
}

let dataListenersRemoved = false;
function removeDataListeners() {
  removeUserDataListener();
  removeTaskDataListener();
  removeStreamsDataListener();

  saveCalls = 0;

  dataListenersRemoved = true;
}

ipcMain.on("dev-remove-data-event-listeners", () => {
  removeDataListeners();
});

ipcMain.handle(
  "restart-firestore",
  async (_event, stringifiedAppData: string) => {
    if (restartingFirestore) return "err: firestore is already restarting";

    if (!firestore) {
      log.error("[restart-firestore]: no firestore instance to restart!");
      return "err: no firestore instance to restart!";
    }

    restartingFirestore = true;

    log.info("[restart-firestore]: stopping firestore instance...");

    // save changes
    await terminate(firestore);

    log.info("[restart-firestore]: firestore instance stopped.");
    log.info("[restart-firestore]: restarting firestore instance...");

    removeDataListeners();

    try {
      await initializeDataListeners();
    } catch (err) {
      log.error(err);

      restartingFirestore = false;

      return `err: ${err}`;
    }

    restartingFirestore = false;

    const appData: CompleteAppData = JSON.parse(stringifiedAppData);

    await saveUserData();
    await saveTaskData(JSON.stringify(appData.taskData.taskList));

    log.info("[restart-firestore]: firestore instance restarted.");
    return "success: firestore instance restarted";
  }
);

// On logged-in event, add account data change listeners and update UID.
ipcMain.on("logged-in", () => initializeDataListeners());

// #region Save call logic
let appAction = "";
function databaseInteractionFinished() {
  if (!canQuit || appAction === "") return;

  switch (appAction) {
    case "quit":
      quitApp();
      break;
    case "restart":
      restartApp();
      break;
    case "restart-and-update":
      restartAndUpdateApp();
      break;
    case "sign-out":
      store.delete("last-uid");

      // When the user signs out, remove snapshot listeners.
      removeDataListeners();
      signOutUser();
      break;
    default:
      throwError(`Invalid action: ${appAction}`);
  }
}

function quitOrRestartPostSaveActions(response = 2) {
  switch (response) {
    // Ok (wait for database interaction to finish)
    case 0:
      hideWindow();
      break;
    // Override (do action anyway)
    case 1:
      canQuit = true;
      databaseInteractionFinished();
      break;
    // Cancel action
    case 2:
    default:
      appAction = "";
      break;
  }
}

// This way, it can handle multiple overlapping calls.
ipcMain.on("action-on-save", async (_event, action) => {
  actionOnSave(action);
});

export async function actionOnSave(action: string) {
  appAction = action;

  if (saveCalls === 0) {
    databaseInteractionFinished();
    return;
  }

  let responseData: { response: number; checkboxChecked: boolean } | undefined;
  switch (action) {
    case "quit":
      responseData = await showMessageBox(
        "Quit when done syncing",
        "Remindr will quit when your tasks are done syncing.",
        "info",
        ["Ok", "Quit anyway", "Cancel"]
      );
      break;
    case "restart":
      responseData = await showMessageBox(
        "Restart when done syncing",
        "Remindr will restart when your tasks are done syncing.",
        "info",
        ["Ok", "Restart anyway", "Cancel"]
      );
      break;
    case "restart-and-update":
      responseData = await showMessageBox(
        "Restart and Update when done syncing",
        "Remindr will restart and update when your tasks are done syncing.",
        "info",
        ["Ok", "Restart anyway", "Cancel"]
      );
      break;
    case "sign-out":
      if (saveCalls <= 0) {
        hideWindow();
        return;
      }

      responseData = await showMessageBox(
        "Sign Out and Restart when done syncing",
        "Remindr will sign out and restart when your tasks are done syncing.",
        "info",
        ["Ok", "Sign out anyway", "Cancel"]
      );
      break;
    default:
      throwError(`action-on-save: invalid action - ${appAction}`);
      return;
  }

  quitOrRestartPostSaveActions(responseData.response);
}

/**
 * Called when the window regains focus (updates the save calls in the renderer process).
 */
export function syncSaveCalls() {
  const appWindow = getMainWindow();
  appWindow?.webContents.send("sync-save-calls", saveCalls);
}

export function addSaveCall() {
  saveCalls++;

  const appWindow = getMainWindow();
  if (getAppMode() === AppMode.Online)
    appWindow?.webContents.send("sync-save-calls", saveCalls);

  canQuit = false;
}

export function removeSaveCall() {
  saveCalls--;

  const appWindow = getMainWindow();
  if (getAppMode() === AppMode.Online)
    appWindow?.webContents.send("sync-save-calls", saveCalls);

  if (saveCalls === 0) {
    databaseInteractionFinished();

    canQuit = true;
  } else canQuit = false;
}
// #endregion

/**
 * A map that associates save call number to its timestamp (time it was made).
 * - save call number: save call idx, where 0 is the first save call made since app start
 */
export const saveCallDurations = new Map<number, number>();
let saveCallsMade = 0;
export const waitUntilFirestoreInitialized = async () => {
  // If firestore hasn't yet been initialized, wait until it is. If a save function has been called, then this means the app
  // knows that it's online and has already called initializeDataListeners.
  if (getAppMode() === AppMode.Online && !firestore)
    await waitUntil(() => firestore !== undefined);
  if (restartingFirestore) await waitUntil(() => !restartingFirestore);
};

export const setRestartFirestoreTimeout = (saveCallIdx: number) => {
  setTimeout(() => {
    if (restartingFirestore) return;

    if (saveCallDurations.has(saveCallIdx)) {
      log.info(
        `(setRestartFirestoreTimeout) save call #${saveCallIdx} took too long to complete. Restarting Firestore...`
      );
      const appWindow = getMainWindow();
      appWindow?.webContents.send("restart-firestore");
    }
  }, 5000);
};

export function initializeSaveCall(): number {
  addSaveCall();
  const saveCallIdx = saveCallsMade;
  saveCallsMade++;
  saveCallDurations.set(saveCallIdx, Date.now());

  return saveCallIdx;
}

// #region Helper Functions
export const isSaving = (): boolean => {
  return saveCalls > 0;
};

export async function documentExists(
  docRef: DocumentReference<DocumentData>
): Promise<{ exists: boolean; docSnapshot?: DocumentSnapshot<DocumentData> }> {
  const docData = await getDoc(docRef);

  if (docData.exists()) return { exists: true, docSnapshot: docData };

  return { exists: false };
}

export async function deleteAccountData(): Promise<void> {
  removeDataListeners();

  addSaveCall();

  // Delete 'reminders' subcollection and then finally delete the user document

  // To delete a subcollection, the 'reminders' document needs to be deleted. Delete the 'reminders' document in the subcollection and THEN the subcollection should automatically be deleted.
  try {
    if (!firestore) {
      throwError("deleteAccountData: Firestore instance does not exist.");
      return;
    }

    await deleteDoc(getTaskDocRef());
    await deleteDoc(getUserDocRef());
    await deleteDoc(getStreamsDocRef());

    // Delete streams document

    // Delete user itself
    await deleteFirebaseUser();
    store.delete("user-profile"); // Remove local user data

    // Mark operation as complete by removing the save call
    removeSaveCall();
  } catch (err) {
    throwError(err as string);
  }
}
// #endregion
