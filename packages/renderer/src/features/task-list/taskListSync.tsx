import { Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { setTaskList } from './taskListSlice';

export function initializeTaskListSyncListener() {
  window.electron.ipcRenderer.on('server-task-list-update', (taskListObj: { reminderList: Task[] }) => {
    const { reminderList: taskList } = taskListObj;

    if (!taskList) {
      console.error('Received invalid task list update from server', taskListObj);
      return;
    }

    store.dispatch(setTaskList(taskList));
  });
}
