import _ from 'lodash';
import Task from 'main/types/classes/task/task';
import { getReminderDate } from 'main/utils/datefunctions';

export function isValidSearchString(str: string) {
  return str.length > 0;
}

export function searchTasks(tasks: Task[], searchQuery: string): Task[] {
  const searchResultsByName = tasks.filter((task) => task.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const searchResultsByNotes = tasks.filter((task) => task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
  const searchResultsBySubtasks = tasks.filter((task) =>
    task.subtasks?.some((subtask) => subtask.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );
  const searchResultsByLinkTitles = tasks.filter((task) =>
    task.links?.some((link) => link.title.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Combine search results making sure there's no duplicates
  const searchResultsAggregated = searchResultsByName
    .concat(searchResultsByNotes)
    .concat(searchResultsBySubtasks)
    .concat(searchResultsByLinkTitles);

  // Remove duplicates
  const searchResults = _.uniqBy(searchResultsAggregated, 'creationTime');
  const sortedTasks = sortSearchedTasks(searchResults);

  return sortedTasks;
}

function sortSearchedTasks(tasks: Task[]): Task[] {
  // Put completed tasks at the bottom
  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  incompleteTasks.sort((a, b) => {
    if (a.scheduledReminders[0] === undefined) return 1;
    if (b.scheduledReminders[0] === undefined) return -1;

    const aDate = getReminderDate(a.scheduledReminders[0]);
    const bDate = getReminderDate(b.scheduledReminders[0]);

    return aDate.getTime() - bDate.getTime();
  });

  const sortedTaskList = incompleteTasks.concat(completedTasks);

  return sortedTaskList;
}
