import { renderWithProviders, setupTestStore } from '@mocks/store-utils';
import { mockMenuState, mockTaskListState, testTask } from '@mocks/testObjs';
import { ContextMenuType, createDefaultSettings, MenuState, ScheduledReminder, setDate, Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { TaskContextMenu } from './TaskContextMenu';

describe('Task Context Menu', () => {
  const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
  const editedTask = { ...testTask, name: 'Edited Task' };
  editedTask.scheduledReminders = [JSON.parse(JSON.stringify(testScheduledReminder))];

  const mockStoreAndRender = (contextMenuTask: Task) => {
    const menuState: MenuState = {
      ...mockMenuState,
      openContextMenus: [ContextMenuType.TaskContextMenu],
      contextMenuTask,
    };

    const mockedStore = setupTestStore({
      menuState: menuState,
      taskList: mockTaskListState,
      settings: { value: createDefaultSettings(), syncOnline: false },
    });

    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());

    renderWithProviders(<TaskContextMenu />, undefined, {
      menuState: menuState,
      taskList: mockTaskListState,
    });
  };

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  test('should show pin button if task is unpinned', async () => {
    mockStoreAndRender({ ...testTask, pinned: false });

    const unpinButton = screen.queryByTitle('Unpin task (Ctrl + P)');
    const pinButton = screen.queryByTitle('Pin task (Ctrl + P)');
    expect(unpinButton).not.toBeInTheDocument();
    expect(pinButton).toBeInTheDocument();
  });

  test('should show unpin button if task is pinned', () => {
    mockStoreAndRender({ ...testTask, pinned: true });

    const unpinButton = screen.queryByTitle('Unpin task (Ctrl + P)');
    const pinButton = screen.queryByTitle('Pin task (Ctrl + P)');
    expect(unpinButton).toBeInTheDocument();
    expect(pinButton).not.toBeInTheDocument();
  });

  test('should show postpone dropdown if task has reminders', () => {
    mockStoreAndRender({ ...testTask, scheduledReminders: [new ScheduledReminder()] });

    const postponeDropdown = screen.getByTitle('Postpone reminder');
    expect(postponeDropdown).toBeInTheDocument();
  });

  test('should not show postpone dropdown if task has no reminders', () => {
    mockStoreAndRender({ ...testTask, scheduledReminders: [] });

    const postponeDropdown = screen.queryByTitle('Postpone reminder');
    expect(postponeDropdown).not.toBeInTheDocument();
  });
});
