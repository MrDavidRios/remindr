import {
  AppMode,
  createDefaultSettings,
  ErrorCodes,
  User as RemindrUser,
  Settings,
} from "@remindr/shared";
import log from "electron-log";
import Store from "electron-store";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  onSnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import _ from "lodash";
import {
  documentExists,
  getFirestoreInstance,
  initializeSaveCall,
  removeSaveCall,
  saveCallDurations,
  setRestartFirestoreTimeout,
  waitUntilFirestoreInitialized,
} from "../dataFunctions.js";
import { getAppMode } from "../utils/appState.js";
import { getUserUID } from "../utils/auth.js";
import { getSettingsProfile, getUserProfile } from "../utils/storeUserData.js";
import { throwError } from "../utils/throwError.js";

// TODO: refactor into module
const store = new Store();
let userDataExists = false;
let userDocRef: DocumentReference<DocumentData>;
let userDataListener: Unsubscribe | undefined;
let dataListenerRemoved = false;

let userProfile: RemindrUser = JSON.parse(getUserProfile());
let userDataSyncAmount = 0;

const deviceID = `_${Math.random().toString(36).substring(2, 9)}`;

export async function initializeUserDataListener() {
  const uid = getUserUID();
  const firestore = getFirestoreInstance();

  if (firestore === undefined) {
    log.error("[initialize-streams-data-listener] no firestore instance found");
    return "err: no firestore instance found";
  }

  userDocRef = doc(collection(firestore, "users"), uid);

  const userDocInfo = await documentExists(userDocRef);
  if (userDocInfo.exists) {
    await setDoc(
      userDocRef,
      {
        lastUpdatedFrom: deviceID,
      },
      { merge: true }
    );
  }

  userDataListener = onSnapshot(userDocRef, (docSnapshot) => {
    if (dataListenerRemoved) return;

    const source = docSnapshot.metadata.hasPendingWrites ? "Local" : "Server";
    if (source !== "Server") return;

    userProfile = JSON.parse(getUserProfile());

    userDataSyncAmount++;

    if (userDataSyncAmount === 1) return;

    const loadedUserData = docSnapshot.data();
    if (!loadedUserData) {
      throwError("userDataListener: user data does not exist");
      return;
    }

    const duplicateData = !_.isEqual(
      userProfile.toString(),
      loadedUserData.toString()
    );

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

  log.info("(initializeUserDataListener) initializing user data listener...");
}

export function removeUserDataListener() {
  userDataListener?.();

  dataListenerRemoved = true;
}

async function saveUserDataLocal(settingsProfile: Settings): Promise<void> {
  userProfile.settings = settingsProfile;

  store.set("userData", userProfile);
  store.set("last-offline-data-update-time", new Date());

  log.info("%cUser data saved locally.", "color: green; font-style: bold");
}

async function saveUserDataOnline(
  userProfile: RemindrUser,
  settingsProfile: Settings
): Promise<string | void> {
  if (getFirestoreInstance() === undefined) {
    throwError("(saveUserData) Firestore instance does not exist.");
    return;
  }

  // Convert user data and settings data to objects to dynamically upload to firestore
  const userDataToUpdate = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(userProfile)) {
    if (key !== "settings") {
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
    await updateDoc(userDocRef, {
      userData: userDataToUpdate,
      settings: settingsToUpdate,
      lastUpdatedFrom: deviceID,
    });

    log.info("%cUser data saved.", "color: green; font-style: bold");
  } else {
    await setDoc(userDocRef, {
      userData: userDataToUpdate,
      settings: settingsToUpdate,
    });

    userDataExists = true;

    log.info("%cUser data document created.", "color: green; font-style: bold");
  }
}

export async function saveUserData(): Promise<string | void> {
  await waitUntilFirestoreInitialized();

  const saveCallIdx = initializeSaveCall();
  if (getAppMode() === AppMode.Online) {
    setRestartFirestoreTimeout(saveCallIdx);
  }

  const userProfile: RemindrUser = JSON.parse(getUserProfile());
  const settingsProfile: Settings = JSON.parse(getSettingsProfile());

  if (getAppMode() !== AppMode.Online) {
    await saveUserDataLocal(settingsProfile);
  } else {
    await saveUserDataOnline(userProfile, settingsProfile);
  }

  saveCallDurations.delete(saveCallIdx);
  removeSaveCall();
}

async function loadUserDataLocal(): Promise<RemindrUser> {
  return (
    (store.get("userData") as RemindrUser) ?? new RemindrUser().getDefault()
  );
}

async function loadUserDataOnline(): Promise<RemindrUser | string> {
  const userData = new RemindrUser();

  if (getFirestoreInstance() === undefined) {
    throwError("(loadUserData) Firestore instance does not exist.");
    return "";
  }

  const docData = await documentExists(userDocRef);

  if (!userData) {
    throwError("(loadUserData) Local user data does not exist.");
    return "";
  }

  if (!docData.exists || !docData.docSnapshot) {
    userDataExists = false;
    throwError(
      `(loadUserData) ERR${ErrorCodes.MISSING_USER_DATA_FIRESTORE}: User data file does not exist.`
    );
    return "";
  }

  userDataExists = true;

  const data = docData.docSnapshot.data();

  // Loop through every variable. If the variable is undefined, then set it to the current value stored in settings.
  userData.settings = createDefaultSettings();

  if (data?.settings !== undefined) {
    Object.keys(data?.settings).forEach((key) => {
      if (data.settings[key] !== undefined)
        (userData.settings[key as keyof Settings] as any) = data.settings[key];
    });
  }

  if (data?.userData !== undefined)
    Object?.keys(data?.userData).forEach((key) => {
      if (data.userData === undefined) {
        if (data[key] !== undefined)
          (userData[key as keyof RemindrUser] as any) = data[key];
      } else if (data.userData[key] !== undefined) {
        (userData[key as keyof RemindrUser] as any) = data.userData[key];
      } else if (data[key] !== undefined)
        (userData[key as keyof RemindrUser] as any) = data[key];
    });

  return userData;
}

export async function loadUserData(): Promise<RemindrUser | string> {
  await waitUntilFirestoreInitialized();

  log.info("(loadUserData) Loading user data...");

  let loadedUserData: RemindrUser;
  if (getAppMode() !== AppMode.Online) {
    loadedUserData = await loadUserDataLocal();
  } else {
    const onlineLoadResult = await loadUserDataOnline();
    const errorMessage =
      typeof onlineLoadResult === "string" ? onlineLoadResult : undefined;

    if (errorMessage !== undefined) return errorMessage;

    loadedUserData = onlineLoadResult as RemindrUser;
  }

  log.info("(loadData) User data loaded.");

  return loadedUserData;
}

export function getUserDocRef() {
  return userDocRef;
}
