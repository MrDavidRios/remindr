import Task from 'main/types/classes/task/task';
import store from 'renderer/app/store';
import { setTaskList } from './taskListSlice';

export function initializeTaskListSyncListener() {
  window.electron.ipcRenderer.on('server-task-list-update', (taskListObj) => {
    const { reminderList: taskList } = taskListObj as { reminderList: Task[] };

    if (!taskList) {
      console.error('Received invalid task list update from server', taskListObj);
      return;
    }

    store.dispatch(setTaskList(taskList));
  });
}
