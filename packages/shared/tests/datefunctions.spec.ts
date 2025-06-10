import {
  DateFormat,
  ScheduledReminder,
  addMonths,
  formatDateAndTime,
  getDaysBetweenDates,
  getReminderDate,
  isCurrentMinute,
  msUntilNextMinute,
  setDate,
} from "@remindr/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getReminderDate", () => {
  it("should return the correct Date object for a given ScheduledReminder", () => {
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

  it("should handle edge cases like end of month correctly", () => {
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

describe("isCurrentMinute", () => {
  it("should return true if the reminder time is set to the current minute", () => {
    const reminderTime = setDate(new ScheduledReminder(), new Date());

    const result = isCurrentMinute(reminderTime);
    expect(result).toBe(true);
  });

  it("should return false if the reminder time is not set to the current minute", () => {
    const nextSecond = new Date();
    nextSecond.setMinutes(new Date().getMinutes() + 1);
    const reminderTime = setDate(new ScheduledReminder(), nextSecond);

    const result = isCurrentMinute(reminderTime);
    expect(result).toBe(false);
  });
});

describe("getDaysBetween", () => {
  it("should return 0 when the dates are the same", () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 1); // January 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(0);
  });

  it("should return 1 when the dates are one day apart", () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 2); // January 2, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it("should return 2 when the dates are two days apart", () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 3); // January 3, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(2);
  });

  it("should return the correct number of days between two dates", () => {
    const dateA = new Date(2023, 0, 1); // January 1, 2023
    const dateB = new Date(2023, 0, 10); // January 10, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(9);
  });

  it("should return the correct number of days when the dates are in different months", () => {
    const dateA = new Date(2023, 0, 31); // January 31, 2023
    const dateB = new Date(2023, 1, 1); // February 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it("should return the correct number of days when the dates are in different years", () => {
    const dateA = new Date(2022, 11, 31); // December 31, 2022
    const dateB = new Date(2023, 0, 1); // January 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it("should return the correct number of days regardless of the order of the dates", () => {
    const dateA = new Date(2023, 0, 10); // January 10, 2023
    const dateB = new Date(2023, 0, 1); // January 1, 2023

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(9);
  });

  it("should return 0 when the dates are the same but have different times", () => {
    const dateA = new Date(2023, 0, 1, 10, 0, 0); // January 1, 2023 10:00:00
    const dateB = new Date(2023, 0, 1, 15, 0, 0); // January 1, 2023 15:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(0);
  });

  it("should return 1 when the dates are one day apart but have different times", () => {
    const dateA = new Date(2023, 0, 1, 23, 59, 59); // January 1, 2023 23:59:59
    const dateB = new Date(2023, 0, 2, 0, 0, 0); // January 2, 2023 00:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it("should return 1 when the dates are one day apart and the first date has a later time", () => {
    const dateA = new Date(2023, 0, 1, 15, 0, 0); // January 1, 2023 15:00:00
    const dateB = new Date(2023, 0, 2, 10, 0, 0); // January 2, 2023 10:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(1);
  });

  it("should return 2 when the dates are two days apart but have different times", () => {
    const dateA = new Date(2023, 0, 1, 10, 0, 0); // January 1, 2023 10:00:00
    const dateB = new Date(2023, 0, 3, 15, 0, 0); // January 3, 2023 15:00:00

    const result = getDaysBetweenDates(dateA, dateB);
    expect(result).toBe(2);
  });
});

describe("msUntilNextMinute", () => {
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the correct milliseconds until the next minute when seconds are 0", () => {
    const mockDate = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    vi.setSystemTime(mockDate);
    const expectedMs = 60000; // 60 seconds * 1000 milliseconds

    const test = new Date();

    const result = msUntilNextMinute();
    expect(result).toBeCloseTo(expectedMs, -2); // Allowing a small margin for execution time
  });

  it("should return the correct milliseconds until the next minute when seconds are 30", () => {
    const mockDate = new Date(currentYear, 0, 1, 0, 0, 30, 0);
    vi.setSystemTime(mockDate);
    const expectedMs = 30000; // 30 seconds * 1000 milliseconds

    const result = msUntilNextMinute();
    expect(result).toBeCloseTo(expectedMs, -2); // Allowing a small margin for execution time
  });

  it("should return the correct milliseconds until the next minute when seconds are 59", () => {
    const mockDate = new Date(currentYear, 0, 1, 0, 0, 59, 0);
    vi.setSystemTime(mockDate);
    const expectedMs = 1000; // 1 second * 1000 milliseconds

    const result = msUntilNextMinute();
    expect(result).toBeCloseTo(expectedMs, -2); // Allowing a small margin for execution time
  });

  it("should return the correct milliseconds until the next minute when milliseconds are non-zero", () => {
    const mockDate = new Date(currentYear, 0, 1, 0, 0, 30, 500); // 30 seconds and 500 milliseconds
    vi.setSystemTime(mockDate);
    const expectedMs = 29500; // 29.5 seconds * 1000 milliseconds

    const result = msUntilNextMinute();
    expect(result).toBeCloseTo(expectedMs, -2); // Allowing a small margin for execution time
  });

  it("should return the correct milliseconds until the next minute when seconds are 0 and milliseconds are non-zero", () => {
    const mockDate = new Date(currentYear, 0, 1, 0, 0, 0, 500); // 0 seconds and 500 milliseconds
    vi.setSystemTime(mockDate);
    const expectedMs = 59500; // 59.5 seconds * 1000 milliseconds

    const result = msUntilNextMinute();
    expect(result).toBeCloseTo(expectedMs, -2); // Allowing a small margin for execution time
  });
});

describe("addMonths", () => {
  it("should add the correct number of months to a date", () => {
    const date = new Date(2023, 0, 1); // January 1, 2023
    const result = addMonths(date, 1);
    const expectedDate = new Date(2023, 1, 1); // February 1, 2023

    expect(result).toEqual(expectedDate);
  });

  it("should handle adding months that result in a year change", () => {
    const date = new Date(2023, 10, 1); // November 1, 2023
    const result = addMonths(date, 3);
    const expectedDate = new Date(2024, 1, 1); // February 1, 2024

    expect(result).toEqual(expectedDate);
  });

  it("should handle adding months that result in a month with fewer days", () => {
    const date = new Date(2023, 0, 31); // January 31, 2023
    const result = addMonths(date, 1);
    const expectedDate = new Date(2023, 1, 28); // February 28, 2023 (non-leap year)

    expect(result).toEqual(expectedDate);
  });

  it("should handle adding months that result in a month with more days", () => {
    const date = new Date(2023, 1, 28); // February 28, 2023
    const result = addMonths(date, 1);
    const expectedDate = new Date(2023, 2, 28); // March 28, 2023

    expect(result).toEqual(expectedDate);
  });

  it("should handle adding months that result in a month with fewer days and set the date to the last day of the month", () => {
    const date = new Date(2023, 0, 31); // January 31, 2023
    const result = addMonths(date, 1);
    const expectedDate = new Date(2023, 1, 28); // February 28, 2023 (non-leap year)

    expect(result).toEqual(expectedDate);
  });
});

describe("formatDateAndTime", () => {
  it("should format the date and time correctly with year included", () => {
    const date = new Date(2025, 0, 1, 10, 0, 0); // January 1, 2019 10:00:00
    const dateFormat = DateFormat.MDYNumeric;
    const result = formatDateAndTime(date, dateFormat, false);
    const expected = "01/01/2025 at 10:00 AM";

    expect(result).toBe(expected);
  });

  it("should format the date and time correctly without year if same year", () => {
    const date = new Date(new Date().getFullYear(), 0, 1, 10, 0, 0); // January 1, 2025 10:00:00
    const dateFormat = DateFormat.MDYNumeric;
    const result = formatDateAndTime(date, dateFormat, true);
    const expected = "01/01 at 10:00 AM";

    expect(result).toBe(expected);
  });

  it("should format the date and time correctly with year if different year", () => {
    const date = new Date(2022, 0, 1, 10, 0, 0); // January 1, 2022 10:00:00
    const dateFormat = DateFormat.MDYNumeric;
    const result = formatDateAndTime(date, dateFormat, true);
    const expected = "01/01/2022 at 10:00 AM";

    expect(result).toBe(expected);
  });

  it("should format the date and time correctly with different date format", () => {
    const date = new Date(2023, 0, 1, 10, 0, 0); // January 1, 2023 10:00:00
    const dateFormat = DateFormat.DMYNumeric;
    const result = formatDateAndTime(date, dateFormat, false);
    const expected = "01/01/2023 at 10:00 AM";

    expect(result).toBe(expected);
  });

  it("should format the date and time correctly with long month name", () => {
    const date = new Date(2023, 0, 1, 10, 0, 0); // January 1, 2023 10:00:00
    const dateFormat = DateFormat.DMYText;
    const result = formatDateAndTime(date, dateFormat, false);
    const expected = "1 January 2023 at 10:00 AM";

    expect(result).toBe(expected);
  });
});
