import type { Link } from '../../link.js';
import type { ScheduledReminder } from './scheduledReminder.js';
import type { Subtask } from './subtask.js';

/**
 * @param name
 * @param scheduledReminders An array of `ScheduledReminder` objects containing all scheduled reminders for a certain task
 * @param creationTime The creation time of the task in milliseconds.
 * @param group
 * @param reminderNotes
 */
export class Task {
  name: string;

  /** The scheduled reminders for a task ordered by time. Most recent is earliest in array. (E.g. A reminder due in an hour is index 0 while a reminder due in two hours is index 1 if both are attached to the same task.) */
  scheduledReminders: ScheduledReminder[];

  subtasks: Subtask[];

  creationTime: number;

  completionTime: number;

  links: Link[];

  notes: string;

  pinned: boolean;

  completed: boolean;

  /**
   * The idx of the column the task is in. Mapping from idx to column name can be found in `@shared/constants`
   */
  columnIdx: number | undefined;

  /**
   * The order of the task in the column. Is -1 if the task is not in a column.
   */
  orderInTaskColumn: number;

  constructor(
    name: string,
    scheduledReminders?: ScheduledReminder[],
    subtasks?: Subtask[],
    creationTime?: number,
    completionTime?: number,
    links?: Link[],
    notes?: string,
  ) {
    this.name = name;
    this.scheduledReminders = scheduledReminders ?? [];
    this.subtasks = subtasks ?? [];
    this.creationTime = creationTime ?? new Date().getTime();
    this.completionTime = completionTime ?? -1;
    this.links = links ?? [];
    this.notes = notes ?? '';

    this.pinned = false;
    this.completed = false;

    this.columnIdx = undefined;
    this.orderInTaskColumn = -1;
  }
}
