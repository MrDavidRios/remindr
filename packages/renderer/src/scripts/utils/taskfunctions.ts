import {
  Task,
  Repeat,
  getReminderDate,
  setDate,
  sortReminders,
  ScheduledReminder,
  generateUniqueID,
  getDate,
} from '@remindr/shared';
import getNextRepeatDate from './repeatHelper';

export function taskHasNotes(task: Task): boolean {
  if (task.notes?.trim().length > 0) return true;

  return false;
}

export function isTaskSelected(task: Task, selectedTasks: Task[]): boolean {
  return selectedTasks.some((e) => e.creationTime === task.creationTime);
}

export function saveTaskData(taskList: Task[]) {
  window.data.saveData('tasks', JSON.stringify(taskList));
}

export function postponeTask(task: Task, minutes: number, idx = 0): Task {
  if (!task.scheduledReminders[idx]) return task;

  const taskToReturn = JSON.parse(JSON.stringify(task));
  const reminder = taskToReturn.scheduledReminders[idx];

  /**
   * If reminder does not repeat:
   *
   * 1. Snooze reminder date
   * 2. Return taskToReturn
   */
  if (reminder.repeat === Repeat["Don't Repeat"]) {
    const snoozedDate = getReminderDate(reminder);
    snoozedDate.setMinutes(snoozedDate.getMinutes() + minutes);
    taskToReturn.scheduledReminders[idx] = setDate(taskToReturn.scheduledReminders[idx], snoozedDate);
    taskToReturn.scheduledReminders = sortReminders(taskToReturn.scheduledReminders);

    return taskToReturn;
  }

  /**
   * If reminder repeats:
   *
   * 1. Duplicate reminder
   * 2. Set original reminder to next occurence
   * 3. Cache duplicated reminder date
   * 4. Set duplicated reminder to never repeat
   * 5. Snooze duplicated reminder date
   * 6. Return taskToReturn
   *
   */
  let duplicatedReminder: ScheduledReminder = JSON.parse(JSON.stringify(taskToReturn.scheduledReminders[idx]));
  duplicatedReminder.repeat = Repeat["Don't Repeat"];

  // Set original reminder to next occurrence
  let originalReminder = JSON.parse(JSON.stringify(taskToReturn.scheduledReminders[idx]));
  originalReminder = setDate(originalReminder, getNextRepeatDate(originalReminder));
  taskToReturn.scheduledReminders[idx] = originalReminder;

  // Snooze duplicated reminder date
  const snoozedDate = getReminderDate(duplicatedReminder);
  snoozedDate.setMinutes(snoozedDate.getMinutes() + minutes);
  duplicatedReminder = setDate(duplicatedReminder, snoozedDate);
  duplicatedReminder.id = generateUniqueID();

  // If the duplicated reminder is at the same time of the original reminder's next occurrence, don't add it
  if (getDate(duplicatedReminder).getTime() === getDate(originalReminder).getTime()) return taskToReturn;

  taskToReturn.scheduledReminders.push(duplicatedReminder);

  // Sort reminders
  taskToReturn.scheduledReminders = sortReminders(taskToReturn.scheduledReminders);

  return taskToReturn;
}

export function taskHasRecurringReminders(task: Task): boolean {
  return task.scheduledReminders.some((e) => e.repeat !== Repeat["Don't Repeat"]);
}
