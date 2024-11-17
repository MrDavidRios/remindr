import { waitUntil } from '@remindr/shared';
import store, { AppDispatch } from '@renderer/app/store';
import { updateTasks } from '@renderer/features/task-list/taskListSlice';
import { getIpcRendererOutput } from '@renderer/scripts/utils/ipcRendererOutput';

let dispatch: AppDispatch;
export function initTaskColumnShiftListeners(_dispatch: AppDispatch) {
  dispatch = _dispatch;

  window.electron.ipcRenderer.on('day-changed', (_e: unknown) => {
    const daysSinceUpdate = getIpcRendererOutput(_e) as number;
    shiftTaskColumns(daysSinceUpdate);
  });
}

export async function shiftTaskColumns(daysSinceUpdate: number): Promise<void> {
  if (!dispatch) {
    throw new ReferenceError('dispatch not initialized');
  }

  // Wait until task list is loaded
  await waitUntil(() => store.getState().taskList.taskListGetStatus === 'succeeded', 1000);

  // get task list
  const taskList = store.getState().taskList.value;
  const tasksInColumns = taskList.filter((task) => task.columnIdx !== undefined);

  for (const task of tasksInColumns) {
    if (task.columnIdx !== undefined) {
      task.columnIdx -= daysSinceUpdate;
    }
  }

  console.log('[shiftTaskColumns]:', tasksInColumns);

  dispatch(updateTasks(tasksInColumns));
}
