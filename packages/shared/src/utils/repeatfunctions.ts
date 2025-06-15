import { Repeat } from "../types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../types/classes/task/scheduledReminder.js";
import { addMonths, getReminderDate } from "./datefunctions.js";
import { getRepeatValue } from "./repeatcompatibility.js";

/**
 * Gets the next date for a reminder based on its repeat interval.
 * @param task The reminder to get the next repeat date for.
 * @returns
 */
export function getNextRepeatDate(reminder: ScheduledReminder): Date {
  let reminderDate = getReminderDate(reminder);

  switch (getRepeatValue(reminder.repeat)) {
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
