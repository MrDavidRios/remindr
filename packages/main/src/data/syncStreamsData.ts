import { AppMode, serializeStream, Stream } from "@remindr/shared";
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

let streamsDataExists = false;
let streamsDocRef: DocumentReference<DocumentData>;
let streamsDataListener: Unsubscribe | undefined;
let dataListenerRemoved = false;

export function initializeStreamsDataListener() {
  const uid = getUserUID();
  const firestore = getFirestoreInstance();

  if (firestore === undefined) {
    log.error("[initialize-streams-data-listener] no firestore instance found");
    return "err: no firestore instance found";
  }

  log.info(
    "(initializeStreamsDataListener) initializing streams data listener..."
  );

  streamsDocRef = doc(firestore, `users/${uid}/streams/streams`);

  streamsDataListener = onSnapshot(streamsDocRef, (docSnapshot) => {
    if (dataListenerRemoved) return;

    const loadedStreamsData = docSnapshot.data();
    // if the loaded streams data doesn't exist, an account is likely being created
    if (!loadedStreamsData) return;

    const source = docSnapshot.metadata.hasPendingWrites ? "Local" : "Server";
    if (source !== "Server") return;

    const appWindow = getMainWindow();
    appWindow?.webContents.send("server-stream-list-update", loadedStreamsData);
  });
}

export function removeStreamsDataListener() {
  streamsDataListener?.();

  dataListenerRemoved = true;
}

async function saveStreamsDataLocal(streamListCopy: Stream[]) {
  store.set("streams", streamListCopy);
  log.info("(saveStreamsData) Streams data saved locally.");
}

async function saveStreamsDataOnline(streamListCopy: Stream[]) {
  if (getFirestoreInstance() === undefined) {
    throwError("(saveStreamsData) Firestore instance does not exist.");
    return;
  }

  const serializedStreamList = streamListCopy.map(serializeStream);

  if (streamsDataExists) {
    // If streams doc exists, update it
    await updateDoc(streamsDocRef, {
      streams: serializedStreamList,
    });

    log.info("(saveStreamsData) Streams data saved.");
  } else {
    // If streams doc doesn't exist, create it
    await setDoc(streamsDocRef, {
      streams: serializedStreamList,
    });

    log.info("(saveStreamsData) Streams doc created.");
  }
}

export async function saveStreamsData(
  stringifiedStreamList: string
): Promise<string | void> {
  if (!stringifiedStreamList) {
    throwError("(saveStreamsData) no stream list provided.");
    return;
  }

  await waitUntilFirestoreInitialized();

  const saveCallIdx = initializeSaveCall();
  if (getAppMode() === AppMode.Online) {
    setRestartFirestoreTimeout(saveCallIdx);
  }

  const streamListCopy = JSON.parse(stringifiedStreamList) as Stream[];

  if (getAppMode() !== AppMode.Online) {
    await saveStreamsDataLocal(streamListCopy);
  } else {
    await saveStreamsDataOnline(streamListCopy);
  }

  saveCallDurations.delete(saveCallIdx);
  removeSaveCall();
}

async function loadStreamsDataLocal(): Promise<Stream[]> {
  const streamsList = (store.get("streamList") as Stream[]) ?? [];
  return streamsList;
}

async function loadStreamsDataOnline(): Promise<Stream[] | string> {
  if (getFirestoreInstance() === undefined) {
    throwError("(loadStreamsData) Firestore instance does not exist.");
    return "";
  }

  const docData = await documentExists(streamsDocRef);
  if (!docData.exists || !docData.docSnapshot) {
    streamsDataExists = false;

    // if task data doesn't exist, try to create a new document with an empty task list.
    await saveStreamsData(JSON.stringify([]));

    return loadStreamsData();
  }

  streamsDataExists = true;

  const loadedStreamList = docData.docSnapshot.data()!.streams;
  const instantiatedStreamList: Stream[] = [];

  for (const stream of loadedStreamList) {
    instantiatedStreamList.push(stream);
  }

  return instantiatedStreamList;
}

export async function loadStreamsData(): Promise<Stream[] | string> {
  await waitUntilFirestoreInitialized();

  log.info("(loadStreamsData) Loading streams data...");

  if (getAppMode() !== AppMode.Online) {
    return await loadStreamsDataLocal();
  } else {
    return await loadStreamsDataOnline();
  }
}

export function getStreamsDocRef() {
  return streamsDocRef;
}
