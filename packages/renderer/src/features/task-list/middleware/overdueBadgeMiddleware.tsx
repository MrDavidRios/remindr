import { Middleware } from '@reduxjs/toolkit';
import { updateOverlayIcons } from '@renderer/scripts/systems/badges';

export const overdueBadgeMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  const isTaskListOperation = ((action as any).type as string).includes('taskList');
  if (isTaskListOperation) {
    updateOverlayIcons();
  }

  return result;
};
