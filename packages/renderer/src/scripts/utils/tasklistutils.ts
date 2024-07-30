import _ from 'lodash';
import Task from 'main/types/classes/task/task';
import { isOverdue } from '../../../main/utils/reminderfunctions';

export function getOverdueAmount(taskList: Task[]) {
  return _.filter(taskList, (task: Task) => {
    if (task.completed) return false;

    return task.scheduledReminders.length === 0 ? false : isOverdue(task.scheduledReminders[0]);
  }).length;
}

export function getTaskIdx(task: Task, taskList: Task[]) {
  return _.findIndex(taskList, (t) => t.creationTime === task.creationTime);
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
