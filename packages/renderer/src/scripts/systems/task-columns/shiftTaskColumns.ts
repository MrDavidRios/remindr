import store, { AppDispatch } from '@renderer/app/store';
import { updateTasks } from '@renderer/features/task-list/taskListSlice';
import { getIpcRendererOutput } from '@renderer/scripts/utils/ipcRendererOutput';

let dispatch: AppDispatch;
export function initTaskColumnShiftListeners(_dispatch: AppDispatch) {
  dispatch = _dispatch;

  window.electron.ipcRenderer.on('day-changed', (_e: unknown) => {
    const { daysSinceUpdate } = getIpcRendererOutput(_e) as { daysSinceUpdate: number };

    console.log('day-changed event received in renderer process!!');

    shiftTaskColumns(daysSinceUpdate);
  });
}

export function shiftTaskColumns(daysSinceUpdate: number): void {
  if (!dispatch) {
    throw new ReferenceError('dispatch not initialized');
  }

  // get task list
  const taskList = store.getState().taskList.value;
  const tasksInColumns = taskList.filter((task) => task.columnIdx !== undefined);

  tasksInColumns.forEach((task) => {
    if (task.columnIdx !== undefined) task.columnIdx -= daysSinceUpdate;
  });

  dispatch(updateTasks(tasksInColumns));
}
