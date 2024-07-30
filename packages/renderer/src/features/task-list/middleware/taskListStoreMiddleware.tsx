import { Middleware } from '@reduxjs/toolkit';

export const taskListStoreMiddleware: Middleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);

    const isTaskListOperation = ((action as any).type as string).includes('taskList');

    // Update task list in store if it's been edited
    if (isTaskListOperation) window.store.set('task-list-current', getState().taskList.value);

    return result;
  };
