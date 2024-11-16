import { DateFormat } from '../types/dateformat.js';
import { Repeat, ScheduledReminder } from '../types/index.js';
import { formatDate, getReminderDate } from './datefunctions.js';

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

  const { reminderToday, adjacentDay } = isReminderToday(scheduledReminder, true) as {
    reminderToday: boolean;
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

/**
 * Checks if a scheduled reminder time is overdue.
 * @param  {ScheduledReminder} reminderTime
 * @returns boolean
 */
export function isOverdue(reminderTime: ScheduledReminder): boolean {
  // Create date from reminder.
  const reminderDate = getDate(reminderTime);

  const now = new Date();
  // Set milliseconds and seconds to 0. Now the dates are being compared down to the minute.
  now.setMilliseconds(0);
  now.setSeconds(0);

  const timeDiff = reminderDate.getTime() - now.getTime();

  if (timeDiff <= 0) return true;
  return false;
}

export function setDate(scheduledReminder: ScheduledReminder, date: Date, setTime = true): ScheduledReminder {
  scheduledReminder.reminderYear = date.getFullYear();
  scheduledReminder.reminderMonth = date.getMonth() + 1;
  scheduledReminder.reminderDay = date.getDate();

  if (!setTime) return scheduledReminder;

  scheduledReminder.reminderHour = date.getHours();
  scheduledReminder.reminderMinute = date.getMinutes();
  scheduledReminder.reminderMeridiem = date.getHours() >= 12 ? 'PM' : 'AM';

  return scheduledReminder;
}

export function getDate(reminder: ScheduledReminder): Date {
  return new Date(
    reminder.reminderYear,
    reminder.reminderMonth - 1,
    reminder.reminderDay,
    reminder.reminderHour,
    reminder.reminderMinute,
  );
}

export const getSerializableScheduledReminder = (scheduledReminder: ScheduledReminder) =>
  JSON.parse(JSON.stringify(scheduledReminder));

export function reminderRepeats(scheduledReminder: ScheduledReminder): boolean {
  return scheduledReminder.repeat !== Repeat["Don't Repeat"];
}

export function sortReminders(reminderList: ScheduledReminder[]): ScheduledReminder[] {
  const reminderListClone = JSON.parse(JSON.stringify(reminderList)) as ScheduledReminder[];
  return reminderListClone.sort((a, b) => getReminderDate(a).getTime() - getReminderDate(b).getTime());
}

export function isBetweenDates(reminder: ScheduledReminder, startDate: Date, endDate: Date): boolean {
  const reminderDate = getDate(reminder);

  return reminderDate.getTime() > startDate.getTime() && reminderDate.getTime() < endDate.getTime();
}
export function getCalculableDate(comparableDate: Date, scheduledReminderTime: ScheduledReminder): Date {
  comparableDate.setHours(scheduledReminderTime.reminderHour);
  comparableDate.setMinutes(scheduledReminderTime.reminderMinute);
  comparableDate.setSeconds(0);

  return comparableDate;
}

export function isReminderToday(
  reminderTime: ScheduledReminder,
  requestAdjacentDays = false,
): boolean | { reminderToday: boolean; adjacentDay: string } {
  if (reminderTime === undefined) return false;

  if (requestAdjacentDays) {
    const yesterdayDate = new Date();
    const tomorrowDate = new Date();

    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    if (
      reminderTime.reminderDay === new Date().getDate() &&
      reminderTime.reminderMonth - 1 === new Date().getMonth() &&
      reminderTime.reminderYear === new Date().getFullYear()
    ) {
      return {
        reminderToday: true,
        adjacentDay: 'none',
      };
    }
    if (
      reminderTime.reminderDay === yesterdayDate.getDate() &&
      reminderTime.reminderMonth - 1 === yesterdayDate.getMonth() &&
      reminderTime.reminderYear === yesterdayDate.getFullYear()
    ) {
      return {
        reminderToday: false,
        adjacentDay: 'yesterday',
      };
    }
    if (
      reminderTime.reminderDay === tomorrowDate.getDate() &&
      reminderTime.reminderMonth - 1 === tomorrowDate.getMonth() &&
      reminderTime.reminderYear === tomorrowDate.getFullYear()
    ) {
      return {
        reminderToday: false,
        adjacentDay: 'tomorrow',
      };
    }
    return {
      reminderToday: false,
      adjacentDay: 'none',
    };
  }

  const sameDay = new Date().getDate() === reminderTime.reminderDay;
  const sameMonth = new Date().getMonth() === reminderTime.reminderMonth - 1;
  const sameYear = new Date().getFullYear() === reminderTime.reminderYear;

  return sameDay && sameMonth && sameYear;
}
