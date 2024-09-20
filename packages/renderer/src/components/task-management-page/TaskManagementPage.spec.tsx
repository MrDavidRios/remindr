import { renderWithProviders, setupTestStore } from '@mocks/store-utils';
import { testTask } from '@mocks/testObjs';
import { createDefaultSettings, DateFormat, MenuState, ScheduledReminder, setDate, Timeframe } from '@remindr/shared';
import store from '@renderer/app/store';
import { TaskListState } from '@renderer/features/task-list/taskListSlice';
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TaskManagementPage } from './TaskManagementPage';

const mockMenuState: MenuState = {
  openMenus: [],
  dialogInfo: { title: undefined, message: '', options: [], result: undefined },
  scheduledReminderEditorPosition: {
    anchor: { x: 0, y: 0, width: 0, height: 0 },
    yOffset: { topAnchored: 0, bottomAnchored: 0 },
    gap: 0,
  },
};

const mockTaskListState: TaskListState = {
  value: [],
  taskListGetStatus: 'succeeded',
  timeframe: Timeframe.All,
  selectedTasks: [],
  searchQuery: '',
  taskListDisplayOutdated: false,
  lastSelectedTaskNoShift: undefined,
  lastTaskListAction: undefined,
};

describe('Task Management Page', () => {
  const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
  const editedTask = { ...testTask, name: 'Edited Task' };
  editedTask.scheduledReminders = [JSON.parse(JSON.stringify(testScheduledReminder))];

  beforeEach(async () => {
    const mockedStore = setupTestStore({
      menuState: mockMenuState,
      taskList: mockTaskListState,
      settings: { value: createDefaultSettings(), syncOnline: false },
    });
    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());

    renderWithProviders(
      <TaskManagementPage />,
      { dateFormat: DateFormat.YMDNumeric },
      {
        menuState: mockMenuState,
        taskList: mockTaskListState,
      },
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should render all tasks heading', () => {
    expect(screen.getByText('All Tasks')).toBeTruthy();
  });
});
