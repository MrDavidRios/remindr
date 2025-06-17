import {
  FrequencyType,
  IntervalFrequencyType,
  Repeat,
} from "../types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../types/classes/task/scheduledReminder.js";
import { addMonths, getReminderDate } from "./datefunctions.js";
import { getRepeatValue } from "./repeatcompatibility.js";

function getNextRepeatDateLegacy(repeatType: Repeat, reminderDate: Date): Date {
  switch (getRepeatValue(repeatType)) {
    case Repeat.Daily:
      reminderDate.setDate(reminderDate.getDate() + 1);

      return reminderDate;
    case Repeat.Weekdays: {
      /** Day of the week, from 0-6 */
      const dayIndex = reminderDate.getDay();

      // If day is Friday or Saturday, add (8 - dayIndex) days. For example, Friday would add 8 - 5 = 3 days, resulting in the next date being on Monday.
      if (dayIndex === 5 || dayIndex === 6)
        reminderDate.setDate(reminderDate.getDate() + (8 - dayIndex));
      else reminderDate.setDate(reminderDate.getDate() + 1);

      return reminderDate;
    }
    case Repeat.Weekly:
      reminderDate.setDate(reminderDate.getDate() + 7);

      return reminderDate;

    case Repeat.Monthly:
      reminderDate = addMonths(reminderDate, 1);

      return reminderDate;
    case Repeat.Yearly:
      reminderDate.setFullYear(reminderDate.getFullYear() + 1);
      return reminderDate;
    case Repeat.NoRepeat:
    default:
      return reminderDate;
  }
}

function getIntervalInMilliseconds(
  intervalFrequencyType: IntervalFrequencyType,
  amount: number
): number {
  switch (intervalFrequencyType) {
    case FrequencyType.FixedIntervalMinutes:
      return amount * 60 * 1000; // Convert minutes to milliseconds
    case FrequencyType.FixedIntervalHours:
      return (
        amount *
        60 *
        getIntervalInMilliseconds(FrequencyType.FixedIntervalMinutes, 1)
      ); // Convert days to milliseconds
    case FrequencyType.FixedIntervalDays:
      return (
        amount *
        24 *
        getIntervalInMilliseconds(FrequencyType.FixedIntervalHours, 1)
      ); // Convert days to milliseconds
    case FrequencyType.FixedIntervalWeeks:
      return (
        amount *
        7 *
        getIntervalInMilliseconds(FrequencyType.FixedIntervalDays, 1)
      ); // Convert weeks to milliseconds
    case FrequencyType.FixedIntervalMonths:
      // Months can vary in length, so we need to handle this differently
      const date = new Date();
      date.setMonth(date.getMonth() + amount);
      return date.getTime() - new Date().getTime(); // Return the difference in milliseconds
    case FrequencyType.FixedIntervalYears:
      const yearDate = new Date();
      yearDate.setFullYear(yearDate.getFullYear() + amount);
      return yearDate.getTime() - new Date().getTime(); // Return the difference in milliseconds
  }
}

/**
 * Gets the next date for a reminder based on its repeat interval.
 * @param task The reminder to get the next repeat date for.
 * @returns
 */
export function getNextRepeatDate(reminder: ScheduledReminder): Date {
  let reminderDate = getReminderDate(reminder);

  // Keep backwards compatibility with legacy repeat type (pre v2.2.5)
  if (reminder.repeat !== undefined) {
    return getNextRepeatDateLegacy(reminder.repeat, reminderDate);
  }

  const { frequency, frequencyType } = reminder.repeatInfo;
  if (frequencyType === FrequencyType.Never) {
    throw new Error(
      "getNextRepeatDate cannot be called with a reminder set to never repeat."
    );
  }

  if (frequencyType !== FrequencyType.Weekdays) {
    const intervalInMilliseconds = getIntervalInMilliseconds(
      frequencyType,
      frequency as number
    );
    reminderDate = new Date(reminderDate.getTime() + intervalInMilliseconds);

    return reminderDate;
  }

  const enabledWeekdays = reminder.repeatInfo.frequency as boolean[];
  const currentDay = reminderDate.getDay() - 1; // Adjust to 0-6 range (Monday=0, Sunday=6)
  let daysToAdd = 1;
  for (; daysToAdd <= 7; daysToAdd++) {
    const nextDay = (currentDay + daysToAdd) % 7;
    if (enabledWeekdays[nextDay]) {
      break;
    }
  }
  reminderDate.setDate(reminderDate.getDate() + daysToAdd);
  return reminderDate;
}
