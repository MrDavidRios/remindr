import { ScheduledReminder, getReminderDate } from '@remindr/shared';
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
