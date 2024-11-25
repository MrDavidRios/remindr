import { getTaskColumnIdx, ScheduledReminder, setDate, Task } from '@remindr/shared';
import { describe, expect, test } from 'vitest';

const createScheduledReminderList = (relativeDays: number[]): ScheduledReminder[] => {
  return relativeDays.map((day) => {
    const date = new Date();
    date.setDate(date.getDate() + day);
    return setDate(new ScheduledReminder(), date);
  });
};

describe('getTaskColumnIdx', () => {
  test('should return already set column idx if task has no scheduled reminders', () => {
    const testTask = new Task('test task');
    testTask.scheduledReminders = [];

    const testTaskWithSetIdx = new Task('test task');
    testTaskWithSetIdx.scheduledReminders = [];
    testTaskWithSetIdx.columnIdx = 1;

    expect(getTaskColumnIdx(testTask)).toBe(undefined);
    expect(getTaskColumnIdx(testTaskWithSetIdx)).toBe(1);
  });

  describe('multiple reminders', () => {
    test("should return -1 if task's earliest reminder is yesterday", () => {
      const testTask = new Task('test task');
      testTask.scheduledReminders = createScheduledReminderList([-1, 15]);

      expect(getTaskColumnIdx(testTask)).toBe(-1);
    });

    test("should return 0 if task's earliest reminder is on the same day", () => {
      const testTask = new Task('test task');
      testTask.scheduledReminders = createScheduledReminderList([0, 15]);

      expect(getTaskColumnIdx(testTask)).toBe(0);
    });

    test("should return 1 if task's earliest reminder is set for tomorrow", () => {
      const testTask = new Task('test task');
      testTask.scheduledReminders = createScheduledReminderList([1, 15]);

      expect(getTaskColumnIdx(testTask)).toBe(1);
    });
  });

  describe('single reminder', () => {
    test("should return -1 if task's earliest reminder is yesterday", () => {
      const testTask = new Task('test task');
      testTask.scheduledReminders = createScheduledReminderList([-1]);

      expect(getTaskColumnIdx(testTask)).toBe(-1);
    });

    test("should return 0 if task's earliest reminder is on the same day", () => {
      const testTask = new Task('test task');
      testTask.scheduledReminders = createScheduledReminderList([0]);

      expect(getTaskColumnIdx(testTask)).toBe(0);
    });

    test("should return 1 if task's earliest reminder is set for tomorrow", () => {
      const testTask = new Task('test task');
      testTask.scheduledReminders = createScheduledReminderList([1]);

      expect(getTaskColumnIdx(testTask)).toBe(1);
    });
  });
});
