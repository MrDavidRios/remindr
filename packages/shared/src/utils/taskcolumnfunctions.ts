import { getDate, getDaysBetweenDates, isOverdue } from '../index.js';
import { ScheduledReminder, Task } from '../types/index.js';

/**
 * Sets the task column idx for a task based on its earliest non-overdue reminder date.
 *
 * If the task already has a column idx assigned, it will return the same idx, as once assigned,
 * it should only be directly modifiable by the user.
 * @param task
 * @returns
 */
export const getTaskColumnIdx = (task: Task): number | undefined => {
  if (task.columnIdx !== undefined) return task.columnIdx;

  // If a task has no scheduled reminders, don't give it a column id.
  if (task.scheduledReminders.length === 0) return undefined;

  let relevantReminder: ScheduledReminder;

  // If all of a task's scheduled reminders are overdue, base the column id off of the latest overdue reminder.
  const nonOverdueRemiders = task.scheduledReminders.filter((r) => !isOverdue(r));

  const lastReminderIdx = task.scheduledReminders.length - 1;
  if (nonOverdueRemiders.length === 0) relevantReminder = task.scheduledReminders[lastReminderIdx];
  else relevantReminder = task.scheduledReminders[0];

  const reminderDate = getDate(relevantReminder);
  let dayDiff = getDaysBetweenDates(new Date(), reminderDate);
  if (reminderDate < new Date() && Math.abs(dayDiff) !== 0) dayDiff *= -1;

  return dayDiff;
};

export const columnTasksInDifferentOrder = (taskListA: Task[], taskListB: Task[]): boolean => {
  for (const taskA of taskListA) {
    const taskB = taskListB.find((t) => t.creationTime === taskA.creationTime);

    if (taskA.orderInTaskColumn !== taskB?.orderInTaskColumn) {
      return true;
    }
  }

  return false;
};
