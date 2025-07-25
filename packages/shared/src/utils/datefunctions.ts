import { ScheduledReminder } from "../types/classes/task/scheduledReminder.js";
import { DateFormat } from "../types/dateformat.js";

export function getWeekNumber(date: Date): number {
  // Copy date so don't modify original
  const simplifiedDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  simplifiedDate.setUTCDate(
    simplifiedDate.getUTCDate() + 4 - (simplifiedDate.getUTCDay() || 7)
  );

  // Get first day of year
  const yearStart = new Date(Date.UTC(simplifiedDate.getUTCFullYear(), 0, 1));

  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(
    ((simplifiedDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  // Return week number
  return weekNo;
}

export function getDayName(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { weekday: "long" });
}

/**
 * Gets a weekday name given a day idx. Currently used for date picker
 * @param idx 0 -> Sunday, 1 -> Monday, etc.
 * @param weekStart first day of week: 0 -> Sunday, 1 -> Monday, etc.
 * @param long whether to return the full day name or the short name (2 letters)
 * @param locale
 * @returns
 */
export function getDayNameFromIdx(
  idx: number,
  weekStart = 0,
  shorten = true,
  locale: string | undefined = undefined
): string {
  const date = new Date();
  const currentDay = date.getDay();

  const dayIndex = (idx + weekStart) % 7;
  const difference = dayIndex - currentDay;
  date.setDate(date.getDate() + difference);

  const unclippedDayName = date.toLocaleDateString(locale, {
    weekday: shorten ? "short" : "long",
  });
  if (!shorten) return unclippedDayName;

  return unclippedDayName.slice(0, 2);
}

export function getMonthName(
  date: Date,
  shorten = true,
  locale: string | undefined = undefined
): string {
  return date.toLocaleDateString(locale, { month: shorten ? "short" : "long" });
}

/**
 * Returns a date object with the remind date of the reminder.
 * @param  {Task} reminder
 */
export function getReminderDate(reminderTime: ScheduledReminder): Date {
  return new Date(
    reminderTime.reminderYear,
    reminderTime.reminderMonth - 1,
    reminderTime.reminderDay,
    reminderTime.reminderHour,
    reminderTime.reminderMinute
  );
}

/**
 * Checks if the remind date of the reminder is set to the current minute.
 * @param  {Task} reminder
 */
export function isCurrentMinute(reminderTime: ScheduledReminder): boolean {
  const reminderDate = getReminderDate(reminderTime);
  reminderDate.setHours(reminderTime.reminderHour, reminderTime.reminderMinute);

  const currentDate = new Date();

  if (reminderDate.getFullYear() === currentDate.getFullYear()) {
    if (reminderDate.getMonth() === currentDate.getMonth()) {
      if (reminderDate.getDate() === currentDate.getDate()) {
        if (reminderDate.getHours() === currentDate.getHours()) {
          if (reminderDate.getMinutes() === currentDate.getMinutes())
            return true;
        }

        return false;
      }

      return false;
    }

    return false;
  }

  return false;
}

/**
 * Returns the inputted date with a fixed number of months added to it.
 * @param  {Date} date
 * @param  {number} months
 */
export function addMonths(date: Date, months: number): Date {
  const d = date.getDate();
  const modifiedDate = new Date(date);

  modifiedDate.setMonth(modifiedDate.getMonth() + months);
  if (modifiedDate.getDate() !== d) {
    modifiedDate.setDate(0);
  }

  return modifiedDate;
}

/**
 * Returns the inputted date with a fixed number of months subtracted from it.
 * @param  {Date} date
 * @param  {number} months
 */
export function subtractMonths(date: Date, months: number): Date {
  const d = date.getDate();
  const modifiedDate = new Date(date);

  modifiedDate.setMonth(modifiedDate.getMonth() - months);
  if (modifiedDate.getDate() !== d) {
    modifiedDate.setDate(0);
  }

  return modifiedDate;
}

/**
 * Returns the inputted date with a fixed number of minutes added to it.
 * @param  {Date} date
 * @param  {number} minutes
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Gets the formatted day number (automatically pads single digits with a 0)
 * @param date
 * @returns a string of the day number (ex: 01...31)
 */
const getFormattedDay = (date: Date) =>
  date.getDate().toString().padStart(2, "0");

/**
 * Gets the formatted month number (automatically pads single digits with a 0)
 * @param date
 * @returns a string of the month number (ex: 01...12)
 */
const getFormattedMonth = (date: Date) =>
  (date.getMonth() + 1).toString().padStart(2, "0");

export function formatDate(
  date: Date,
  dateFormat: DateFormat,
  shortenMonth = false,
  includeYearIfSame = false
): string {
  let includeYear = true;

  // DateFormat.MDYText ('en-US') by default
  let locale = "en-US";

  // Get locale based on user's settings
  switch (dateFormat) {
    case DateFormat.DMYText:
      locale = "en-GB";
      break;
    case DateFormat.DMYNumeric:
      return `${getFormattedDay(date)}/${getFormattedMonth(
        date
      )}/${date.getFullYear()}`;
    case DateFormat.MDYNumeric:
      return `${getFormattedMonth(date)}/${getFormattedDay(
        date
      )}/${date.getFullYear()}`;
    case DateFormat.YMDNumeric:
      return `${date.getFullYear()}/${getFormattedMonth(
        date
      )}/${getFormattedDay(date)}`;
  }

  let formattedDate = date.toLocaleDateString(locale, {
    year: "numeric",
    month: shortenMonth ? "short" : "long",
    day: "numeric",
  });

  if (date.getFullYear() === new Date().getFullYear() && !includeYearIfSame) {
    includeYear = false;
  }

  if (!includeYear) {
    const textToReplace =
      locale === "en-US" ? `, ${date.getFullYear()}` : `${date.getFullYear()}`;
    formattedDate = formattedDate.replace(textToReplace, "");
  }

  return formattedDate.trim();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateAndTime(
  date: Date,
  dateFormat: DateFormat,
  removeYearIfSame = true
): string {
  let formattedDate = formatDate(date, dateFormat);

  const time = formatTime(date);

  const currentYear = new Date().getFullYear();
  if (currentYear === date.getFullYear() && removeYearIfSame) {
    formattedDate = formattedDate
      .replace(`, ${currentYear}`, "")
      .replace(`/${currentYear}`, "");
    return `${formattedDate} at ${time}`;
  }

  return `${formattedDate} at ${time}`;
}

/**
 * Gets the amount of days between two dates.
 *
 * For example, if `dateA` is January 3rd, 2024 and `dateB` is January 4th, 2024, the function will return 1.
 * Hour/minute values are not factored into the calculation.
 * @param dateA
 * @param dateB
 * @returns
 */
export function getDaysBetweenDates(dateA: Date, dateB: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

  dateA.setHours(0, 0, 0);
  dateB.setHours(0, 0, 0);

  const diffDays = Math.round(
    Math.abs((dateA.valueOf() - dateB.valueOf()) / oneDay)
  );
  return diffDays;
}

export const msUntilNextMinute = () => {
  const now = new Date();
  const nextMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1,
    0,
    0
  );

  return nextMinute.getTime() - now.getTime();
};

/**
 * Gets the number of days in a month.
 * @param date
 */
export function getDaysInMonth(date: Date) {
  const month = date.getMonth();
  const year = date.getFullYear();

  switch (month) {
    // If month is February
    case 1:
      const leapYear = year % 4 === 0 || year % 400 === 0;
      return leapYear ? 29 : 28;
    case 3:
    case 5:
    case 8:
    case 10:
      // If month is April, June, September, or November, set the day amount to 30.
      return 30;
    default:
      return 31;
  }
}

export const isDateTomorrow = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of the day

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  date.setHours(0, 0, 0, 0); // Set to start of the day

  return date.getTime() === tomorrow.getTime();
};
