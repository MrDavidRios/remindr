/**
 * @deprecated Use the `RepeatInfo` class instead.
 */
export enum Repeat {
  NoRepeat = "Don't Repeat",
  Daily = "Daily",
  Weekdays = "Weekdays",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
}

export enum FrequencyType {
  FixedIntervalMinutes,
  FixedIntervalHours,
  FixedIntervalDays,
  FixedIntervalWeeks,
  FixedIntervalMonths,
  FixedIntervalYears,
  Weekdays,
  Never,
}

export type IntervalFrequencyType = Exclude<
  FrequencyType,
  FrequencyType.Weekdays | FrequencyType.Never
>;

export const frequencyTypeToPluralNoun: Record<FrequencyType, string> = {
  [FrequencyType.FixedIntervalMinutes]: "minutes",
  [FrequencyType.FixedIntervalHours]: "hours",
  [FrequencyType.FixedIntervalDays]: "days",
  [FrequencyType.FixedIntervalWeeks]: "weeks",
  [FrequencyType.FixedIntervalMonths]: "months",
  [FrequencyType.FixedIntervalYears]: "years",
  [FrequencyType.Weekdays]: "weekdays",
  [FrequencyType.Never]: "never",
};

export const frequencyTypeToAdverb: Record<IntervalFrequencyType, string> = {
  [FrequencyType.FixedIntervalMinutes]: "minutely",
  [FrequencyType.FixedIntervalHours]: "hourly",
  [FrequencyType.FixedIntervalDays]: "daily",
  [FrequencyType.FixedIntervalWeeks]: "weekly",
  [FrequencyType.FixedIntervalMonths]: "monthly",
  [FrequencyType.FixedIntervalYears]: "yearly",
};

export const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export enum RepeatDurationType {
  Forever,
  FixedAmount,
  Date,
}

export interface RepeatInfoOptions {
  frequencyType: FrequencyType;

  /**
   * The frequency of the repeat.
   * If frequencyType is `FixedIntervalX`, this is a number representing the interval in X units (minutes, hours, days, weeks, or months).
   * If frequencyType is `Weekdays`, this is an array of booleans representing the selected days of the week (Monday to Sunday).
   */
  frequency?: number | boolean[];

  durationType?: RepeatDurationType;

  /**
   * If durationType is `Date`, this is the date when the repeat ends.
   * If durationType is `FixedAmount`, this is the number of times the repeat should occur.
   * If durationType is `Forever`, this is undefined.
   */
  duration?: number | Date;

  /**
   * If durationType is 'FixedAmount`, `elapsedReminders` keeps track of how many times this reminder has been triggered.
   */
  elapsedReminders?: number;
}

export class RepeatInfo {
  frequencyType: FrequencyType;
  frequency?: number | boolean[];
  durationType?: RepeatDurationType;
  duration?: number | Date;
  elapsedReminders = 0;

  constructor(options: RepeatInfoOptions) {
    this.frequencyType = options.frequencyType;
    this.frequency = options.frequency ?? 0;
    this.durationType = options.durationType;
    this.duration = options.duration;
  }
}
