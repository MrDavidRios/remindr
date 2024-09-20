import { Task, Timeframe } from '@remindr/shared';
import { TaskListState } from '@renderer/features/task-list/taskListSlice';

export const testTask: Task = JSON.parse(JSON.stringify(new Task('Test Task')));

export const mockTaskListState: TaskListState = {
  value: [],
  taskListGetStatus: 'succeeded',
  timeframe: Timeframe.All,
  selectedTasks: [],
  searchQuery: '',
  taskListDisplayOutdated: false,
  lastSelectedTaskNoShift: undefined,
  lastTaskListAction: undefined,
};
