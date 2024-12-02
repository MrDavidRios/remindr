import { PayloadAction } from '@reduxjs/toolkit';
import {
  generateUniqueID,
  getNextRepeatDate,
  getTaskColumnIdx,
  Repeat,
  ScheduledReminder,
  setDate,
  sortReminders,
  Task,
  taskHasRecurringReminders,
} from '@remindr/shared';
import { getIdxInTaskList, getTaskIdx } from '@renderer/scripts/utils/tasklistutils';
import _ from 'lodash';
import { TaskListState } from './taskListSlice';

export const addTaskReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>>,
  saveData: (taskList: Task[]) => void,
) => {
  // set task column idx
  const taskClone: Task = JSON.parse(JSON.stringify(action.payload));
  const incompleteTasksInColumn = state.value.filter(
    (task) => task.columnIdx === getTaskColumnIdx(action.payload) && !task.completed,
  );
  taskClone.orderInTaskColumn = getIdxInTaskList(taskClone, incompleteTasksInColumn);

  state.value.push(taskClone);
  state.lastTaskListAction = { type: 'add', task: taskClone, undone: false };
  saveData(state.value);
};

export const removeTaskReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>>,
  saveData: (taskList: Task[]) => void,
) => {
  const taskIdx = getTaskIdx(action.payload, state.value);
  state.value.splice(taskIdx, 1);

  state.lastTaskListAction = { type: 'remove', task: action.payload, undone: false };
  saveData(state.value);
};

export const updateTaskReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>>,
  saveData: (taskList: Task[]) => void,
) => {
  const taskIdx = getTaskIdx(action.payload, state.value);

  const oldTaskState: Task = JSON.parse(JSON.stringify(state.value[taskIdx]));

  // Don't do anything if no changes were made
  if (_.isEqual(oldTaskState, action.payload)) {
    return;
  }

  state.value[taskIdx] = action.payload;
  state.lastTaskListAction = { type: 'update', task: oldTaskState, undone: false };
  saveData(state.value);
};

export const completeTaskReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>>,
  saveData: (taskList: Task[]) => void,
) => {
  const taskIdx = getTaskIdx(action.payload, state.value);
  const task = action.payload;
  const hasRecurringReminders = taskHasRecurringReminders(task);

  // If the task is selected, de-select it
  if (getTaskIdx(task, state.selectedTasks) > -1) _.remove(state.selectedTasks, task);

  if (!hasRecurringReminders) {
    // If the task doesn't have recurring reminders, just remove it
    state.value[taskIdx].completed = true;
    state.value[taskIdx].completionTime = new Date().getTime();
    state.lastTaskListAction = { type: 'complete', task, undone: false };
    saveData(state.value);
    return;
  }

  // Clone reminder
  const scheduledReminderClone = JSON.parse(JSON.stringify(task.scheduledReminders[0])) as ScheduledReminder;

  // If the task has recurring reminders, advance the reminders and keep the task

  // Incomplete task
  if (task.scheduledReminders[0].repeat === Repeat["Don't Repeat"]) {
    // If the current reminder doesn't repeat, remove it from the uncompleted task
    state.value[taskIdx].scheduledReminders.splice(0, 1);
  } else {
    const firstScheduledReminder = JSON.parse(JSON.stringify(task.scheduledReminders[0]));
    const advancedScheduledReminder = setDate(firstScheduledReminder, getNextRepeatDate(firstScheduledReminder));
    advancedScheduledReminder.id = generateUniqueID();

    // Advance recurring reminder
    state.value[taskIdx].scheduledReminders.splice(0, 1);
    state.value[taskIdx].scheduledReminders.push(advancedScheduledReminder);
    state.value[taskIdx].scheduledReminders = sortReminders(state.value[taskIdx].scheduledReminders);
  }

  /*
   * Completed task
   * ===
   * 1. Clone the task
   * 2. Set the only reminder to be the reminder that was advanced/deleted (depending on whether or not it was recurring)
   *     - Make sure it's not recurring anymore
   * 3. Mark the task complete
   */
  const completedTask = JSON.parse(JSON.stringify(task)) as Task;
  completedTask.creationTime = new Date().getTime();
  scheduledReminderClone.repeat = Repeat["Don't Repeat"];
  completedTask.scheduledReminders = [scheduledReminderClone];
  completedTask.completed = true;
  completedTask.completionTime = new Date().getTime();
  state.value.push(completedTask);

  state.lastTaskListAction = {
    type: 'complete-recurring',
    task,
    undone: false,
    relatedTaskId: completedTask.creationTime,
  };
  saveData(state.value);
};

export const markTaskIncompleteReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>>,
  saveData: (taskList: Task[]) => void,
) => {
  const taskIdx = getTaskIdx(action.payload, state.value);
  const task = action.payload;

  // If the task is selected, de-select it
  if (getTaskIdx(task, state.selectedTasks) > -1) _.remove(state.selectedTasks, task);

  // It is assumed that recurring reminders won't need any special treatment when marking tasks as incomplete.
  state.value[taskIdx].completed = false;
  state.value[taskIdx].completionTime = -1;
  state.lastTaskListAction = { type: 'markIncomplete', task, undone: false };
  saveData(state.value);
};

export const duplicateTaskReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>>,
  saveData: (taskList: Task[]) => void,
) => {
  const clone = JSON.parse(JSON.stringify(action.payload));
  clone.creationTime = Date.now();

  state.value.push(clone);

  state.lastTaskListAction = { type: 'duplicate', task: action.payload, undone: false };
  saveData(state.value);
};

export const removeTasksReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>[]>,
  saveData: (taskList: Task[]) => void,
) => {
  action.payload.forEach((task) => {
    const taskIdx = getTaskIdx(task, state.value);
    state.value.splice(taskIdx, 1);
  });

  saveData(state.value);
};

export const duplicateTasksReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>[]>,
  saveData: (taskList: Task[]) => void,
) => {
  action.payload.forEach((task, idx) => {
    const clone = JSON.parse(JSON.stringify(task));

    // Add idx so multiple tasks don't get the same creation time
    clone.creationTime = Date.now() + idx;

    state.value.push(clone);
  });

  saveData(state.value);
};

export const pinTasksReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>[]>,
  saveData: (taskList: Task[]) => void,
) => {
  action.payload.forEach((task) => {
    const taskIdx = getTaskIdx(task, state.value);
    state.value[taskIdx].pinned = true;
  });

  saveData(state.value);
};

export const unpinTasksReducer = (
  state: TaskListState,
  action: PayloadAction<InstanceType<typeof Task>[]>,
  saveData: (taskList: Task[]) => void,
) => {
  action.payload.forEach((task) => {
    const taskIdx = getTaskIdx(task, state.value);
    state.value[taskIdx].pinned = false;
  });

  saveData(state.value);
};
