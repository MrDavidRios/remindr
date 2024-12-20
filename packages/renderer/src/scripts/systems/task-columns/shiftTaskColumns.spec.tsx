import { setupTestStore } from '@mocks/store-utils';
import { mockTaskListState, testTask } from '@mocks/testObjs';
import { ScheduledReminder, setDate, Task } from '@remindr/shared';
import store, { AppDispatch } from '@renderer/app/store';
import { updateTasks } from '@renderer/features/task-list/taskListSlice';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initTaskColumnShiftListeners, shiftTaskColumns } from './shiftTaskColumns';

describe('shiftTaskColumns - without reminders', () => {
  const todayTask: Task = { ...testTask, columnIdx: 0 };
  const yesterdayTask: Task = { ...testTask, columnIdx: -1 };
  const uncategorizedTask: Task = { ...testTask };

  beforeEach(() => {
    const mockedStore = setupTestStore({
      taskList: {
        ...mockTaskListState,
        value: [todayTask, yesterdayTask, uncategorizedTask],
        taskListGetStatus: 'succeeded',
      },
    });

    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());
  });

  it('should shift task columns by the given number of days', async () => {
    const dispatch = vi.fn();
    initTaskColumnShiftListeners(dispatch as any as AppDispatch);
    await shiftTaskColumns(2);

    expect(store.getState).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      updateTasks([
        { ...todayTask, columnIdx: -2 },
        { ...yesterdayTask, columnIdx: -3 },
      ]),
    );
  });

  it('should throw an error if dispatch is not initialized', async () => {
    initTaskColumnShiftListeners(undefined as any as AppDispatch);
    await expect(() => shiftTaskColumns(2)).rejects.toThrowError(ReferenceError);
  });
});

describe('shiftTaskColumns - with reminders', () => {
  const testTaskYesterday: Task = { ...testTask };
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayScheduledReminder = setDate(new ScheduledReminder(), yesterdayDate);
  testTaskYesterday.scheduledReminders = [yesterdayScheduledReminder];

  const testTaskTomorrow: Task = { ...testTask };
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowScheduledReminder = setDate(new ScheduledReminder(), tomorrowDate);
  testTaskTomorrow.scheduledReminders = [tomorrowScheduledReminder];

  beforeEach(() => {
    const mockedStore = setupTestStore({
      taskList: {
        ...mockTaskListState,
        value: [testTaskYesterday, testTaskTomorrow],
        taskListGetStatus: 'succeeded',
      },
    });

    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());
  });

  it('should assign column indices based on earliest task reminders', async () => {
    const dispatch = vi.fn();
    initTaskColumnShiftListeners(dispatch as any as AppDispatch);
    await shiftTaskColumns(1);
    expect(dispatch).toHaveBeenCalledWith(
      updateTasks([
        { ...testTaskYesterday, columnIdx: -1 },
        { ...testTaskTomorrow, columnIdx: 1 },
      ]),
    );
  });
});
