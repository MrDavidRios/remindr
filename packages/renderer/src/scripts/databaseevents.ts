import { AppDispatch } from 'renderer/app/store';
import { updateDatabaseRequests } from 'renderer/features/database/databaseSlice';
import { getIpcRendererOutput } from './utils/ipcRendererOutput';

let listenersInitialized = false;
export function useDatabaseEvents(dispatch: AppDispatch) {
  if (listenersInitialized) return;
  listenersInitialized = true;

  window.electron.ipcRenderer.on('sync-save-calls', (e) => {
    const saveCalls = getIpcRendererOutput(e);

    dispatch(updateDatabaseRequests(saveCalls));
  });
}
