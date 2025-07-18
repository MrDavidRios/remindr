import _ from "lodash";
import { Repeat } from "../types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../types/classes/task/scheduledReminder.js";
import { Task } from "../types/classes/task/task.js";
import { getReminderDate } from "./datefunctions.js";
import { generateUniqueID } from "./idutils.js";
import { getNextRepeatDate } from "./repeatutils/getnextrepeatdate.js";
import { reminderRepeats } from "./repeatutils/repeatutils.js";
import {
  getDate,
  setDate,
  sortReminders,
} from "./scheduledreminderfunctions.js";
import { getTaskColumnIdx } from "./taskcolumnfunctions.js";

export function taskHasReminders(task: Task): boolean {
  return task.scheduledReminders.length > 0;
}

export function taskHasNotes(task: Task): boolean {
  if (task.notes?.trim().length > 0) return true;

  return false;
}

export function isTaskSelected(task: Task, selectedTasks: Task[]): boolean {
  return selectedTasks.some((e) => e.creationTime === task.creationTime);
}

export function postponeTask(task: Task, minutes: number, idx = 0): Task {
  if (!task.scheduledReminders[idx]) return task;

  const taskToReturn: Task = JSON.parse(JSON.stringify(task));
  const reminder = taskToReturn.scheduledReminders[idx];

  /**
   * If reminder does not repeat:
   *
   * 1. Snooze reminder date
   * 2. Return taskToReturn
   */
  if (!reminderRepeats(reminder)) {
    const snoozedDate = getReminderDate(reminder);
    snoozedDate.setMinutes(snoozedDate.getMinutes() + minutes);
    taskToReturn.scheduledReminders[idx] = setDate(
      taskToReturn.scheduledReminders[idx],
      snoozedDate
    );
    taskToReturn.scheduledReminders = sortReminders(
      taskToReturn.scheduledReminders
    );
    taskToReturn.columnIdx = getTaskColumnIdx(taskToReturn);

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
  let duplicatedReminder: ScheduledReminder = JSON.parse(
    JSON.stringify(taskToReturn.scheduledReminders[idx])
  );
  duplicatedReminder.repeat = Repeat.NoRepeat;

  // Set original reminder to next occurrence
  let originalReminder = JSON.parse(
    JSON.stringify(taskToReturn.scheduledReminders[idx])
  );
  originalReminder = setDate(
    originalReminder,
    getNextRepeatDate(originalReminder)
  );
  taskToReturn.scheduledReminders[idx] = originalReminder;

  // Snooze duplicated reminder date
  const snoozedDate = getReminderDate(duplicatedReminder);
  snoozedDate.setMinutes(snoozedDate.getMinutes() + minutes);
  duplicatedReminder = setDate(duplicatedReminder, snoozedDate);
  duplicatedReminder.id = generateUniqueID();

  // If the duplicated reminder is at the same time of the original reminder's next occurrence, don't add it
  if (
    getDate(duplicatedReminder).getTime() ===
    getDate(originalReminder).getTime()
  )
    return taskToReturn;

  taskToReturn.scheduledReminders.push(duplicatedReminder);

  taskToReturn.scheduledReminders = sortReminders(
    taskToReturn.scheduledReminders
  );
  taskToReturn.columnIdx = getTaskColumnIdx(taskToReturn);

  return taskToReturn;
}

export function taskHasRecurringReminders(task: Task): boolean {
  return task.scheduledReminders.some((e) => e.repeat !== Repeat.NoRepeat);
}

export function getEarliestReminder(task: Task): ScheduledReminder {
  if (task.scheduledReminders.length === 0) {
    throw new Error("Task has no reminders");
  }

  const sortedReminders = sortReminders(task.scheduledReminders);
  return sortedReminders[0];
}

export function isTaskInList(task: Task, taskList: Task[]) {
  if (taskList.length === 0) return false;

  return (
    _.find(taskList, (t) => t.creationTime === task.creationTime) !== undefined
  );
}

export function isSameTask(task1: Task, task2: Task) {
  return task1.creationTime === task2.creationTime;
}
