import { Stream } from '@remindr/shared';
import store from '@renderer/app/store';
import { setStreamList } from './streamListSlice';

export function initializeStreamListSyncListener() {
  window.electron.ipcRenderer.on('server-stream-list-update', (streamListObj: { streamList: Stream[] }) => {
    const { streamList } = streamListObj;

    if (!streamList) {
      console.error('Received invalid stream list update from server', streamListObj);
      return;
    }

    store.dispatch(setStreamList(streamList));
  });
}
