import {
  getDaysBetweenDates,
  getRepeatValue,
  isBetweenDates,
  isCurrentMinute,
  isOverdue,
  msUntilNextMinute,
  ScheduledReminder,
  taskHasReminders,
  type Task,
} from "@remindr/shared";
import Store from "electron-store";
import { notify } from "./notifications.js";
import { getMainWindow } from "./utils/getMainWindow.js";

const store = new Store();

// eslint-disable-next-line no-undef
let taskLoopInterval: NodeJS.Timeout;
export function initializeTaskLoop(): void {
  if (taskLoopInterval) return;

  checkForReminders();

  // Wait until the start of the next minute to begin the setInterval for checking of reminders
  const delay = msUntilNextMinute();

  taskLoopInterval = setTimeout(() => {
    // Check for reminders at the end of this current minute, and then every minute after that
    checkForReminders();
    setInterval(checkForReminders, 60000);
  }, delay);
}

/**
 * Things the app needs to do when the day has changed.
 */
function onDayChange(daysSinceLastCheck: number): void {
  // Go through tasks that have task column names of 'Yesterday', 'Today', and 'Tomorrow' and move them to the appropriate column

  getMainWindow()?.webContents.send("shift-task-columns", daysSinceLastCheck);
}

function checkForReminders(): void {
  let wasIdle = false;

  // Trigger re-render
  getMainWindow()?.webContents.send("update-task-display");

  const lastCheckTime = getLastCheckTime();
  if (lastCheckTime) {
    const timeDifference = new Date().getTime() - lastCheckTime.getTime();

    // If the day has changed between the last check time and now, calculate how many days and call onDayChange
    const daysSinceLastCheck = getDaysBetweenDates(lastCheckTime, new Date());
    if (daysSinceLastCheck > 0) onDayChange(daysSinceLastCheck);

    // If computer was idle for a minute, check for missed reminders
    if (timeDifference > 60000) {
      wasIdle = true;
    } else {
      // Computer was not idle
    }
  }

  // TODO: Possible optimization: Only loop through reminders that are set for today (this list should be updated every time we make a call to midnight operations)
  console.log(
    "(taskLoop) checked for notifications at",
    new Date().toLocaleTimeString()
  );

  // Check for reminders
  const taskList: Task[] = (store.get("task-list-current") as Task[]) ?? [];
  const incompleteTasksWithReminders = taskList.filter(
    (task: Task) => !task.completed && taskHasReminders(task)
  );

  for (const task of incompleteTasksWithReminders) {
    for (let j = 0; j < task.scheduledReminders.length; j++) {
      const scheduledReminder = task.scheduledReminders[j];

      if (isCurrentMinute(scheduledReminder)) {
        if (getRepeatValue(scheduledReminder.repeat)) {
          advanceRecurringReminder(task, j);
        }

        notify(JSON.stringify(task), j);
      }
      // Trigger reminder even if Remindr wasn't open during the reminder time
      else if (closedDuringReminderTime(scheduledReminder, wasIdle)) {
        notify(JSON.stringify(task), j);

        if (getRepeatValue(scheduledReminder.repeat)) {
          advanceRecurringReminder(task, j);
        }
      }
    }
  }

  updateLastCheckTime();
}

const advanceRecurringReminder = (task: Task, index: number) => {
  getMainWindow()?.webContents.send("advance-recurring-reminder", {
    task,
    index,
  });
};

const closedDuringReminderTime = (
  scheduledReminder: ScheduledReminder,
  wasIdle: boolean
) => {
  const passedSinceLastCheckTime = isBetweenDates(
    scheduledReminder,
    getLastCheckTime(),
    new Date()
  );

  return wasIdle && isOverdue(scheduledReminder) && passedSinceLastCheckTime;
};

function updateLastCheckTime(): void {
  store.set("last-check-time", new Date());
}

/**
 * @returns The last time the app checked for reminders.
 */
function getLastCheckTime(): Date {
  return new Date(store.get("last-check-time") as string);
}
