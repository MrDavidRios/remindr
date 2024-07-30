import Task from 'main/types/classes/task/task';
import { AppDispatch } from 'renderer/app/store';
import { advanceRecurringReminder, setTaskDisplayOutdated } from 'renderer/features/task-list/taskListSlice';
import { getIpcRendererOutput } from './utils/ipcRendererOutput';

let listenersInitialized = false;
export function useTaskLoopEvents(dispatch: AppDispatch) {
  if (listenersInitialized) return;
  listenersInitialized = true;

  window.electron.ipcRenderer.on('task-display-outdated', () => {
    dispatch(setTaskDisplayOutdated(true));
  });

  window.electron.ipcRenderer.on('advance-recurring-reminder', async (_e) => {
    const { task, index } = getIpcRendererOutput(_e) as {
      task: Task;
      index: number;
    };

    dispatch(advanceRecurringReminder({ task, reminderIdx: index }));
  });
}
