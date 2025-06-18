import { setupTestStore } from "@mocks/store-utils";
import { mockTaskListState, testTask } from "@mocks/testObjs";
import {
  FrequencyType,
  getDate,
  getDefaultScheduledReminder,
  isDateTomorrow,
  RepeatInfo,
  Task,
} from "@remindr/shared";
import store from "@renderer/app/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { taskListSlice, TaskListState } from "../taskListSlice";

describe("Advance Recurring Reminder Reducer", () => {
  beforeEach(() => {
    const mockedStore = setupTestStore({
      taskList: {
        ...mockTaskListState,
        taskListGetStatus: "succeeded",
      },
    });

    vi.mocked(store.getState).mockReturnValue(mockedStore.getState());
  });

  describe("recurring forever", () => {
    it("correctly advances a task with a simple recurring reminder", () => {
      const state: TaskListState = JSON.parse(
        JSON.stringify(mockTaskListState)
      );

      const taskWithRecurringReminder: Task = JSON.parse(
        JSON.stringify(testTask)
      );
      const reminder = getDefaultScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.FixedIntervalDays,
        frequency: 1,
      });
      taskWithRecurringReminder.scheduledReminders = [reminder];

      state.value = [taskWithRecurringReminder];

      taskListSlice.caseReducers.advanceRecurringReminderInTask(state, {
        payload: { task: taskWithRecurringReminder, reminderIdx: 0 },
        type: "advanceRecurringReminder",
      });

      const updatedTask = state.value[0];

      expect(updatedTask.scheduledReminders.length).toBe(2);
      expect(updatedTask.scheduledReminders[0].repeatInfo.frequencyType).toBe(
        FrequencyType.Never
      );
      expect(updatedTask.scheduledReminders[1].repeatInfo.frequencyType).toBe(
        FrequencyType.FixedIntervalDays
      );
      expect(isDateTomorrow(getDate(updatedTask.scheduledReminders[1]))).toBe(
        true
      );
    });
  });

  describe("limited duration", () => {
    it("stops adding recurring reminders after fixed reminder amount has been exceeded", () => {});

    it("stops adding recurring reminders after end date", () => {});
  });
});
