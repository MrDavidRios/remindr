import { ScheduledReminder } from 'main/types/classes/task/scheduledReminder';
import { DateFormat } from 'main/types/dateformat';
import { formatDate, getReminderDate } from '../../../main/utils/datefunctions';
import { isReminderToday, setDate } from '../../../main/utils/reminderfunctions';

export function getScheduledReminderClone(scheduledReminder: ScheduledReminder): ScheduledReminder {
  return JSON.parse(JSON.stringify(scheduledReminder));
}

export function getReminderDisplayDate(
  scheduledReminder: ScheduledReminder,
  dateFormat: DateFormat,
  shortenMonth = true,
  includeYearIfSame = false,
  lowercaseImproperNoun = false,
): string {
  const reminderDate = getReminderDate(scheduledReminder);

  const readableDate = `${formatDate(reminderDate, dateFormat, shortenMonth, includeYearIfSame)}`;

  const { isReminderToday: reminderToday, adjacentDay } = isReminderToday(scheduledReminder, true) as {
    isReminderToday: boolean;
    adjacentDay: string;
  };

  if (reminderToday) return lowercaseImproperNoun ? 'today' : 'Today';
  if (adjacentDay === 'yesterday') return lowercaseImproperNoun ? 'yesterday' : 'Yesterday';
  if (adjacentDay === 'tomorrow') return lowercaseImproperNoun ? 'tomorrow' : 'Tomorrow';

  return readableDate;
}

/**
 * Returns a default ScheduledReminder, which is automatically set to the next half hour.
 * @param date The date to get the next half hour from. Defaults to the current date.
 * @returns a ScheduledReminder with its date set for the next half hour (e.g. 05:25 -> 05:30, 05:30 -> 06:00)
 */
export function getDefaultScheduledReminder(date = new Date()): ScheduledReminder {
  const minutes = date.getMinutes();
  const minutesUntilNextHalfHour = 30 - (minutes % 30);

  date.setMinutes(minutes + minutesUntilNextHalfHour);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return setDate(new ScheduledReminder(), date);
}
