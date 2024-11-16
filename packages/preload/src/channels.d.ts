export type DevEvent = 'dev-remove-data-event-listeners';
export type WindowEvent = 'window-maximized' | 'window-unmaximized';
export type AppEvent =
  | 'action-on-save'
  | 'system-theme-changed'
  | 'show-message-box-response'
  | 'background-image-update'
  | 'update-task-display';
export type AuthEvent = 'logged-in' | 'signed-out';
export type TaskInteractionEvent =
  | 'task-deleted'
  | 'complete-task'
  | 'snooze-reminder'
  | 'open-reminder'
  | 'open-task-in-edit-panel'
  | 'scheduled-reminders-modified'
  | 'advance-recurring-reminder';
export type DataEvent =
  | 'startup-setting-updated'
  | 'sync-save-calls'
  | 'is-saving'
  | 'server-task-list-update'
  | 'restart-firestore';
export type AppAction =
  | 'update-tray-icon'
  | 'update-tray-tooltip'
  | 'update-badge'
  | 'show-message-box'
  | 'auth-state-changed'
  | 'show-task-context-menu'
  | 'show-general-context-menu'
  | 'trigger-undo-notification'
  | 'task-completed'
  | 'save-edits'
  | 'save-edits-override'
  | 'task-edit-window-opened'
  | 'task-edit-window-closed'
  | 'open-reminder-in-edit-menu'
  | 'update-notification-style-values'
  | 'expand-all-groups';
export type UpdateEvent =
  | 'update-available'
  | 'update-not-available'
  | 'download-update'
  | 'check-for-updates'
  | 'update-downloaded'
  | 'restart-app-to-update';
export type NotificationEvent =
  | 'reminder-data'
  | 'group-reminder-data'
  | 'remove-task-from-notif'
  | 'initialize-notification'
  | 'update-theme-in-notification'
  | 'update-settings-in-notification'
  | 'close-notification'
  | 'initialize-group-notification'
  | 'add-reminder-to-group-notif'
  | 'deploy-native-notification';

export type Channels =
  | DevEvent
  | AppEvent
  | AppAction
  | AuthEvent
  | DataEvent
  | TaskInteractionEvent
  | UpdateEvent
  | NotificationEvent
  | WindowEvent;
