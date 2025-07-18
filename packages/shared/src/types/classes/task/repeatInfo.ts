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
  FixedIntervalMinutes = "FixedIntervalMinutes",
  FixedIntervalHours = "FixedIntervalHours",
  FixedIntervalDays = "FixedIntervalDays",
  FixedIntervalWeeks = "FixedIntervalWeeks",
  FixedIntervalMonths = "FixedIntervalMonths",
  FixedIntervalYears = "FixedIntervalYears",
  Weekdays = "Weekdays",
  Never = "Never",
}

export type IntervalFrequencyType = Exclude<
  FrequencyType,
  FrequencyType.Weekdays | FrequencyType.Never
>;

export const isIntervalFrequencyType = (
  type?: FrequencyType
): type is IntervalFrequencyType => {
  return (
    type !== undefined &&
    type !== FrequencyType.Weekdays &&
    type !== FrequencyType.Never
  );
};

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
  [FrequencyType.FixedIntervalMinutes]: "every minute",
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
  Forever = "Forever",
  FixedAmount = "FixedAmount",
  Date = "Date",
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
   * If durationType is `Date`, this is the timestamp for when the repeat ends.
   * If durationType is `FixedAmount`, this is the number of times the repeat should occur.
   * If durationType is `Forever`, this is undefined.
   */
  duration?: number;

  /**
   * If durationType is 'FixedAmount`, `elapsedReminders` keeps track of how many times this reminder has been triggered.
   */
  elapsedReminders?: number;
}

export class RepeatInfo {
  frequencyType: FrequencyType;
  frequency?: number | boolean[];
  durationType?: RepeatDurationType;
  duration?: number;
  elapsedReminders = 0;

  constructor(options: RepeatInfoOptions) {
    this.frequencyType = options.frequencyType;
    this.frequency = options.frequency ?? 1;
    this.durationType = options.durationType ?? RepeatDurationType.Forever;
    this.duration = options.duration;
  }
}
