import { Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { getIpcRendererOutput } from '../../utils/ipcRendererOutput';
import { formatMinute, milToStandardHour } from '../../utils/timefunctions';

export function initNativeNotificationListener() {
  window.electron.ipcRenderer.on('deploy-native-notification', (e: unknown) => {
    const militaryTime = store.getState().settings.value.militaryTime ?? false;

    const { task, index } = getIpcRendererOutput(e) as { task: Task; index: number };
    const reminder = task.scheduledReminders[index];

    let body = `${milToStandardHour(reminder.reminderHour)}:${formatMinute(reminder.reminderMinute)} ${
      reminder.reminderMeridiem
    }`;
    if (militaryTime) {
      body = `${task.scheduledReminders[index].reminderHour}:${formatMinute(
        task.scheduledReminders[index].reminderMinute,
      )}`;
    }

    const notification = new Notification(task.name, { body });
    notification.onclick = () => {
      // open reminder
      window.mainWindow.webContents.sendMessage('open-reminder-in-edit-menu', { task, index });
    };
  });
}
