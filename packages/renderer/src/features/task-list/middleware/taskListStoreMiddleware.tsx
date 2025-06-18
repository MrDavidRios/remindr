import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "@renderer/app/store";

export const taskListStoreMiddleware: Middleware =
  ({ getState }: { getState: () => RootState }) =>
  (next) =>
  (action) => {
    const result = next(action);

    const isTaskListOperation = ((action as any).type as string).includes(
      "taskList"
    );

    // Update task list in store if it's been edited
    if (isTaskListOperation)
      window.store.set("task-list-current", getState().taskList.value);

    return result;
  };
