import { ScheduledReminder, setDate } from '@remindr/shared';
import { describe, expect, test } from 'vitest';
import { getDefaultScheduledReminder } from './scheduledreminderfunctions';

describe('Scheduled Reminder Functions', () => {
  test('getDateFromNextHalfHour returns the correct date', () => {
    // Arrange
    const input = new Date(2022, 0, 1, 5, 25); // 05:25
    const expectedOutput = setDate(new ScheduledReminder(), new Date(2022, 0, 1, 5, 30)); // 05:30

    // Act
    const result = getDefaultScheduledReminder(input);

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        ...expectedOutput,
        id: expect.anything(),
      }),
    );
  });

  test('getDateFromNextHalfHour returns the same date if already at half hour', () => {
    // Arrange
    const input = new Date(2022, 0, 1, 5, 30); // 05:30
    const expectedOutput = setDate(new ScheduledReminder(), new Date(2022, 0, 1, 6, 0)); // 06:00

    // Act
    const result = getDefaultScheduledReminder(input);

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        ...expectedOutput,
        id: expect.anything(),
      }),
    );
  });

  test('getDateFromNextHalfHour returns the correct date when minutes are greater than 30', () => {
    // Arrange
    const input = new Date(2022, 0, 1, 5, 45); // 05:45
    const expectedOutput = setDate(new ScheduledReminder(), new Date(2022, 0, 1, 6, 0)); // 06:00

    // Act
    const result = getDefaultScheduledReminder(input);

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        ...expectedOutput,
        id: expect.anything(),
      }),
    );
  });
});
