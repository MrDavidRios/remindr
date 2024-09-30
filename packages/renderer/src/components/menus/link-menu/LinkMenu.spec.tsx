import { renderWithProviders } from '@mocks/store-utils';
import { mockMenuState, mockTaskListState, testTask } from '@mocks/testObjs';
import { createDefaultSettings, Menu } from '@remindr/shared';
import { RootState } from '@renderer/app/store';
import { TaskModificationState } from '@renderer/features/task-modification/taskModificationSlice';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { LinkMenu } from './LinkMenu';

describe('Link Menu', () => {
  const editedTask = { ...testTask, name: 'Edited Task' };

  const renderWithStateOverrides = (taskModificationStateOverrides: Partial<TaskModificationState>) => {
    const state: Partial<RootState> = {
      menuState: { ...mockMenuState, openMenus: [Menu.LinkMenu] },
      taskList: mockTaskListState,
      taskModificationState: {
        taskEditState: { originalTask: testTask, editedTask: editedTask },
        taskCreationState: { originalTask: testTask, editedTask: editedTask },
        reminderEditState: { idx: 0, state: 'edit' },
        linkEditState: { idx: 0, state: 'edit' },
        lastEditType: 'edit',
        ...taskModificationStateOverrides,
      },
      settings: { value: createDefaultSettings(), syncOnline: false },
    };

    renderWithProviders(<LinkMenu />, undefined, state);
  };

  afterEach(() => {
    cleanup();
  });

  test('Should show edit link in title if editing link', () => {
    renderWithStateOverrides({});

    expect(screen.getByText('Edit Link')).toBeTruthy();
  });

  test('Should show add link in title if creating link', () => {
    renderWithStateOverrides({ linkEditState: { idx: 0, state: 'create' } });

    expect(screen.getByText('Add Link')).toBeTruthy();
  });
});
