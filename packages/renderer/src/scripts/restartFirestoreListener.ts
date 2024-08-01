import { CompleteAppData, TaskCollection, User } from '@remindr/shared';
import store, { AppDispatch } from '../app/store';
import { setAttemptingToRegainConnection, setConnectionError } from '../features/database/databaseSlice';

/**
 * Possible issue: this event needs to go from main -> renderer -> back to main to work. Will this still work even when the renderer process isn't running? Does it need to?
 */
let listenerInitialized = false;
export function initializeFirestoreRestartEvent(dispatch: AppDispatch) {
  if (listenerInitialized) return;
  listenerInitialized = true;

  window.electron.ipcRenderer.on('restart-firestore', async () => {
    const userData: User | undefined = store.getState().userState.user;
    const taskData: TaskCollection = new TaskCollection(store.getState().taskList.value);
    if (userData === undefined) {
      console.error('[restart-firestore]: no user data exists in state. Unable to restart Firestore.');
      return;
    }

    dispatch(setAttemptingToRegainConnection(true));

    const completeAppData: CompleteAppData = { userData, taskData };
    const firestoreRestartOutput = await window.data.restartFirestore(JSON.stringify(completeAppData));

    dispatch(setAttemptingToRegainConnection(false));

    if (firestoreRestartOutput.includes('err')) {
      dispatch(setConnectionError(true));
      return;
    }

    dispatch(setConnectionError(false));
  });
}
