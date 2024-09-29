import { renderWithProviders, setupTestStore } from '@mocks/store-utils';
import { mockMenuState, mockTaskListState, testTask } from '@mocks/testObjs';
import { createDefaultSettings, ScheduledReminder, setDate, Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { TaskTileWrapper } from './TaskTileWrapper';

describe('Task Tile Wrapper', () => {
  const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
  const editedTask = { ...testTask, name: 'Edited Task' };
  editedTask.scheduledReminders = [JSON.parse(JSON.stringify(testScheduledReminder))];

  const mockStoreAndRender = (selectedTasks: Task[]) => {
    const taskListState = { ...mockTaskListState, selectedTasks };

    const mockedStore = setupTestStore({
      menuState: mockMenuState,
      taskList: taskListState,
      settings: { value: createDefaultSettings(), syncOnline: false },
    });
    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());

    renderWithProviders(<TaskTileWrapper task={testTask} reorderable={false} />, undefined, {
      menuState: mockMenuState,
      taskList: taskListState,
    });
  };

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  test('should show as selected if in selected tasks', async () => {
    mockStoreAndRender([testTask]);

    const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
    expect(taskTileWrapper?.classList.contains('selected')).toBeTruthy();
  });

  test('should show as normal (unselected) if not in selected tasks', () => {
    mockStoreAndRender([]);

    const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
    expect(taskTileWrapper?.classList.contains('selected')).toBeFalsy();
  });
});
