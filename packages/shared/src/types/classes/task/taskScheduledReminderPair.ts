import type { Task } from './task.js';

/**
 * An object containing both a task and a scheduled reminder index. Used for scheduling notifications.
 */
export class TaskScheduledReminderPair {
  task: Task;

  scheduledReminderIndex: number;

  constructor(task: Task, scheduledReminderIndex: number) {
    this.task = task;
    this.scheduledReminderIndex = scheduledReminderIndex;
  }
}
