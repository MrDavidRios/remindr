import { setupTestStore } from '@mocks/store-utils';
import { mockTaskListState, testTask } from '@mocks/testObjs';
import { Task } from '@remindr/shared';
import store, { AppDispatch } from '@renderer/app/store';
import { updateTasks } from '@renderer/features/task-list/taskListSlice';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initTaskColumnShiftListeners, shiftTaskColumns } from './shiftTaskColumns';

describe('shiftTaskColumns', () => {
  const todayTask: Task = { ...testTask, columnIdx: 0 };
  const yesterdayTask: Task = { ...testTask, columnIdx: -1 };
  const uncategorizedTask: Task = { ...testTask };

  beforeEach(() => {
    const mockedStore = setupTestStore({
      taskList: {
        ...mockTaskListState,
        value: [todayTask, yesterdayTask, uncategorizedTask],
      },
    });

    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());
  });

  it('should shift task columns by the given number of days', () => {
    const dispatch = vi.fn();
    initTaskColumnShiftListeners(dispatch as any as AppDispatch);
    shiftTaskColumns(2);

    expect(store.getState).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      updateTasks([
        { ...todayTask, columnIdx: -2 },
        { ...yesterdayTask, columnIdx: -3 },
      ]),
    );
  });

  it('should throw an error if dispatch is not initialized', () => {
    initTaskColumnShiftListeners(undefined as any as AppDispatch);
    expect(() => shiftTaskColumns(2)).toThrow(ReferenceError);
  });
});
