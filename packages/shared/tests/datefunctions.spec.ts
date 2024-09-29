import { ScheduledReminder, getReminderDate, isCurrentMinute, setDate } from '@remindr/shared';
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
