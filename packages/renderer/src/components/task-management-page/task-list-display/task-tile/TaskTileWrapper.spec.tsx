import { renderWithProviders, setupTestStore } from '@mocks/store-utils';
import { mockMenuState, mockTaskListState, testTask } from '@mocks/testObjs';
import { createDefaultSettings, Link, LinkType, ScheduledReminder, setDate, Subtask, Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { TaskTileWrapper } from './TaskTileWrapper';

describe('Task Tile Wrapper', () => {
  const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
  const editedTask = { ...testTask, name: 'Edited Task' };
  editedTask.scheduledReminders = [JSON.parse(JSON.stringify(testScheduledReminder))];

  const mockStoreAndRender = (selectedTasks: Task[], mockTask = testTask) => {
    const taskListState = { ...mockTaskListState, selectedTasks };

    const mockedStore = setupTestStore({
      menuState: mockMenuState,
      taskList: taskListState,
      settings: { value: createDefaultSettings(), syncOnline: false },
    });
    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());

    renderWithProviders(<TaskTileWrapper task={mockTask} reorderable={false} />, undefined, {
      menuState: mockMenuState,
      taskList: taskListState,
    });
  };

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  test('should show as selected if in selected tasks', () => {
    mockStoreAndRender([testTask]);

    const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
    expect(taskTileWrapper?.classList.contains('selected')).toBeTruthy();
  });

  test('should show as normal (unselected) if not in selected tasks', () => {
    mockStoreAndRender([]);

    const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
    expect(taskTileWrapper?.classList.contains('selected')).toBeFalsy();
  });

  test('should have completed class if task is completed', () => {
    const mockTask: Task = { ...testTask, completed: true };
    mockStoreAndRender([mockTask], mockTask);

    const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
    expect(taskTileWrapper?.classList.contains('completed')).toBeTruthy();
  });

  test('should not have completed class if task is incomplete', () => {
    mockStoreAndRender([]);

    const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
    expect(taskTileWrapper?.classList.contains('completed')).not.toBeTruthy();
  });

  describe('hasIndicators', () => {
    test('should have no attributes class if task has no indicators', () => {
      mockStoreAndRender([]);

      const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
      expect(taskTileWrapper?.classList.contains('task-tile-no-attributes')).toBeTruthy();
    });

    test('should not have no attributes class if task has reminders', () => {
      const mockTask: Task = { ...testTask, scheduledReminders: [testScheduledReminder] };
      mockStoreAndRender([], mockTask);

      const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
      expect(taskTileWrapper?.classList.contains('task-tile-no-attributes')).not.toBeTruthy();
    });

    test('should not have no attributes class if task has notes', () => {
      const mockTask: Task = { ...testTask, notes: 'Test notes' };
      mockStoreAndRender([], mockTask);

      const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
      expect(taskTileWrapper?.classList.contains('task-tile-no-attributes')).not.toBeTruthy();
    });

    test('should not have no attributes class if task repeats', () => {
      const mockTask: Task = { ...testTask, scheduledReminders: [testScheduledReminder] };
      mockStoreAndRender([], mockTask);

      const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
      expect(taskTileWrapper?.classList.contains('task-tile-no-attributes')).not.toBeTruthy();
    });

    test('should not have no attributes class if task has subtasks', () => {
      const mockTask: Task = { ...testTask, subtasks: [new Subtask('test subtask')] };
      mockStoreAndRender([], mockTask);

      const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
      expect(taskTileWrapper?.classList.contains('task-tile-no-attributes')).not.toBeTruthy();
    });

    test('should not have no attributes class if task has links', () => {
      const testLink: Link = { url: 'test url', title: 'test title', type: LinkType.Webpage, id: 0, faviconURL: '' };
      const mockTask: Task = { ...testTask, links: [testLink] };
      mockStoreAndRender([], mockTask);

      const taskTileWrapper = screen.getByText('Test Task').parentElement?.parentElement;
      expect(taskTileWrapper?.classList.contains('task-tile-no-attributes')).not.toBeTruthy();
    });
  });
});
