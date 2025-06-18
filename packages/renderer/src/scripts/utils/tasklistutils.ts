import { Task, getDate, isOverdue } from "@remindr/shared";
import { getEarliestReminder } from "@remindr/shared/src";
import _ from "lodash";

export function getOverdueAmount(taskList: Task[]) {
  return _.filter(taskList, (task: Task) => {
    if (task.completed) return false;

    return task.scheduledReminders.length === 0
      ? false
      : isOverdue(task.scheduledReminders[0]);
  }).length;
}

export function getTaskIdx(task: Task | undefined, taskList: Task[]) {
  if (task === undefined) return -1;

  return _.findIndex(taskList, (t) => t.creationTime === task.creationTime);
}

export function getTaskFromList(task: Task, taskList: Task[]) {
  return _.find(taskList, (t) => t.creationTime === task.creationTime);
}

export function tasksInSameOrder(taskList1: Task[], taskList2: Task[]) {
  if (taskList1.length !== taskList2.length) return false;

  for (let i = 0; i < taskList1.length; i++) {
    if (taskList1[i].creationTime !== taskList2[i].creationTime) {
      return false;
    }
  }

  return true;
}

/**
 * Get the idx of the task in sorted order if it were to be inserted in the array
 * @param task
 * @param taskList
 * @returns
 */
export function getIdxInTaskList(task: Task, taskList: Task[]) {
  if (task.scheduledReminders.length === 0) return 0;

  let idx = 0;
  const taskReminderDate = getDate(getEarliestReminder(task));

  for (const taskCandidate of taskList) {
    if (taskCandidate.scheduledReminders.length === 0) continue;

    const earliestReminder = getEarliestReminder(taskCandidate);

    if (getDate(earliestReminder) >= taskReminderDate) return idx;

    idx++;
  }

  return idx;
}
