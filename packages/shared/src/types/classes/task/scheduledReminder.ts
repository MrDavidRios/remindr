import { generateUniqueID } from "../../../utils/index.js";
import { FrequencyType, Repeat, RepeatInfo } from "./repeatInfo.js";

/**
 * Scheduled reminder time class.
 *
 * @typedef ReminderTime
 * @property {number} reminderYear The year of this reminder
 * @property {number} reminderMonth The month index of this reminder (0-11)
 * @property {number} reminderDay The day of this reminder
 * @property {number} reminderHour The hour of this reminder (military time, 0-24)
 * @property {number} reminderMinute The minute of this reminder (0-59)
 * @property {string} reminderMeridiem The meridiem of this reminder (String, "AM"/"PM")
 * @property {Repeat} repeat The repeat interval of this reminder (`Repeat` class)
 */
export class ScheduledReminder {
  reminderYear: number;

  reminderMonth: number;

  reminderDay: number;

  reminderHour: number;

  reminderMinute: number;

  reminderMeridiem: "AM" | "PM";

  /**
   * @deprecated replaced by repeatInfo. Kept for backwards compatibility.
   */
  repeat: Repeat;

  repeatInfo: RepeatInfo;

  id: number;

  constructor(
    year?: number,
    month?: number,
    day?: number,
    hour?: number,
    minute?: number,
    meridiem?: "AM" | "PM",
    /**
     * @deprecated
     */
    repeat?: Repeat,
    repeatInfo?: RepeatInfo,
    id?: number
  ) {
    this.reminderYear = year ?? -1; // Default values to signal that the task does not have a remind date
    this.reminderMonth = month ?? -1;
    this.reminderDay = day ?? -1;
    this.reminderHour = hour ?? -1;
    this.reminderMinute = minute ?? -1;
    this.reminderMeridiem = meridiem ?? "AM";
    this.repeat = repeat ?? Repeat.NoRepeat;
    this.repeatInfo = repeatInfo ?? new RepeatInfo(FrequencyType.Never);
    this.id = id ?? generateUniqueID();
  }
}