import Task from 'main/types/classes/task/task';
import store, { AppDispatch } from 'renderer/app/store';
import {
  completeTask,
  removeSelectedTask,
  setSelectedTask,
  updateTask,
} from 'renderer/features/task-list/taskListSlice';
import { initNativeNotificationListener } from './systems/notifications/nativenotification';
import { getIpcRendererOutput } from './utils/ipcRendererOutput';
import { isTaskSelected, postponeTask } from './utils/taskfunctions';
import { waitUntil } from './utils/timing';

let listenersInitialized = false;
export function useNotificationEvents(dispatch: AppDispatch) {
  if (listenersInitialized) return;
  listenersInitialized = true;

  window.electron.ipcRenderer.on('open-task-in-edit-panel', (task) => {
    const selectedTasks = store.getState().taskList.selectedTasks;
    if (isTaskSelected(task as Task, selectedTasks)) return;

    // If the task doesn't exist, don't try to open it.
    const taskList = store.getState().taskList.value;
    if (!taskList.some((e) => e.creationTime === (task as Task).creationTime)) return;

    dispatch(setSelectedTask(task as Task));
  });

  window.electron.ipcRenderer.on('open-reminder-in-edit-menu', async (_e) => {
    const { task, index } = getIpcRendererOutput(_e) as {
      task: Task;
      index: number;
    };

    window.mainWindow.show();

    const selectedTasks = store.getState().taskList.selectedTasks;
    if (!isTaskSelected(task as Task, selectedTasks)) dispatch(setSelectedTask(task));

    await waitUntil(() => document.getElementById('taskEditWindow'));
    const taskEditWindow = document.getElementById('taskEditWindow');
    const remindersContainer = taskEditWindow?.querySelector('.reminders-container') as HTMLElement;

    const reminderTile = remindersContainer?.children[index] as HTMLElement;
    reminderTile?.click();
  });

  window.electron.ipcRenderer.on('complete-task', (_e) => {
    const { task } = _e as { task: Task; index: number };

    // If the task is selected, de-select it.
    dispatch(removeSelectedTask(task));
    dispatch(completeTask(task));
  });

  window.electron.ipcRenderer.on('snooze-reminder', (_e) => {
    const { task, index, time } = getIpcRendererOutput(_e) as {
      task: Task;
      index: number;
      time: number /* Minutes */;
    };

    // If the task is selected, de-select it.
    dispatch(removeSelectedTask(task));
    dispatch(updateTask(postponeTask(task, time, index)));
  });

  // Native notification functionality
  initNativeNotificationListener();
}
