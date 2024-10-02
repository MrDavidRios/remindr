import { capitalizeFirstLetter, isOverdue, isReminderToday } from '../index.js';
import { ScheduledReminder, Task } from '../types/index.js';

/**
 * Sets the task column id for a task based on its earliest non-overdue reminder date.
 *
 * If the task already has a column id assigned, it will return the same id, as once assigned,
 * it should only be directly modifiable by the user.
 * @param task
 * @returns
 */
export const getTaskColumnId = (task: Task): string => {
  if (task.taskColumnId !== undefined && task.taskColumnId !== '') return task.taskColumnId;

  // If a task has no scheduled reminders, don't give it a column id.
  if (task.scheduledReminders.length === 0) return '';

  let relevantReminder: ScheduledReminder;

  // If all of a task's scheduled reminders are overdue, base the column id off of the latest overdue reminder.
  const nonOverdueRemiders = task.scheduledReminders.filter((r) => !isOverdue(r));

  const lastReminderIdx = task.scheduledReminders.length - 1;
  if (nonOverdueRemiders.length === 0) relevantReminder = task.scheduledReminders[lastReminderIdx];
  else relevantReminder = task.scheduledReminders[0];

  const { reminderToday, adjacentDay } = isReminderToday(relevantReminder, true) as {
    reminderToday: boolean;
    adjacentDay: string;
  };

  if (reminderToday) return 'Today';

  return capitalizeFirstLetter(adjacentDay);
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
