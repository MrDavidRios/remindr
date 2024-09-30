import angelRightIcon from '@assets/icons/angel-right.svg';
import closeButtonIcon from '@assets/icons/close-button.svg';
import openIcon from '@assets/icons/open.svg';
import type { Settings, TaskScheduledReminderPair } from '@remindr/shared';
import { createDefaultSettings } from '@remindr/shared';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import '../../styles/css/notification.css';
import { updateTheme } from '../scripts/systems/notifications/notificationutils';
import { getIpcRendererOutput } from '../scripts/utils/ipcRendererOutput';
import { getFormattedReminderTime } from '../scripts/utils/timefunctions';

window.electron.ipcRenderer.on('update-theme-in-notification', (_e: string) => updateTheme(_e));

export const NotificationWindowContents: FC = () => {
  const [taskReminderPair, setTaskReminderPair] = useState<TaskScheduledReminderPair | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(createDefaultSettings());

  useEffect(() => {
    const initializeNotification = (_e: string) => {
      const data = getIpcRendererOutput(_e) as {
        taskReminderPair: TaskScheduledReminderPair;
        stringifiedThemeData: string;
        stringifiedSettingsData: string;
      };

      setTaskReminderPair(data.taskReminderPair);
      setSettings(JSON.parse(data.stringifiedSettingsData) as Settings);
      updateTheme(data.stringifiedThemeData);
    };

    const notifInitDataListener = window.electron.ipcRenderer.on('initialize-notification', initializeNotification);

    return () => {
      notifInitDataListener();
    };
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
    taskReminderPair !== undefined
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
