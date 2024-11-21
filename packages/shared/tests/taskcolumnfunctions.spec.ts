import { getTaskColumnIdx, ScheduledReminder, setDate, Task } from '@remindr/shared';
import { describe, expect, test } from 'vitest';

describe('getTaskColumnIdx', () => {
  test('should return undefined if task has no scheduled reminders', () => {
    const testTask = new Task('test task');
    testTask.scheduledReminders = [];

    expect(getTaskColumnIdx(testTask)).toBe(undefined);
  });

  test("should return -1 if task's earliest reminder is yesterday", () => {
    const testTask = new Task('test task');
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const testScheduledReminder = setDate(new ScheduledReminder(), yesterdayDate);
    testTask.scheduledReminders = [testScheduledReminder];

    expect(getTaskColumnIdx(testTask)).toBe(-1);
  });

  test("should return 0 if task's earliest reminder is on the same day", () => {
    const testTask = new Task('test task');
    const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
    testTask.scheduledReminders = [testScheduledReminder];

    expect(getTaskColumnIdx(testTask)).toBe(0);
  });

  test("should return 1 if task's earliest reminder is set for tomorrow", () => {
    const testTask = new Task('test task');
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const testScheduledReminder = setDate(new ScheduledReminder(), tomorrowDate);
    testTask.scheduledReminders = [testScheduledReminder];

    expect(getTaskColumnIdx(testTask)).toBe(1);
  });
});
