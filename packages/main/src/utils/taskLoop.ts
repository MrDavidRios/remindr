import { isCurrentMinute, type Task } from '@remindr/shared';
import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import { notify } from '/@/notifications.js';
import { isBetweenDates, isOverdue, taskHasReminders } from '/@/utils/reminderfunctions.js';

const store = new Store();

// eslint-disable-next-line no-undef
let taskLoopInterval: NodeJS.Timeout;
export function initializeTaskLoop(mainWindow: BrowserWindow): void {
  if (taskLoopInterval) return;

  checkForReminders(mainWindow);

  // Wait until the start of the next minute to begin the setInterval for checking of reminders
  const now = new Date();
  const nextMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1,
    0,
    0,
  );
  const delay = nextMinute.getTime() - now.getTime();

  taskLoopInterval = setTimeout(() => {
    // Check for reminders at the end of this current minute, and then every minute after that
    checkForReminders(mainWindow);
    setInterval(checkForReminders, 60000);
  }, delay);
}

function checkForReminders(mainWindow: BrowserWindow): void {
  let wasIdle = false;

  // Trigger re-render
  (mainWindow ?? BrowserWindow.getFocusedWindow())?.webContents.send('task-display-outdated');

  if (getLastCheckTime()) {
    const timeDifference = new Date().getTime() - getLastCheckTime().getTime();

    // If computer was idle for three minutes, check for missed reminders
    if (timeDifference > 60000) {
      wasIdle = true;
    } else {
      // Computer was not idle
    }
  }

  // TODO: Possible optimization: Only loop through reminders that are set for today (this list should be updated every time we make a call to midnight operations)

  // Check for reminders
  const taskList: Task[] = (store.get('task-list-current') as Task[]) ?? [];
  const uncompletedTasks = taskList.filter((task: Task) => !task.completed);

  for (let i = 0; i < uncompletedTasks.length; i++) {
    const task = uncompletedTasks[i];

    // eslint-disable-next-line no-continue
    if (!taskHasReminders(task)) continue;

    for (let j = 0; j < task.scheduledReminders.length; j++) {
      const scheduledReminder = task.scheduledReminders[j];

      if (isCurrentMinute(scheduledReminder)) {
        if (scheduledReminder.repeat) {
          (mainWindow ?? BrowserWindow.getFocusedWindow())?.webContents.send(
            'advance-recurring-reminder',
            {
              task,
              index: j,
            },
          );
        }

        notify(JSON.stringify(task), j);
        // eslint-disable-next-line no-continue
        continue;
      }

      // Trigger reminder even if Remindr wasn't open during the reminder time
      if (
        wasIdle &&
        isOverdue(scheduledReminder) &&
        isBetweenDates(scheduledReminder, getLastCheckTime(), new Date())
      ) {
        notify(JSON.stringify(task), j);
      }
    }
  }

  updateLastCheckTime();
}

function updateLastCheckTime(): void {
  store.set('last-check-time', new Date());
}

/**
 * @returns The last time the app checked for reminders.
 */
function getLastCheckTime(): Date {
  return new Date(store.get('last-check-time') as string);
}
