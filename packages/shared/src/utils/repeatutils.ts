import {
  FrequencyType,
  frequencyTypeToAdverb,
  frequencyTypeToPluralNoun,
  Repeat,
  RepeatDurationType,
  weekdays,
} from "../types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../types/classes/task/scheduledReminder.js";
import { DateFormat } from "../types/dateformat.js";
import { formatDate } from "./datefunctions.js";
import { getRepeatValue } from "./repeatcompatibility.js";

export function reminderRepeats(scheduledReminder: ScheduledReminder): boolean {
  if (scheduledReminder.repeatInfo === undefined) {
    return getRepeatValue(scheduledReminder.repeat) !== Repeat.NoRepeat;
  } else {
    return scheduledReminder.repeatInfo.frequencyType !== FrequencyType.Never;
  }
}

export function getReadableRepeatValue(
  scheduledReminder: ScheduledReminder,
  dateFormat: DateFormat
) {
  const frequencyStr = getReadableRepeatFrequencyValue(scheduledReminder);
  const durationStr = getReadableRepeatDurationValue(
    scheduledReminder,
    dateFormat
  );

  return `${frequencyStr} ${durationStr}`.trim();
}

export function getReadableRepeatFrequencyValue(
  scheduledReminder: ScheduledReminder
) {
  if (scheduledReminder.repeatInfo === undefined) {
    return `Repeats ${getRepeatValue(scheduledReminder.repeat)}`;
  }

  const { frequencyType, frequency } = scheduledReminder.repeatInfo;
  if (frequencyType === FrequencyType.Never) return "Does not repeat";

  if (frequencyType === FrequencyType.Weekdays) {
    const selectedDays = scheduledReminder.repeatInfo.frequency as boolean[];
    const selectedDayNames = weekdays.filter((_, idx) => selectedDays[idx]);
    if (selectedDayNames.length === 7) {
      return "Repeats daily";
    }

    if (typeof selectedDays === "number") {
      console.error("Frequency type is Weekdays but frequency is a number");
      return "Repeats never";
    }

    // If all days except Saturday and Sunday are selected, return "Repeats weekdays"
    if (
      selectedDays.slice(0, 5).every(Boolean) && // Monday to Friday are true
      !selectedDays[5] && // Saturday is false
      !selectedDays[6] // Sunday is false
    ) {
      return "Repeats weekdays";
    }

    if (selectedDayNames.length === 1) {
      return `Repeats every ${selectedDayNames[0]}`;
    }

    if (selectedDayNames.length === 2) {
      return `Repeats every ${selectedDayNames[0]} and ${selectedDayNames[1]}`;
    }

    return `Repeats every ${selectedDayNames.slice(0, -1).join(", ")}, and ${
      selectedDayNames[selectedDayNames.length - 1]
    }`;
  }

  if (frequency === 1) {
    return `Repeats ${frequencyTypeToAdverb[frequencyType]}`;
  }

  return `Repeats every ${scheduledReminder.repeatInfo.frequency} ${frequencyTypeToPluralNoun[frequencyType]}`;
}

export function getReadableRepeatDurationValue(
  scheduledReminder: ScheduledReminder,
  dateFormat: DateFormat
) {
  if (scheduledReminder.repeatInfo === undefined) {
    return "";
  }

  const { durationType } = scheduledReminder.repeatInfo;
  if (durationType === RepeatDurationType.Forever) {
    return "";
  }

  if (durationType === RepeatDurationType.FixedAmount) {
    const remindersLeft =
      (scheduledReminder.repeatInfo.duration as number) -
      scheduledReminder.repeatInfo.elapsedReminders;

    return remindersLeft > 1
      ? `${remindersLeft} more times`
      : `${remindersLeft} more time`;
  }

  if (durationType !== RepeatDurationType.Date) {
    console.error("Unexpected repeat duration type: ", durationType);
    return "";
  }

  return `until ${formatDate(
    new Date(scheduledReminder.repeatInfo.duration as number),
    dateFormat
  )}`;
}

export function getSimplifiedReadableRepeatValue(
  scheduledReminder: ScheduledReminder
) {
  if (scheduledReminder.repeatInfo === undefined) {
    return getRepeatValue(scheduledReminder.repeat);
  }

  const { frequencyType, durationType } = scheduledReminder.repeatInfo;
  if (frequencyType === FrequencyType.Never) return "Don't Repeat";
  if (durationType === RepeatDurationType.Forever) {
    switch (frequencyType) {
      case FrequencyType.FixedIntervalDays:
        return "Daily";
      case FrequencyType.FixedIntervalWeeks:
        return "Weekly";
      case FrequencyType.FixedIntervalMonths:
        return "Monthly";
      case FrequencyType.FixedIntervalYears:
        return "Yearly";
      case FrequencyType.Weekdays:
        const selectedDays = scheduledReminder.repeatInfo
          .frequency as boolean[];
        if (
          selectedDays.slice(0, 5).every(Boolean) && // Monday to Friday are true
          !selectedDays[5] && // Saturday is false
          !selectedDays[6]
        )
          return "Weekdays";
        else return "Custom";
      default:
        return "Custom";
    }
  }

  return "Custom";
}
