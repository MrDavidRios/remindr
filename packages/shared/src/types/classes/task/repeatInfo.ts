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
    Weekdays,
    Never
}

export enum RepeatDurationType {
    Forever,
    FixedAmount,
    Date,
}

export class RepeatInfo {
    frequencyType: FrequencyType;

    /**
     * The frequency of the repeat.
     * If frequencyType is `FixedIntervalX`, this is a number representing the interval in X units (minutes, hours, days, weeks, or months).
     * If frequencyType is `Weekdays`, this is an array of booleans representing thes selected days of the week (Sunday to Saturday).
     */
    frequency: number | boolean[];

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
    elapsedReminders = 0;

    constructor(
        frequencyType: FrequencyType,
        frequency?: number | boolean[],
        durationType?: RepeatDurationType,
        duration?: number | Date
    ) {
        this.frequencyType = frequencyType;
        this.frequency = frequency ?? 0;
        this.durationType = durationType;
        this.duration = duration;
    }
}