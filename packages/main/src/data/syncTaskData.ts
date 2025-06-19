import { AppMode, serializeTask, Task, TaskCollection } from "@remindr/shared";
import log from "electron-log";
import Store from "electron-store";
import {
  doc,
  DocumentData,
  DocumentReference,
  onSnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
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
import { getMainWindow } from "../utils/getMainWindow.js";
import { throwError } from "../utils/throwError.js";

// TODO: refactor into module
const store = new Store();

let taskDataExists = false;
let taskDocRef: DocumentReference<DocumentData>;
let taskDataListener: Unsubscribe | undefined;
let dataListenerRemoved = false;

export async function initializeTaskDataListener() {
  const uid = getUserUID();
  const firestore = getFirestoreInstance();

  if (firestore === undefined) {
    log.error("[initialize-streams-data-listener] no firestore instance found");
    return "err: no firestore instance found";
  }

  taskDocRef = doc(firestore, `users/${uid}/reminders/reminders`);

  taskDataListener = onSnapshot(taskDocRef, (docSnapshot) => {
    if (dataListenerRemoved) return;

    const loadedTaskData = docSnapshot.data();
    // if the loaded task data doesn't exist, an account is likely being created
    if (!loadedTaskData) return;

    const source = docSnapshot.metadata.hasPendingWrites ? "Local" : "Server";
    if (source !== "Server") return;

    const appWindow = getMainWindow();
    appWindow?.webContents.send("server-task-list-update", loadedTaskData);
  });

  log.info("(initializeUserDataListener) initializing user data listener...");
}

export function removeTaskDataListener() {
  taskDataListener?.();

  dataListenerRemoved = true;
}

async function saveTaskDataLocal(taskList: Task[]): Promise<void> {
  store.set("reminders", taskList);
  log.info("(saveTaskData) Task data saved locally.");
}

async function saveTaskDataOnline(taskList: Task[]): Promise<string | void> {
  if (getFirestoreInstance() === undefined)
    throwError("(saveTaskData) Firestore instance does not exist.");

  const serializedTaskList = taskList.map(serializeTask);

  if (taskDataExists) {
    // If task file exists, then update it
    await updateDoc(taskDocRef, {
      reminderList: serializedTaskList,
    });

    log.info("(saveTaskData) Task data saved.");
  } else {
    // If task file doesn't exist, then create it
    await setDoc(taskDocRef, {
      reminderList: serializedTaskList,
    });

    log.info("(saveTaskData) Task data entry created.");
  }
}

export async function saveTaskData(
  stringifiedTaskList: string
): Promise<string | void> {
  if (!stringifiedTaskList) {
    throwError("(saveTaskData) no task list provided.");
  }

  await waitUntilFirestoreInitialized();

  const saveCallIdx = initializeSaveCall();
  if (getAppMode() === AppMode.Online) {
    setRestartFirestoreTimeout(saveCallIdx);
  }

  const taskList = JSON.parse(stringifiedTaskList) as Task[];
  let onlineSaveResult: string | void | undefined;
  if (getAppMode() !== AppMode.Online) {
    await saveTaskDataLocal(taskList);
  } else {
    onlineSaveResult = await saveTaskDataOnline(taskList);
  }

  const errorMessage =
    onlineSaveResult !== undefined && typeof onlineSaveResult === "string"
      ? onlineSaveResult
      : undefined;

  saveCallDurations.delete(saveCallIdx);
  removeSaveCall();

  if (errorMessage !== undefined) return errorMessage;
}

async function loadTaskDataLocal(): Promise<TaskCollection> {
  let taskData: TaskCollection;
  taskData = new TaskCollection();
  taskData.taskList = (store.get("reminders") as Task[]) ?? [];

  return taskData;
}

async function loadTaskDataOnline(): Promise<TaskCollection | string> {
  if (getFirestoreInstance() === undefined) {
    throwError("(loadTaskData) Firestore instance does not exist.");
    return "";
  }

  const taskData = new TaskCollection();
  const docData = await documentExists(taskDocRef);

  if (!docData.exists || !docData.docSnapshot) {
    taskDataExists = false;

    // if task data doesn't exist, try to create a new document with an empty task list.
    await saveTaskData(JSON.stringify(new TaskCollection()));

    return loadTaskData();
  }

  taskDataExists = true;

  const loadedTaskList = docData.docSnapshot.data()!.reminderList;
  const instantiatedTaskList: Task[] = [];

  for (const task of loadedTaskList) {
    instantiatedTaskList.push(task);
  }

  taskData.taskList = instantiatedTaskList;
  return taskData;
}

export async function loadTaskData(): Promise<TaskCollection | string> {
  await waitUntilFirestoreInitialized();

  log.info("(loadTaskData) Loading task data...");

  let loadedTaskData: TaskCollection;
  if (getAppMode() !== AppMode.Online) {
    return loadTaskDataLocal();
  } else {
    const onlineLoadResult = await loadTaskDataOnline();
    const errorMessage =
      typeof onlineLoadResult === "string" ? onlineLoadResult : undefined;

    if (errorMessage !== undefined) return errorMessage;

    loadedTaskData = onlineLoadResult as TaskCollection;
  }

  log.info("(loadData) Task data loaded.");

  return loadedTaskData;
}

export function getTaskDocRef() {
  return taskDocRef;
}
