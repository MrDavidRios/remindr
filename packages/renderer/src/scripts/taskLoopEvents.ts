import { Task } from '@remindr/shared';
import { AppDispatch } from '../app/store';
import { advanceRecurringReminder, setTaskDisplayOutdated } from '../features/task-list/taskListSlice';
import { getIpcRendererOutput } from './utils/ipcRendererOutput';

let listenersInitialized = false;
export function useTaskLoopEvents(dispatch: AppDispatch) {
  if (listenersInitialized) return;
  listenersInitialized = true;

  window.electron.ipcRenderer.on('task-display-outdated', () => {
    dispatch(setTaskDisplayOutdated(true));
  });

  window.electron.ipcRenderer.on('advance-recurring-reminder', async (_e: unknown) => {
    const { task, index } = getIpcRendererOutput(_e) as {
      task: Task;
      index: number;
    };

    dispatch(advanceRecurringReminder({ task, reminderIdx: index }));
  });
}
