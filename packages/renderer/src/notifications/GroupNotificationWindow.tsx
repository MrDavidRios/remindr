import closeButtonIcon from '@assets/icons/close-button.svg';
import type { Settings, Task, TaskScheduledReminderPair } from '@remindr/shared';
import { createDefaultSettings } from '@remindr/shared';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import '../../styles/css/notification.css';
import { updateTheme } from '../scripts/systems/notifications/notificationutils';
import { getIpcRendererOutput } from '../scripts/utils/ipcRendererOutput';
import { ReminderListElement } from './ReminderListElement';

window.electron.ipcRenderer.on('update-theme-in-notification', (_e: string) => updateTheme(_e));

export const GroupNotificationWindowContents: FC = () => {
  const [taskReminderPairs, setTaskReminderPairs] = useState<TaskScheduledReminderPair[]>([]);
  const [settings, updateSettings] = useState<Settings>(createDefaultSettings());

  useEffect(() => {
    const initializeNotification = (_e: unknown) => {
      const data = getIpcRendererOutput(_e) as {
        taskReminderPairs: TaskScheduledReminderPair[];
        stringifiedThemeData: string;
        stringifiedSettingsData: string;
      };

      setTaskReminderPairs(data.taskReminderPairs);

      updateSettings(JSON.parse(data.stringifiedSettingsData) as Settings);
      updateTheme(data.stringifiedThemeData);
    };

    const addReminderToNotif = (_e: unknown) => {
      const taskReminderPair = getIpcRendererOutput(_e) as TaskScheduledReminderPair;

      // If the reminder has already been added to the notification, don't add it again.
      if (
        taskReminderPairs.filter(e => e.task.creationTime === taskReminderPair.task.creationTime)
          .length > 0
      )
        return;

      setTaskReminderPairs([...taskReminderPairs, taskReminderPair]);
    };

    const removeTaskFromNotif = (_e: unknown) => {
      const taskData = getIpcRendererOutput(_e) as Task;

      if (taskReminderPairs.filter(e => e.task.creationTime === taskData.creationTime).length > 0) {
        // If the reminder has been deleted in the app, remove both the HTML element from the group notification as well as the element in the displayedReminders map.
        setTaskReminderPairs(
          taskReminderPairs.filter(e => e.task.creationTime !== taskData.creationTime),
        );

        // If there are no 'missed reminders' left, close the notification.
        if (taskReminderPairs.length === 0) closeNotification();
      }
    };

    const notifInitDataListener = window.electron.ipcRenderer.on(
      'initialize-group-notification',
      initializeNotification,
    );

    const addReminderToNotifListener = window.electron.ipcRenderer.on(
      'add-reminder-to-group-notif',
      addReminderToNotif,
    );

    const removeTaskFromNotifListener = window.electron.ipcRenderer.on(
      'remove-task-from-notif',
      removeTaskFromNotif,
    );

    return () => {
      notifInitDataListener();
      addReminderToNotifListener();
      removeTaskFromNotifListener();
    };
  }, [taskReminderPairs]);

  const closeNotification = () => window.electron.ipcRenderer.sendMessage('close-notification', -1);

  const completeTask = (taskReminderPair: TaskScheduledReminderPair) => {
    setTaskReminderPairs(taskReminderPairs.filter(e => e !== taskReminderPair));

    window.electron.ipcRenderer.sendMessage('complete-task', {
      task: taskReminderPair.task,
      scheduledReminderIndex: taskReminderPair.scheduledReminderIndex,
    });

    if (taskReminderPairs.length === 1) closeNotification();
  };

  return (
    <div id="groupNotification">
      <div id="titlebar">
        <p id="notificationTitle">{`${taskReminderPairs.length} Missed Reminders`}</p>
        <button
          type="button"
          id="notificationCloseButton"
          title="Close Notification"
          onClick={closeNotification}
        >
          <img
            src={closeButtonIcon}
            alt="Close Notification"
            className="ignore-cursor"
            draggable="false"
          />
        </button>
      </div>
      <div id="notifsContainer">
        {taskReminderPairs.map(taskReminderPair => {
          const reminderId =
            taskReminderPair.task.scheduledReminders[taskReminderPair.scheduledReminderIndex].id;
          const key = `${taskReminderPair.task.creationTime}-${reminderId}`;

          return (
            <ReminderListElement
              key={key}
              task={taskReminderPair.task}
              reminderIdx={taskReminderPair.scheduledReminderIndex}
              settings={settings}
              onComplete={() => completeTask(taskReminderPair)}
            />
          );
        })}
      </div>
    </div>
  );
};

export function GroupNotificationWindow() {
  return <GroupNotificationWindowContents />;
}
