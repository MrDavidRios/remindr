import { AppDispatch } from '../app/store';
import { updateDatabaseRequests } from '../features/database/databaseSlice';
import { getIpcRendererOutput } from './utils/ipcRendererOutput';

let listenersInitialized = false;
export function useDatabaseEvents(dispatch: AppDispatch) {
  if (listenersInitialized) return;
  listenersInitialized = true;

  window.electron.ipcRenderer.on('sync-save-calls', (e: unknown) => {
    const saveCalls = getIpcRendererOutput(e);

    dispatch(updateDatabaseRequests(saveCalls));
  });
}
