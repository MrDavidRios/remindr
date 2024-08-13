import type { CompleteAppData, Settings, Task } from '@remindr/shared';
import { AppMode, User as RemindrUser, TaskCollection, createDefaultSettings } from '@remindr/shared';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';
import { getApp } from 'firebase/app';
import type { DocumentData, DocumentReference, DocumentSnapshot, Firestore, Unsubscribe } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  terminate,
  updateDoc,
} from 'firebase/firestore';
import _ from 'lodash';
import { quitApp, restartAndUpdateApp, restartApp } from './index.js';
import { getAppMode } from './utils/appState.js';
import { deleteFirebaseUser, getUserUID, signOutUser } from './utils/auth.js';
import showMessageBox from './utils/messagebox.js';
import { getSettingsProfile, getUserProfile } from './utils/storeUserData.js';
import { waitUntil } from './utils/timing.js';
import { hideWindow } from './utils/window.js';

const store = new Store();

let firestore: Firestore | undefined;
let restartingFirestore = false;

let taskDocRef: DocumentReference<DocumentData>;
let userDocRef: DocumentReference<DocumentData>;

let mainWindow: BrowserWindow | undefined;

let saveCalls = 0;
let canQuit = true;

let userDataExists = false;
let taskDataExists = false;

const deviceID = `_${Math.random().toString(36).substring(2, 9)}`;

// #region Data Listeners
let userDataListener: Unsubscribe | undefined;
let taskDataListener: Unsubscribe | undefined;

/**
 * Populated the main window variable in the data functions script.
 * @param window
 */
export function setMainWindowForDataFunctions(window: BrowserWindow) {
  mainWindow = window;
}

async function initializeDataListeners() {
  dataListenersRemoved = false;

  const app = getApp();
  firestore = getFirestore(app);

  const uid = getUserUID();

  taskDocRef = doc(firestore, `users/${uid}/reminders/reminders`);
  userDocRef = doc(collection(firestore, 'users'), uid);

  // #region User Info
  const userDocInfo = await documentExists(userDocRef);
  if (userDocInfo.exists) {
    await setDoc(
      userDocRef,
      {
        lastUpdatedFrom: deviceID,
      },
      { merge: true },
    );
  }

  let userProfile: RemindrUser = JSON.parse(getUserProfile());
  let userDataSyncAmount = 0;

  log.info('Initializing data listeners...');
  userDataListener = onSnapshot(userDocRef, (docSnapshot) => {
    if (dataListenersRemoved) return;

    const source = docSnapshot.metadata.hasPendingWrites ? 'Local' : 'Server';
    if (source !== 'Server') return;

    userProfile = JSON.parse(getUserProfile());

    userDataSyncAmount++;

    if (userDataSyncAmount === 1) return;

    const loadedUserData = docSnapshot.data();
    if (!loadedUserData) throw new Error('userDataListener: user data does not exist');

    const duplicateData = !_.isEqual(userProfile.toString(), loadedUserData.toString());

    if (!duplicateData) {
      // Loop through each userdata property and set the userProfile value to that value.
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(loadedUserData)) {
        if (key !== undefined && value !== undefined) {
          userProfile[key as keyof RemindrUser] = value;
        }
      }
    }
  });

  taskDataListener = onSnapshot(taskDocRef, (docSnapshot) => {
    if (dataListenersRemoved) return;

    const loadedTaskData = docSnapshot.data();
    // if the loaded task data doesn't exist, an account is likely being created
    if (!loadedTaskData) return;

    const source = docSnapshot.metadata.hasPendingWrites ? 'Local' : 'Server';
    if (source !== 'Server') return;

    const appWindow = mainWindow ?? BrowserWindow.getFocusedWindow();
    appWindow?.webContents.send('server-task-list-update', loadedTaskData);
  });
}

let dataListenersRemoved = false;
function removeDataListeners() {
  if (userDataListener) userDataListener();
  if (taskDataListener) taskDataListener();

  saveCalls = 0;

  dataListenersRemoved = true;
}

ipcMain.on('dev-remove-data-event-listeners', () => {
  removeDataListeners();
});

ipcMain.handle('restart-firestore', async (_event, stringifiedAppData: string) => {
  if (restartingFirestore) return 'err: firestore is already restarting';

  if (!firestore) {
    log.error('[restart-firestore]: no firestore instance to restart!');
    return 'err: no firestore instance to restart!';
  }

  restartingFirestore = true;

  log.info('[restart-firestore]: stopping firestore instance...');

  // save changes
  await terminate(firestore);

  log.info('[restart-firestore]: firestore instance stopped.');
  log.info('[restart-firestore]: restarting firestore instance...');

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

  await saveData('user', JSON.stringify(appData.userData));
  await saveData('tasks', JSON.stringify(appData.taskData));

  log.info('[restart-firestore]: firestore instance restarted.');
  return 'sucess: firestore instance restarted';
});

// On logged-in event, add account data change listeners and update UID.
ipcMain.on('logged-in', () => initializeDataListeners());

// #endregion

// #region Save call logic
let appAction = '';
function databaseInteractionFinished() {
  if (!canQuit || appAction === '') return;

  switch (appAction) {
    case 'quit':
      quitApp();
      break;
    case 'restart':
      restartApp();
      break;
    case 'restart-and-update':
      restartAndUpdateApp();
      break;
    case 'sign-out':
      store.delete('last-uid');

      // When the user signs out, remove snapshot listeners.
      removeDataListeners();
      signOutUser();
      break;
    default:
      throw new Error(`Invalid action: ${appAction}`);
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
      appAction = '';
      break;
  }
}

// This way, it can handle multiple overlapping calls.
ipcMain.on('action-on-save', async (_event, action) => {
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
    case 'quit':
      responseData = await showMessageBox(
        'Quit when done syncing',
        'Remindr will quit when your tasks are done syncing.',
        'info',
        ['Ok', 'Quit anyway', 'Cancel'],
      );
      break;
    case 'restart':
      responseData = await showMessageBox(
        'Restart when done syncing',
        'Remindr will restart when your tasks are done syncing.',
        'info',
        ['Ok', 'Restart anyway', 'Cancel'],
      );
      break;
    case 'restart-and-update':
      responseData = await showMessageBox(
        'Restart and Update when done syncing',
        'Remindr will restart and update when your tasks are done syncing.',
        'info',
        ['Ok', 'Restart anyway', 'Cancel'],
      );
      break;
    case 'sign-out':
      if (saveCalls <= 0) {
        hideWindow();
        return;
      }

      responseData = await showMessageBox(
        'Sign Out and Restart when done syncing',
        'Remindr will sign out and restart when your tasks are done syncing.',
        'info',
        ['Ok', 'Sign out anyway', 'Cancel'],
      );
      break;
    default:
      throw new Error(`action-on-save: invalid action - ${appAction}`);
  }

  quitOrRestartPostSaveActions(responseData.response);
}

/**
 * Called when the window regains focus (updates the save calls in the renderer process).
 */
export function syncSaveCalls() {
  const appWindow = mainWindow ?? BrowserWindow.getFocusedWindow();
  appWindow?.webContents.send('sync-save-calls', saveCalls);
}

function addSaveCall() {
  saveCalls++;

  const appWindow = mainWindow ?? BrowserWindow.getFocusedWindow();
  if (getAppMode() === AppMode.Online) appWindow?.webContents.send('sync-save-calls', saveCalls);

  canQuit = false;
}

function removeSaveCall() {
  saveCalls--;

  const appWindow = mainWindow ?? BrowserWindow.getFocusedWindow();
  if (getAppMode() === AppMode.Online) appWindow?.webContents.send('sync-save-calls', saveCalls);

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
const saveCallDurations = new Map<number, number>();
let saveCallsMade = 0;
export async function saveData(scope: string, stringifiedReminderList?: string): Promise<string | void> {
  addSaveCall();
  log.info('(saveData) save call added... save calls:', saveCalls);

  const uid = getUserUID();

  // If firestore hasn't yet been initialized, wait until it is. If saveData has been called, then this means the app
  // knows that it's online and has already called initializeDataListeners.
  const isOnline = getAppMode() === AppMode.Online;
  if (isOnline && !firestore) await waitUntil(() => firestore !== undefined);
  if (restartingFirestore) await waitUntil(() => !restartingFirestore);

  const saveCallIdx = saveCallsMade;
  saveCallsMade++;

  saveCallDurations.set(saveCallIdx, Date.now());

  if (isOnline) {
    setTimeout(() => {
      if (restartingFirestore) return;

      if (saveCallDurations.has(saveCallIdx)) {
        log.info(`(saveData) save call #${saveCallIdx} took too long to complete. Restarting Firestore...`);
        const appWindow = mainWindow ?? BrowserWindow.getFocusedWindow();
        appWindow?.webContents.send('restart-firestore');
      }
    }, 5000);
  }

  switch (scope) {
    case 'user': {
      const userProfile: RemindrUser = JSON.parse(getUserProfile());
      const settingsProfile: Settings = JSON.parse(getSettingsProfile());

      if (getAppMode() !== AppMode.Online) {
        userProfile.settings = settingsProfile;

        store.set('userData', userProfile);

        store.set('last-offline-data-update-time', new Date());

        log.info('%cUser data saved locally.', 'color: green; font-style: bold');
        break;
      }

      if (!firestore) throw new Error('saveData: Firestore instance does not exist.');

      // Global 'user' class
      const userRef = doc(collection(firestore, 'users'), uid);

      // Convert user data and settings data to objects to dynamically upload to firestore
      const userDataToUpdate = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(userProfile)) {
        if (key !== 'settings') {
          (userDataToUpdate[key as keyof object] as any) = value;
        }
      }

      const settingsToUpdate = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(settingsProfile)) {
        (settingsToUpdate[key as keyof object] as any) = value;
      }

      // Check if user document exists
      if (userDataExists) {
        await updateDoc(userRef, {
          userData: userDataToUpdate,
          settings: settingsToUpdate,
          lastUpdatedFrom: deviceID,
        });

        log.info('%cUser data saved.', 'color: green; font-style: bold');
      } else {
        await setDoc(userRef, {
          userData: userDataToUpdate,
          settings: settingsToUpdate,
        });

        userDataExists = true;

        log.info('%cUser data document created.', 'color: green; font-style: bold');
      }
      break;
    }
    case 'tasks':
      {
        if (!stringifiedReminderList) {
          throw new Error('saveData - reminders: reminderList is undefined.');
        }

        // Expecting a 'ReminderCollection' class
        const reminderListCopy = JSON.parse(stringifiedReminderList) as Task[];

        if (getAppMode() !== AppMode.Online) {
          store.set('reminders', reminderListCopy);
          log.info('%cTask data saved locally.', 'color: green; font-style: bold');
          break;
        }

        if (!firestore) throw new Error('saveData: Firestore instance does not exist.');

        Object.keys(reminderListCopy).forEach((reminder: any) => {
          // Get each reminder
          Object.keys(reminderListCopy[reminder]).forEach((key) => {
            if (key === 'scheduledTime') {
              if (reminderListCopy[reminder][key as keyof Task] === undefined)
                (reminderListCopy[reminder][key as keyof Task] as any) = null;
            }

            if (key === 'scheduledReminders' || key === 'subtasks') {
              // Convert the scheduledReminders object to a default js object for firestore to handle
              (reminderListCopy[reminder][key as keyof Task] as any) = reminderListCopy[reminder][key].map(
                (obj: object) => ({
                  ...obj,
                }),
              );
            }
          });
        });

        let newReminderList: Task[] = [];

        // Convert custom objects into js objects for firestore to handle
        if (reminderListCopy.length > 0) newReminderList = reminderListCopy.map((obj) => ({ ...obj }));

        if (taskDataExists) {
          // If reminder file exists, then update it
          await updateDoc(taskDocRef, {
            reminderList: newReminderList,
          });

          log.info('%cTask data saved.', 'color: green; font-style: bold');
        } else {
          // If reminder file doesn't exist, then create it
          await setDoc(taskDocRef, {
            reminderList: newReminderList,
          });

          log.info('%cTask data entry created.', 'color: green; font-style: bold');
        }
      }
      break;
    default:
      throw new Error(`saveData (reminders): Invalid data scope: ${scope}`);
  }

  saveCallDurations.delete(saveCallIdx);

  removeSaveCall();
  log.info('(saveData) save call removed... save calls:', saveCalls);
}

let userData: RemindrUser | undefined;
export async function loadData(
  scope: 'user' | 'tasks' | 'all',
): Promise<string | RemindrUser | TaskCollection | CompleteAppData | void> {
  let taskData: TaskCollection;

  const uid = getUserUID();

  // If firestore hasn't yet been initialized, wait until it is. If saveData has been called, then this means the app
  // knows that it's online and has already called initializeDataListeners.
  if (getAppMode() === AppMode.Online && !firestore) await waitUntil(() => firestore !== undefined);
  if (restartingFirestore) await waitUntil(() => !restartingFirestore);

  switch (scope) {
    case 'user': {
      userData = new RemindrUser();

      log.info('Loading user... app mode:', getAppMode());

      if (getAppMode() !== AppMode.Online) {
        userData = (store.get('userData') as RemindrUser) ?? new RemindrUser().getDefault();

        return userData;
      }

      if (!firestore) throw new Error('loadData: Firestore instance does not exist.');

      const userRef = doc(collection(firestore, 'users'), uid);

      log.info(`%cLoading user data; uid: ${uid}; path: ${userRef.path}`, 'color: grey');

      const docData = await documentExists(userRef);

      if (!userData) {
        throw new Error('loadData (user): Local user data does not exist.');
      }

      if (!docData.exists || !docData.docSnapshot) {
        userDataExists = false;
        throw new Error('ERR001: loadData (user): User data file does not exist.');
      }

      userDataExists = true;

      const data = docData.docSnapshot.data();

      // Loop through every variable. If the variable is undefined, then set it to the current value stored in settings.
      userData.settings = createDefaultSettings();

      if (data?.settings !== undefined) {
        Object.keys(data?.settings).forEach((key) => {
          if (data.settings[key] !== undefined) (userData!.settings[key as keyof Settings] as any) = data.settings[key];
        });
      }

      if (data?.userData !== undefined)
        Object?.keys(data?.userData).forEach((key) => {
          if (data.userData === undefined) {
            if (data[key] !== undefined) (userData![key as keyof RemindrUser] as any) = data[key];
          } else if (data.userData[key] !== undefined) {
            (userData![key as keyof RemindrUser] as any) = data.userData[key];
          } else if (data[key] !== undefined) (userData![key as keyof RemindrUser] as any) = data[key];
        });

      // Load in background image if stored
      log.info('%cUser data loaded.', 'color: green; font-style: bold');

      return userData;
    }
    case 'tasks': {
      if (getAppMode() !== AppMode.Online) {
        taskData = new TaskCollection();
        taskData.taskList = (store.get('reminders') as Task[]) ?? [];

        return taskData;
      }

      if (!firestore) throw new Error('loadData: Firestore instance does not exist.');

      log.info('%cLoading reminders data...', 'color: grey');

      taskData = new TaskCollection();

      const docData = await documentExists(taskDocRef);

      if (!docData.exists || !docData.docSnapshot) {
        taskDataExists = false;

        // if task data doesn't exist, try to creat ea new document with an empty task list.
        await saveData('tasks', JSON.stringify(new TaskCollection()));

        return loadData('tasks');
      }

      taskDataExists = true;

      const loadedTaskList = docData.docSnapshot.data()!.reminderList;

      const instantiatedReminderList: Task[] = [];

      for (let i = 0; i < loadedTaskList.length; i++) {
        const task = loadedTaskList[i];
        instantiatedReminderList.push(task);
      }

      taskData.taskList = instantiatedReminderList;

      return taskData;
    }
    case 'all': {
      [userData, taskData] = await Promise.all([
        loadData('user') as Promise<RemindrUser>,
        loadData('tasks') as Promise<TaskCollection>,
      ]);

      if (userData && taskData) return { userData, taskData };

      throw new Error('loadData (all): unable to load data');
    }
    default:
      throw new Error(`loadData: Invalid data scope: ${scope}`);
  }
}

// #region Helper Functions
export const isSaving = (): boolean => {
  return saveCalls > 0;
};

async function documentExists(
  docRef: DocumentReference<DocumentData>,
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
    if (!firestore) throw new Error('deleteAccountData: Firestore instance does not exist.');

    await deleteDoc(taskDocRef);

    // Delete user document
    await deleteDoc(userDocRef);

    // Delete user itself
    await deleteFirebaseUser();
    store.delete('user-profile'); // Remove local user data

    // Mark operation as complete by removing the save call
    removeSaveCall();
  } catch (err) {
    throw new Error(err as string);
  }
}
// #endregion
