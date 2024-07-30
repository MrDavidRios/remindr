import { Middleware } from '@reduxjs/toolkit';
import _ from 'lodash';
import { removeTask, removeTasks, updateTask } from '../taskListSlice';

export const notificationEventMiddleware: Middleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);

    // If a task is deleted, make sure notifications.ts knows
    if (removeTask.match(action)) {
      window.electron.ipcRenderer.sendMessage('task-deleted', JSON.stringify(action.payload));
    }

    if (removeTasks.match(action)) {
      for (const task of action.payload) {
        window.electron.ipcRenderer.sendMessage('task-deleted', JSON.stringify(task));
      }
    }

    // If scheduled reminders are modified, make sure notifications.ts knows
    if (updateTask.match(action)) {
      const oldTask = getState().taskList.lastTaskListAction?.task;

      if (!_.isEqual(oldTask?.scheduledReminders, action.payload.scheduledReminders)) {
        window.electron.ipcRenderer.sendMessage('scheduled-reminders-modified', JSON.stringify(action.payload));
      }
    }

    return result;
  };
