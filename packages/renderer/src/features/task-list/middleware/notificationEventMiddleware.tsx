import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "@renderer/app/store";
import _ from "lodash";
import { completeTask, removeTasks, updateTask } from "../taskListSlice";

export const notificationEventMiddleware: Middleware =
  ({ getState }: { getState: () => RootState }) =>
  (next) =>
  (action) => {
    const result = next(action);

    // If a task is completed, make sure notifications.ts knows
    if (completeTask.match(action)) {
      window.electron.ipcRenderer.sendMessage(
        "task-completed",
        JSON.stringify(action.payload)
      );
    }

    // If a task is deleted, make sure notifications.ts knows
    if (removeTasks.match(action)) {
      for (const task of action.payload) {
        window.electron.ipcRenderer.sendMessage(
          "task-deleted",
          JSON.stringify(task)
        );
      }
    }

    if (removeTasks.match(action)) {
      for (const task of action.payload) {
        window.electron.ipcRenderer.sendMessage(
          "task-deleted",
          JSON.stringify(task)
        );
      }
    }

    // If scheduled reminders are modified, make sure notifications.ts knows
    if (updateTask.match(action)) {
      const oldTask = getState().taskList.lastTaskListAction?.tasks[0];

      if (
        !_.isEqual(
          oldTask?.scheduledReminders,
          action.payload.scheduledReminders
        )
      ) {
        window.electron.ipcRenderer.sendMessage(
          "scheduled-reminders-modified",
          JSON.stringify(action.payload)
        );
      }
    }

    return result;
  };
