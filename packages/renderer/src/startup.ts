import store, { AppDispatch } from './app/store';
import { useOverdueBadgeUpdate } from './features/task-list/overdueBadgeUpdate';
import { useDatabaseEvents } from './scripts/databaseevents';
import { useNotificationEvents } from './scripts/notificationevents';
import { initializeFirestoreRestartEvent } from './scripts/restartFirestoreListener';
import { useAuth } from './scripts/systems/authentication';
import { setLoadedStyles } from './scripts/systems/stylemanager';
import { initTaskColumnShiftListeners } from './scripts/systems/task-columns/shiftTaskColumns';
import { useTaskLoopEvents } from './scripts/taskLoopEvents';
import { useUpdateNotificationListeners } from './scripts/updatenotification';

export function useStartupActions(dispatch: AppDispatch) {
  // Auth
  useAuth(dispatch, store.getState().settings.value.startupMode);

  // Theming
  setLoadedStyles(store.getState().settings.value);

  // Notification event listeners
  useNotificationEvents(dispatch);

  // Reminder checking (task loop) event listeners
  useTaskLoopEvents(dispatch);

  // Overdue badge
  useOverdueBadgeUpdate();

  // Database state syncing
  useDatabaseEvents(dispatch);

  // Update notification listeners
  useUpdateNotificationListeners(dispatch);

  // Firestore restart event listener
  initializeFirestoreRestartEvent(dispatch);

  // Task column shift listener
  initTaskColumnShiftListeners(dispatch);
}
