import { createDefaultSettings } from '@main/utils/defaultSettings.js';
import { getScreenHeight, getScreenWidth } from '@main/utils/screen.js';
import { getSettingsProfile } from '@main/utils/storeUserData.js';
import type { Task, TaskScheduledReminderPair } from '@remindr/shared';
import { BrowserWindow, app, ipcMain, screen } from 'electron';
import _ from 'lodash';
import { join } from 'node:path';
import { getMainWindow } from './utils/getMainWindow.js';

/** Spacing from the right edge of the screen */
const HORIZONTAL_NOTIF_SPACING = 20;

/** Spacing from the top edge of taskbar / from top edge of notification under current */
const VERTICAL_NOTIF_SPACING = 20;

const NOTIF_WIDTH = 400;
const NOTIF_HEIGHT = 130;
const GROUP_NOTIF_HEIGHT = 300;

const ongoingNotifications = new Map<TaskScheduledReminderPair, BrowserWindow>();

let isGroupNotifCreated = false;
let isGroupNotifOpen = false;
let queuedGroupNotifReminders: TaskScheduledReminderPair[] = [];

let groupNotifWindow: BrowserWindow | undefined;

const styleValues: Map<string, string> = new Map();

/**
 * Initializes notification event listeners (e.g. notify, close-notification, update-notification-style-values, etc.)
 * @param mainWindow
 */
export function initNotificationEventListeners() {
  ipcMain.on('update-notification-style-values', (_e, styleData) => {
    const updatedStyleValues = JSON.parse(styleData) as Record<string, string>;
    // eslint-disable-next-line no-restricted-syntax
    for (const [property, value] of Object.entries(updatedStyleValues)) {
      styleValues.set(property, value);
    }

    if (isGroupNotifOpen) {
      groupNotifWindow?.webContents.send(
        'update-theme-in-notification',
        JSON.stringify(Object.fromEntries(styleValues)),
      );
      return;
    }

    ongoingNotifications.forEach(async (notifWindow) => {
      notifWindow.webContents.send('update-theme-in-notification', JSON.stringify(Object.fromEntries(styleValues)));
      notifWindow.webContents.send('update-settings-in-notification', getSettingsProfile());
    });
  });

  ipcMain.on('close-notification', (_event, stringifiedTaskReminderPair) => {
    if (isGroupNotifCreated) {
      closeGroupNotification();
      return;
    }

    const taskReminderPair = getTaskReminderPair(stringifiedTaskReminderPair);
    const notificationWindow = ongoingNotifications.get(taskReminderPair!);

    if (!notificationWindow) throw new Error('close-notification: notification window not found');

    notificationWindow.close();
    ongoingNotifications.delete(taskReminderPair!);
  });

  // Notification event listener
  ipcMain.on('notify', (_event, stringifiedTask: string, scheduledReminderIdx: number) => {
    notify(stringifiedTask, scheduledReminderIdx);
  });
}

export function notify(stringifiedTask: string, scheduledReminderIndex: number): void {
  const mainWindow = getMainWindow();

  const task = JSON.parse(stringifiedTask) as Task;

  console.log(`notify - starting notification for ${task.name}`, task);

  const notifDetails: TaskScheduledReminderPair = {
    task,
    scheduledReminderIndex,
  };

  // Don't fire another notification if existing notification already has the same task/scheduled reminder pair
  for (const key of ongoingNotifications.keys()) {
    if (key.task.creationTime === task.creationTime && key.scheduledReminderIndex === scheduledReminderIndex) {
      // Task/reminder pair already exists in ongoingNotifications
      return;
    }
  }

  // If notification deployment setting configured to use native notifications, fire native notification instead
  const settings = JSON.parse(getSettingsProfile()) ?? createDefaultSettings();
  if (settings.nativeNotifications) {
    // Delegate firing of native notification to renderer util script
    mainWindow?.webContents.send('deploy-native-notification', {
      task,
      index: scheduledReminderIndex,
    });
    return;
  }

  const win = createNotificationWindow();
  win.setAlwaysOnTop(true, 'pop-up-menu');

  if (isGroupNotifCreated) {
    // Send event to group notification
    if (isGroupNotifOpen) groupNotifWindow?.webContents.send('add-reminder-to-group-notif', notifDetails);
    else queuedGroupNotifReminders.push(notifDetails);
  } else if (doNotificationsOverflow(ongoingNotifications.size + 1)) {
    convertToGroupNotif(notifDetails);
  } else {
    ongoingNotifications.set(notifDetails, win);

    win.webContents.once('did-finish-load', () => {
      // Send the task and reminder data to the notification window
      win.webContents.send('initialize-notification', {
        taskReminderPair: notifDetails,
        stringifiedThemeData: JSON.stringify(Object.fromEntries(styleValues)),
        stringifiedSettingsData: getSettingsProfile(),
      });

      // Every time the ongoingNotifications array updates, update each notification with their new position.
      updateNotificationPositions();

      win.show();
    });

    win.loadURL(join(app.getAppPath(), 'packages/renderer/dist/src/notifications/notification.html'));
  }

  win.once('closed', () => {
    if (!isGroupNotifCreated) ongoingNotifications.delete(notifDetails);

    // Every time the ongoingNotifications array updates, update each notification with their new position.
    updateNotificationPositions();
  });
}

function createNotificationWindow() {
  const yVal = getScreenHeight() - getTotalNotifHeight() * (ongoingNotifications.size + 1);

  const win = new BrowserWindow({
    height: NOTIF_HEIGHT,
    maxHeight: NOTIF_HEIGHT,
    width: NOTIF_WIDTH,
    show: false,
    x: getScreenWidth() - getTotalNotifWidth(),
    y: yVal,
    frame: false,
    resizable: false,
    minimizable: false,
    alwaysOnTop: true,
    backgroundColor: '#121212',
    parent: getMainWindow(),
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: false,
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  return win;
}

function doNotificationsOverflow(notificationAmount: number) {
  return getScreenHeight() < notificationAmount * getTotalNotifHeight();
}

function getTotalNotifWidth() {
  return NOTIF_WIDTH + HORIZONTAL_NOTIF_SPACING;
}

function getTotalNotifHeight() {
  return NOTIF_HEIGHT + VERTICAL_NOTIF_SPACING;
}

function getTotalGroupNotifHeight() {
  return GROUP_NOTIF_HEIGHT + VERTICAL_NOTIF_SPACING;
}

function closeGroupNotification() {
  groupNotifWindow!.close();
  ongoingNotifications.clear();
}

function closeAllNotifications(clearData: boolean) {
  ongoingNotifications.forEach((value, key) => {
    // Value is the window, key is the task/scheduled reminder pair
    value.close();

    if (clearData) ongoingNotifications.delete(key);
  });
}

// Update y-positions of each notification based on their index.
// #region Position
function updateNotificationPositions() {
  let i = 1;
  ongoingNotifications.forEach((notifWindow) => {
    // Value is the window, key is the task/scheduled reminder pair
    if (notifWindow.isDestroyed()) return;

    const goalPosition = [
      getScreenWidth() - getTotalNotifWidth(),
      getScreenHeight() - (notifWindow === groupNotifWindow ? getTotalGroupNotifHeight() : getTotalNotifHeight()) * i,
    ];

    notifWindow.setPosition(goalPosition[0], goalPosition[1], false);

    // setSize doesn't work if the window isn't resizable
    notifWindow.setResizable(true);
    notifWindow.setMaximumSize(NOTIF_WIDTH, GROUP_NOTIF_HEIGHT);
    notifWindow.setSize(400, 130);
    notifWindow.setResizable(false);

    i++;
  });
}

/**
 * Initializes screen event listeners for notification display (e.g. display-added, display-removed)
 */
export default function initializeNotificationScreenListeners() {
  screen.addListener('display-added', () => {
    // Workaround to properly display notifications on new (primary) screen (waiting a second to make sure the primary display properly updates)
    setTimeout(() => {
      ongoingNotifications.forEach((notifWindow) => {
        if (notifWindow.isDestroyed()) return;

        notifWindow.setPosition(screen.getPrimaryDisplay().bounds.x, screen.getPrimaryDisplay().bounds.y);
      });

      updateNotificationPositions();

      // If new primary display can't hold all of the notifications, slap them all into a group notification
      if (doNotificationsOverflow(ongoingNotifications.size)) convertToGroupNotif();
    }, 1000);
  });

  screen.addListener('display-removed', () => {
    // Workaround to properly display notifications on other (primary) screen (waiting a second to make sure the primary display properly updates)
    setTimeout(() => {
      ongoingNotifications.forEach((notifWindow) => {
        if (notifWindow.isDestroyed()) return;

        notifWindow.setPosition(screen.getPrimaryDisplay().bounds.x, screen.getPrimaryDisplay().bounds.y);
      });

      updateNotificationPositions();

      // If new primary display can't hold all of the notifications, slap them all into a group notification
      if (doNotificationsOverflow(ongoingNotifications.size)) convertToGroupNotif();
    }, 1000);
  });
}

// #endregion

const removeTaskNotification = (_event: Electron.IpcMainEvent, data: string) => {
  const task = JSON.parse(data) as Task;

  if (groupNotifWindow && !groupNotifWindow.isDestroyed()) {
    groupNotifWindow.webContents.send('remove-task-from-notif', task);
    return;
  }

  ongoingNotifications.forEach((value, key) => {
    // Value is the window, key is the task/scheduled reminder pair
    if (key.task.creationTime === task.creationTime) {
      value.close();
      ongoingNotifications.delete(key);
    }
  });
};

ipcMain.on('task-deleted', removeTaskNotification);
ipcMain.on('task-completed', removeTaskNotification);

ipcMain.on('scheduled-reminders-modified', (_event, data) => {
  const task = JSON.parse(data as string) as Task;

  ongoingNotifications.forEach((notifWindow, key) => {
    // Value is the window, key is the task/scheduled reminder pair
    if (key.task.creationTime === task.creationTime) {
      // If the reminder the notification is based on is no longer in the scheduled reminders list, close the notification as it no longer applies
      if (!_.some(task.scheduledReminders, key.task.scheduledReminders[key.scheduledReminderIndex])) {
        notifWindow.close();
        ongoingNotifications.delete(key);
      }
    }
  });
});

function convertToGroupNotif(notifDetails?: TaskScheduledReminderPair) {
  const win = createNotificationWindow();

  win.setAlwaysOnTop(true, 'pop-up-menu');

  // Close all notifications
  closeAllNotifications(false);

  // Set size and position of group notification
  win.setResizable(true);
  win.setSize(400, GROUP_NOTIF_HEIGHT);
  win.setResizable(false);

  win.setPosition(win.getPosition()[0], getScreenHeight() - getTotalGroupNotifHeight());

  // Open one notification saying how many notifications that are in queue
  win.loadURL(join(app.getAppPath(), 'packages/renderer/dist/src/notifications/groupnotification.html'));

  groupNotifWindow = win;
  isGroupNotifCreated = true;

  win.webContents.once('did-finish-load', () => {
    const allTaskReminderPairs = Array.from(ongoingNotifications.keys());
    queuedGroupNotifReminders.forEach((element) => {
      allTaskReminderPairs.push(element);
    });

    if (notifDetails !== undefined) allTaskReminderPairs.push(notifDetails);

    queuedGroupNotifReminders = [];

    // Send the task and reminder data to the notification window
    win.webContents.send('initialize-group-notification', {
      taskReminderPairs: allTaskReminderPairs,
      stringifiedThemeData: JSON.stringify(Object.fromEntries(styleValues)),
      stringifiedSettingsData: getSettingsProfile(),
    });

    win.show();

    isGroupNotifOpen = true;
  });

  win.once('closed', () => {
    isGroupNotifCreated = false;
    isGroupNotifOpen = false;

    ongoingNotifications.clear();
  });
}

function getTaskReminderPair(stringifiedTaskReminderPair: string): TaskScheduledReminderPair | undefined {
  const taskReminderPair = JSON.parse(stringifiedTaskReminderPair);

  // eslint-disable-next-line no-restricted-syntax
  for (const key of ongoingNotifications.keys()) {
    if (
      key.scheduledReminderIndex === taskReminderPair.scheduledReminderIndex &&
      key.task.creationTime === taskReminderPair.task.creationTime
    )
      return key;
  }

  return undefined;
}
