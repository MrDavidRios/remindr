import { getTaskColumnIdx, waitUntil } from '@remindr/shared';
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

  // We want to shift tasks in columns that don't currently have reminders
  const reminderlessTasksInColumns = taskList.filter(
    (task) => task.columnIdx !== undefined && task.scheduledReminders.length === 0,
  );

  const updatedReminderlessTasks = reminderlessTasksInColumns.map((task) => {
    if (task.columnIdx !== undefined) {
      return { ...task, columnIdx: task.columnIdx - daysSinceUpdate };
    }

    return task;
  });

  // Assign relevant tasks with reminders to columns based on their earliest reminder
  const tasksWithReminders = taskList.filter((task) => task.scheduledReminders.length > 0);
  const updatedTasksWithReminders = tasksWithReminders.map((task) => {
    const columnIdx = getTaskColumnIdx(task);
    return { ...task, columnIdx };
  });

  dispatch(updateTasks([...updatedReminderlessTasks, ...updatedTasksWithReminders]));
}
