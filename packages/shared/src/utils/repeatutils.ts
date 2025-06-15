import { FrequencyType, Repeat, RepeatDurationType } from "../types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../types/classes/task/scheduledReminder.js";
import { DateFormat } from "../types/dateformat.js";
import { formatDate } from "./datefunctions.js";
import { getRepeatValue } from "./repeatcompatibility.js";

export function reminderRepeats(scheduledReminder: ScheduledReminder): boolean {
    if (scheduledReminder.repeatInfo === undefined) {
        console.log('reminder repeats (old):', scheduledReminder)

        return getRepeatValue(scheduledReminder.repeat) !== Repeat.NoRepeat;
    } else {
        console.log('reminder repeats (new):', scheduledReminder)

        return scheduledReminder.repeatInfo.frequencyType !== FrequencyType.Never;
    }
}

export function getReadableRepeatValue(scheduledReminder: ScheduledReminder, dateFormat: DateFormat) {
    if (scheduledReminder.repeat !== undefined) {
        return getRepeatValue(scheduledReminder.repeat);
    }

    const frequencyStr = getReadableRepeatFrequencyValue(scheduledReminder);
    const durationStr = getReadableRepeatDurationValue(scheduledReminder, dateFormat);

    return `${frequencyStr} ${durationStr};`
}

export function getReadableRepeatFrequencyValue(scheduledReminder: ScheduledReminder) {
    if (scheduledReminder.repeatInfo === undefined) {
        return getRepeatValue(scheduledReminder.repeat);
    }

    const { frequencyType } = scheduledReminder.repeatInfo;
    if (frequencyType === FrequencyType.Never)
        return "Does not repeat";

    if (frequencyType === FrequencyType.Weekdays) {
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const selectedDays = scheduledReminder.repeatInfo.frequency as boolean[];
        const selectedDaysStr = selectedDays
            .map((selected, idx) => (selected ? weekdays[idx] : null))
            .filter(day => day !== null)
            .join(", ");
        return `Repeats on: ${selectedDaysStr}`;
    }

    const unitMap: Record<FrequencyType, string> = {
        [FrequencyType.FixedIntervalDays]: "days",
        [FrequencyType.FixedIntervalWeeks]: "weeks",
        [FrequencyType.FixedIntervalMonths]: "months",
        [FrequencyType.FixedIntervalHours]: "hours",
        [FrequencyType.FixedIntervalMinutes]: "minutes",
        [FrequencyType.Weekdays]: "",
        [FrequencyType.Never]: ""
    };
    const unit = unitMap[scheduledReminder.repeatInfo.frequencyType];
    return `Repeats every ${scheduledReminder.repeatInfo.frequency} ${unit}`;
}

export function getReadableRepeatDurationValue(scheduledReminder: ScheduledReminder, dateFormat: DateFormat) {
    if (scheduledReminder.repeatInfo === undefined) {
        return "";
    }

    const { durationType } = scheduledReminder.repeatInfo;
    if (durationType === RepeatDurationType.Forever) {
        return "forever";
    }

    if (durationType === RepeatDurationType.FixedAmount) {
        const remindersLeft = scheduledReminder.repeatInfo.duration as number - scheduledReminder.repeatInfo.elapsedReminders;
        return remindersLeft > 1 ? `${remindersLeft} more times` : `${remindersLeft} more time`;
    }

    if (durationType !== RepeatDurationType.Date) {
        throw new Error('Unexpected repeat duration type: ', durationType)
    }

    return `until ${formatDate(scheduledReminder.repeatInfo.duration as Date, dateFormat)}`
}