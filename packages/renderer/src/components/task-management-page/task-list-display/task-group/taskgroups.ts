import { Task, getReminderDate } from '@remindr/shared';
import { isValidSearchString, searchTasks } from '@renderer/scripts/utils/searchutils';
import categorizeTaskByDate from '@renderer/scripts/utils/taskcategorization';

export function groupTasks(taskList: Task[]): Map<string, Task[]> {
  const taskGroups = new Map<string, Task[]>();

  const sortedTaskList = sortTasks(taskList);

  sortedTaskList.forEach((task) => {
    const group = getGroup(task);

    const correspondingTasks = taskGroups.get(group) ?? [];
    correspondingTasks.push(task);

    // Sort group
    const sortedTasks =
      group === 'Completed' ? sortByCompletionDate(correspondingTasks) : sortByDate(correspondingTasks);

    taskGroups.set(group, sortedTasks);
  });

  // Sort groups
  return sortGroups(taskGroups);
}

export function getTasksInGroup(taskList: Task[], group: string): Task[] {
  const taskGroups = groupTasks(taskList);
  return taskGroups.get(group) ?? [];
}

function getGroup(task: Task): string {
  if (task.completed) return 'Completed';

  if (task.pinned) return 'Pinned';

  if (task.scheduledReminders.length === 0) return 'To-do';

  // Has a reminder, categorize it by its date
  return categorizeTaskByDate(task);
}

export function sortTasks(taskList: Task[]) {
  // Put pinned tasks at the top
  const pinnedTasks = taskList.filter((task) => task.pinned);
  const unpinnedTasks = taskList.filter((task) => !task.pinned);

  // Sort the unpinned tasks
  unpinnedTasks.sort((a, b) => {
    if (a.scheduledReminders[0] === undefined) return 1;
    if (b.scheduledReminders[0] === undefined) return -1;

    const aDate = getReminderDate(a.scheduledReminders[0]);
    const bDate = getReminderDate(b.scheduledReminders[0]);

    return aDate.getTime() - bDate.getTime();
  });

  const sortedTaskList = pinnedTasks.concat(unpinnedTasks);

  return sortedTaskList;
}

function sortGroups(taskGroups: Map<string, Task[]>) {
  const taskGroupsArray = Array.from(taskGroups.entries());

  // Sort Order
  // =-=-=-=-=-=
  // Pinned > To-do > Overdue > Everything else > Completed
  taskGroupsArray.sort((a, b) => {
    if (a[0] === 'Pinned') return -1;
    if (b[0] === 'Pinned') return 1;
    if (a[0] === 'To-do') return -1;
    if (b[0] === 'To-do') return 1;
    if (a[0] === 'Overdue') return -1;
    if (b[0] === 'Overdue') return 1;
    // Put completed tasks at the bottom
    if (a[0] === 'Completed') return 1;
    if (b[0] === 'Completed') return -1;
    return 0;
  });

  // Convert the array back to a Map
  const sortedTaskGroups = new Map(taskGroupsArray);

  return sortedTaskGroups;
}

function sortByDate(taskList: Task[]) {
  if (taskList.length === 0) return taskList;

  return taskList.sort((a, b) => {
    if (a.scheduledReminders[0] === undefined) return 1;
    if (b.scheduledReminders[0] === undefined) return -1;

    const aDate = getReminderDate(a.scheduledReminders[0]);
    const bDate = getReminderDate(b.scheduledReminders[0]);

    return aDate.getTime() - bDate.getTime();
  });
}

function sortByCompletionDate(taskList: Task[]) {
  if (taskList.length === 0) return taskList;

  return taskList.sort((a, b) => {
    const aDate = a.completionTime ?? new Date(0);
    const bDate = b.completionTime ?? new Date(0);

    return bDate - aDate;
  });
}

/**
 * Sorts a list of tasks as they would appear on screen. Basically returns a flattened version of what you would get
 * from running groupTasks.
 * @param taskList
 */
export function sortForDisplay(taskList: Task[], searchQuery: string): Task[] {
  if (isValidSearchString(searchQuery)) {
    return searchTasks(taskList, searchQuery);
  }

  // run group tasks and flatten the result
  const taskGroups = groupTasks(taskList);
  const tasksOnScreen: Task[] = [];
  taskGroups.forEach((tasks) => {
    tasks.forEach((task) => {
      tasksOnScreen.push(task);
    });
  });

  return tasksOnScreen;
}
