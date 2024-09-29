import { renderWithProviders, setupTestStore } from '@mocks/store-utils';
import { mockMenuState, mockTaskListState, testTask } from '@mocks/testObjs';
import { createDefaultSettings, DateFormat, ScheduledReminder, setDate } from '@remindr/shared';
import store from '@renderer/app/store';
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TaskManagementPage } from './TaskManagementPage';

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
