import { ScheduledReminder } from '@remindr/shared';

/**
 * Formats an hour value to be displayed.
 * @param {number} hour - Hour value (standard time, integer)
 */
export function formatHour(hour: number): string {
  if (hour < 10) return `0${hour}`;

  return `${hour}`;
}

/**
 * Formats a minute value to be displayed.
 * @param {number} minute - Minute value (integer)
 */
export function formatMinute(minute: number): string {
  if (minute === 0) return '00';

  if (minute < 10) return `0${minute}`;

  return `${minute}`;
}

/**
 * Converts an hour value from military to standard time.
 * Ex: 21 -> 9 PM
 * @param hour
 * @return If meridiem is true, an object with hour (number) and meridiem (string) is returned. If meridiem is false, the hour (number) is returned.
 */
export function militaryToStandardHour(
  hour: number,
  meridiem = false,
  format = false,
): number | string | { hour: number; meridiem: string } | { hour: string; meridiem: string } {
  let _meridiem: string;

  // Get the meridiem value if requested
  if (hour >= 12) _meridiem = 'PM';
  else _meridiem = 'AM';

  // Convert the hour value
  let hourInStandardTime = hour > 12 ? hour - 12 : hour;
  if (hour === 0) hourInStandardTime = 12;

  if (meridiem) {
    if (format) return { hour: formatHour(hourInStandardTime), meridiem: _meridiem };
    return { hour: hourInStandardTime, meridiem: _meridiem };
  }
  if (format) return formatHour(hourInStandardTime);
  return hourInStandardTime;
}

export function milToStandardHour(
  hour: number,
): number | string | { hour: number; meridiem: string } | { hour: string; meridiem: string } {
  return militaryToStandardHour(hour, false, true);
}

/**
 * Converts an hour in standard time (Ex: 3 PM) to an hour in military time (Ex: 15).
 *
 * Returns given number if already in military time.
 * @param hour
 * @param meridiem
 */
export function standardToMilHour(hour: number, meridiem: string): number {
  if (hour > 12) {
    return hour;
  }

  if (meridiem === 'AM') {
    if (hour === 12) return 0;

    return hour;
  }

  // PM (default)
  if (hour === 12) return 12;

  return hour + 12;
}

/**
 * Returns the formatted time of a reminder.
 * @param reminder
 */
export function getFormattedReminderTime(reminderTime: ScheduledReminder, militaryTime: boolean): string {
  if (militaryTime) {
    return `${reminderTime.reminderHour}:${formatMinute(reminderTime.reminderMinute)}`;
  }

  return `${milToStandardHour(reminderTime.reminderHour)}:${formatMinute(reminderTime.reminderMinute)} ${
    reminderTime.reminderMeridiem
  }`;
}
