import { ScheduledReminder, getDaysBetweenDates, getReminderDate, isCurrentMinute, setDate } from '@remindr/shared';
import { describe, expect, it } from 'vitest';

describe('getReminderDate', () => {
  it('should return the correct Date object for a given ScheduledReminder', () => {
    const reminderTime: ScheduledReminder = {
      ...new ScheduledReminder(),
      ...{
        reminderYear: 2023,
        reminderMonth: 10,
        reminderDay: 5,
        reminderHour: 14,
        reminderMinute: 30,
      },
    };

    const expectedDate = new Date(2023, 9, 5, 14, 30); // Note: Month is 0-indexed

    const result = getReminderDate(reminderTime);

    expect(result).toEqual(expectedDate);
  });

  it('should handle edge cases like end of month correctly', () => {
    const reminderTime: ScheduledReminder = {
      ...new ScheduledReminder(),
      ...{
        reminderYear: 2023,
        reminderMonth: 12,
        reminderDay: 31,
        reminderHour: 23,
        reminderMinute: 59,
      },
    };

    const expectedDate = new Date(2023, 11, 31, 23, 59); // Note: Month is 0-indexed

    const result = getReminderDate(reminderTime);

    expect(result).toEqual(expectedDate);
  });
});

describe('isCurrentMinute', () => {
  it('should return true if the reminder time is set to the current minute', () => {
    const reminderTime = setDate(new ScheduledReminder(), new Date());

    const result = isCurrentMinute(reminderTime);
    expect(result).toBe(true);
  });

  it('should return false if the reminder time is not set to the current minute', () => {
    const nextSecond = new Date();
    nextSecond.setMinutes(new Date().getMinutes() + 1);
    const reminderTime = setDate(new ScheduledReminder(), nextSecond);

    const result = isCurrentMinute(reminderTime);
    expect(result).toBe(false);
  });
});

describe('getDaysBetween', () => {
  it('should return 0 when the dates are the same', () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 1); // January 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(0);
  });

  it('should return 1 when the dates are one day apart', () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 2); // January 2, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it('should return 2 when the dates are two days apart', () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 3); // January 3, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(2);
  });

  it('should return the correct number of days between two dates', () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 10); // January 10, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(9);
  });

  it('should return the correct number of days when the dates are in different months', () => {
    const dateA = new Date(2023, 0, 31); // January 31, 2023
    const dateB = new Date(2023, 1, 1); // February 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it('should return the correct number of days when the dates are in different years', () => {
    const dateA = new Date(2022, 11, 31); // December 31, 2022
    const dateB = new Date(2023, 0, 1); // January 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it('should return the correct number of days regardless of the order of the dates', () => {
    const dateA = new Date(2023, 0, 10); // January 10, 2023
    const dateB = new Date(2023, 0, 1); // January 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(9);
  });

  it('should return 0 when the dates are the same but have different times', () => {
    const dateA = new Date(2023, 0, 1, 10, 0, 0); // January 1, 2023 10:00:00
    const dateB = new Date(2023, 0, 1, 15, 0, 0); // January 1, 2023 15:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(0);
  });

  it('should return 1 when the dates are one day apart but have different times', () => {
    const dateA = new Date(2023, 0, 1, 23, 59, 59); // January 1, 2023 23:59:59
    const dateB = new Date(2023, 0, 2, 0, 0, 0); // January 2, 2023 00:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it('should return 1 when the dates are one day apart and the first date has a later time', () => {
    const dateA = new Date(2023, 0, 1, 15, 0, 0); // January 1, 2023 15:00:00
    const dateB = new Date(2023, 0, 2, 10, 0, 0); // January 2, 2023 10:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it('should return 2 when the dates are two days apart but have different times', () => {
    const dateA = new Date(2023, 0, 1, 10, 0, 0); // January 1, 2023 10:00:00
    const dateB = new Date(2023, 0, 3, 15, 0, 0); // January 3, 2023 15:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(2);
  });
});
