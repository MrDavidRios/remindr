import { renderWithProviders } from '@mocks/store-utils';
import { mockMenuState, mockTaskListState, testTask } from '@mocks/testObjs';
import { ScheduledReminder, setDate, Task } from '@remindr/shared';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { TaskTileContents } from './TaskTileContents';

describe('Task Tile Wrapper', () => {
  const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
  const editedTask = { ...testTask, name: 'Edited Task' };
  editedTask.scheduledReminders = [JSON.parse(JSON.stringify(testScheduledReminder))];

  const renderTaskTile = (task: Task) => {
    renderWithProviders(<TaskTileContents task={task} />, undefined, {
      menuState: mockMenuState,
      taskList: mockTaskListState,
    });
  };

  afterEach(() => {
    cleanup();
  });

  test('should show task name', () => {
    renderTaskTile(testTask);

    expect(screen.getByText('Test Task')).toBeTruthy();
  });

  test('should show task notes icon if task has notes', () => {
    renderTaskTile({ ...testTask, notes: 'Test notes' });

    expect(screen.getByTitle('This task has notes')).toBeTruthy();
  });

  test('should not show task notes icon if task does not have notes', () => {
    renderTaskTile(testTask);

    expect(screen.queryByTitle('This task has notes')).toBeFalsy();
  });
});
