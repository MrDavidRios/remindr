import { ContextMenuType, MenuState, Task, Timeframe } from '@remindr/shared';
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

/**
 * Returns a mock TaskListState with prepopulated tasks.
 * @param tasks
 * @returns
 */
export const getMockTaskListState = (tasks: Task[]): TaskListState => {
  return { ...mockTaskListState, value: tasks };
};

export const mockMenuState: MenuState = {
  openMenus: [],
  dialogInfo: { title: undefined, message: '', options: [], result: undefined },
  openContextMenus: [],
  contextMenuPositions: {
    [ContextMenuType.TaskContextMenu]: { x: 0, y: 0 },
    [ContextMenuType.GeneralContextMenu]: { x: 0, y: 0 },
  },
  scheduledReminderEditorPosition: {
    anchor: { x: 0, y: 0, width: 0, height: 0 },
    yOffset: { topAnchored: 0, bottomAnchored: 0 },
    gap: 0,
  },
};
