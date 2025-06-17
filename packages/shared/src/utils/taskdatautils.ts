import _ from "lodash";
import { ScheduledReminder } from "../types/classes/task/scheduledReminder.js";
import { Subtask } from "../types/classes/task/subtask.js";
import { Task } from "../types/classes/task/task.js";

/**
 * Serializes a Task into a plain js object for Firestore to read.
 * @param task
 * @returns
 */
export const serializeTask = (task: Task): object => {
  const serializedTask: Task = {
    ..._.omit(task, ["scheduledReminders", "subtasks"]),
    scheduledReminders: [],
    subtasks: [],
  };

  serializedTask.scheduledReminders = task.scheduledReminders.map(
    (reminder: ScheduledReminder) => ({ ...reminder })
  );
  serializedTask.subtasks = task.subtasks.map((subtask: Subtask) => ({
    ...subtask,
  }));

  return serializedTask;
};
