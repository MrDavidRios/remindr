import angelRightIcon from '@assets/icons/angel-right.svg';
import closeButtonIcon from '@assets/icons/close-button.svg';
import openIcon from '@assets/icons/open.svg';
import type { Settings, TaskScheduledReminderPair } from '@remindr/shared';
import { createDefaultSettings, waitUntil } from '@remindr/shared';
import { getFormattedReminderTime } from '@remindr/shared/src/utils/timefunctions';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import '../../styles/css/notification.css';
import { updateTheme } from '../scripts/systems/notifications/notificationutils';
import { getIpcRendererOutput } from '../scripts/utils/ipcRendererOutput';

window.electron.ipcRenderer.on('update-theme-in-notification', (_e: string) => updateTheme(_e));

type NotificationWindowData = {
  taskReminderPair: TaskScheduledReminderPair;
  settings: Settings;
  stringifiedThemeData: string;
};

// Separates event handling from React, preventing failure if the event is sent before the component is mounted.
let initialNotificationData: NotificationWindowData | undefined = undefined;
window.electron.ipcRenderer.on('initialize-notification', (_e: string) => {
  const eventNotificationData = getIpcRendererOutput(_e) as {
    taskReminderPair: TaskScheduledReminderPair;
    stringifiedThemeData: string;
    stringifiedSettingsData: string;
  };

  initialNotificationData = {
    taskReminderPair: eventNotificationData.taskReminderPair,
    settings: JSON.parse(eventNotificationData.stringifiedSettingsData) as Settings,
    stringifiedThemeData: eventNotificationData.stringifiedThemeData,
  };
});

export const NotificationWindowContents: FC = () => {
  const [taskReminderPair, setTaskReminderPair] = useState<TaskScheduledReminderPair | undefined>(
    initialNotificationData?.taskReminderPair,
  );
  const [settings, setSettings] = useState<Settings>(initialNotificationData?.settings ?? createDefaultSettings());

  useEffect(() => {
    const waitForInitialNotificationData = async () => {
      await waitUntil(() => initialNotificationData !== undefined);

      setTaskReminderPair(initialNotificationData?.taskReminderPair);
      setSettings(initialNotificationData?.settings ?? createDefaultSettings());

      if (initialNotificationData?.stringifiedThemeData) updateTheme(initialNotificationData.stringifiedThemeData);
    };

    waitForInitialNotificationData();
  }, []);

  const closeNotification = () =>
    window.electron.ipcRenderer.sendMessage('close-notification', JSON.stringify(taskReminderPair));

  const openTaskInEditPanel = () => {
    if (taskReminderPair?.task === undefined) throw new Error('[open-task-in-edit-panel]: task is undefined');

    window.electron.ipcRenderer.sendMessage('open-task-in-edit-panel', taskReminderPair?.task);
    closeNotification();
  };

  const completeTask = () => {
    if (taskReminderPair?.task === undefined) throw new Error('[complete-task]: task is undefined');

    window.electron.ipcRenderer.sendMessage('complete-task', {
      task: taskReminderPair.task,
      index: taskReminderPair.scheduledReminderIndex,
    });

    closeNotification();
  };

  /**
   * Sends a request to main window to snooze the selected reminder.
   * @param time time to snooze reminder in minutes
   * @returns
   */
  const snoozeReminder = (time: number) => {
    if (taskReminderPair?.task === undefined) throw new Error('[snooze-reminder]: task is undefined');

    if (time === -1) {
      // Custom amount of time to snooze
      window.electron.ipcRenderer.sendMessage('open-reminder', {
        task: taskReminderPair.task,
        index: taskReminderPair.scheduledReminderIndex,
      });

      closeNotification();
      return;
    }

    window.electron.ipcRenderer.sendMessage('snooze-reminder', {
      task: taskReminderPair.task,
      index: taskReminderPair.scheduledReminderIndex,
      time /* minutes */,
    });
  };

  const reminder =
    taskReminderPair?.task !== undefined
      ? taskReminderPair.task.scheduledReminders[taskReminderPair.scheduledReminderIndex]
      : undefined;

  return (
    <>
      <div id="titlebar">
        <p id="notificationTitle">{taskReminderPair?.task.name ?? 'Default Task'}</p>
        <button type="button" id="notificationReminderOpenButton" title="View Reminder" onClick={openTaskInEditPanel}>
          <img src={openIcon} alt="View reminder details" className="ignore-cursor" draggable="false" />
        </button>
        <button type="button" id="notificationCloseButton" title="Close Notification" onClick={closeNotification}>
          <img alt="Close Notification" src={closeButtonIcon} className="ignore-cursor" draggable="false" />
        </button>
      </div>
      <div id="reminderDetailsContainer">
        <p id="time">{reminder ? getFormattedReminderTime(reminder, settings.militaryTime) : '0:00'}</p>
      </div>
      <div id="actionBar">
        <div id="snoozeButtonWrapper">
          <button
            type="button"
            className="notification-button"
            id="snoozeButton"
            title="Snooze for 15 minutes"
            onClick={() => snoozeReminder(15)}
          >
            <p>Snooze</p>
            <img alt="" src={angelRightIcon} />
          </button>
          <div id="snoozeMenu" className="context-menu menu">
            <ul>
              <li onClick={() => snoozeReminder(30)}>30 Minutes</li>
              <li onClick={() => snoozeReminder(60)}>1 Hour</li>
              <li onClick={() => snoozeReminder(180)}>3 Hours</li>
              <li id="snoozeCustom" onClick={() => snoozeReminder(-1)}>
                Custom
              </li>
            </ul>
          </div>
        </div>
        <div id="buttonSpacer" />
        <button type="button" className="notification-button" id="completeButton" onClick={completeTask}>
          Complete
        </button>
      </div>
    </>
  );
};

export function NotificationWindow() {
  return <NotificationWindowContents />;
}
