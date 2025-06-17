import { describe, expect, it } from "vitest";
import { createDefaultSettings } from "../../../main/src/utils/defaultSettings.js";
import {
  FrequencyType,
  frequencyTypeToAdverb,
  frequencyTypeToPluralNoun,
  RepeatDurationType,
  RepeatInfo,
} from "../../src/types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../../src/types/classes/task/scheduledReminder.js";
import {
  getReadableRepeatValue,
  getSimplifiedReadableRepeatValue,
} from "../../src/utils/repeatutils.js";
import { intervalFrequencyTypes } from "./repeatUtilConsts.js";

describe("getReadableRepeatValue", () => {
  const dateFormat = createDefaultSettings().dateFormat;

  describe.for(intervalFrequencyTypes)("fixed interval %i", (frequencyType) => {
    it(`returns "Repeats ${frequencyTypeToAdverb[frequencyType]} when reminder recurs ${frequencyTypeToAdverb[frequencyType]} with no set duration`, () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType,
        frequency: 1,
        durationType: RepeatDurationType.Forever,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe(
        `Repeats ${frequencyTypeToAdverb[frequencyType]}`
      );
    });

    it(`returns "Repeats every {x} ${frequencyTypeToPluralNoun[frequencyType]}" when reminder recurs every x ${frequencyTypeToPluralNoun[frequencyType]} with no set duration`, () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType,
        frequency: 3,
        durationType: RepeatDurationType.Forever,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe(
        `Repeats every 3 ${frequencyTypeToPluralNoun[frequencyType]}`
      );
    });
  });

  describe("Weekdays", () => {
    it('returns "Repeats daily" when reminder recurs on all days with no set duration', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.Weekdays,
        frequency: [true, true, true, true, true, true, true],
        durationType: RepeatDurationType.Forever,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats daily");
    });

    it('returns "Repeats weekdays" when reminder recurs on all weekdays with no set duration', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.Weekdays,
        frequency: [true, true, true, true, true, false, false],
        durationType: RepeatDurationType.Forever,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats weekdays");
    });

    it('returns "Repeats every {day name}" when reminder recurs weekly on a specific day of the week', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.Weekdays,
        frequency: [true, false, false, false, false, false, false],
        durationType: RepeatDurationType.Forever,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats every Monday");
    });

    it('returns "Repeats every {day name} and {second day name}" when reminder recurs on two different days with no set duration', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.Weekdays,
        frequency: [true, false, false, false, false, false, true],
        durationType: RepeatDurationType.Forever,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats every Monday and Sunday");
    });

    it('returns "Repeats every {day name}, {second day name}, {... day name} and {x day name}" when reminder recurs on two or more days with no set duration', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.Weekdays,
        frequency: [true, false, true, false, false, false, true],
        durationType: RepeatDurationType.Forever,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe(
        "Repeats every Monday, Wednesday, and Sunday"
      );
    });
  });

  describe("Set duration", () => {
    it('returns "Repeats {frequency} {duration} more times" when reminder recurs every x days with no elapsed reminders', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.FixedIntervalDays,
        frequency: 3,
        durationType: RepeatDurationType.FixedAmount,
        duration: 5,
        elapsedReminders: 0,
      });

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats every 3 days 5 more times");
    });

    it('returns "Repeats {frequency} {y} more times" when reminder recurs with y times left', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.FixedIntervalDays,
        frequency: 3,
        durationType: RepeatDurationType.FixedAmount,
        duration: 5,
      });

      reminder.repeatInfo.elapsedReminders = 2;

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats every 3 days 3 more times");
    });

    it('returns "Repeats {frequency} 1 more time" when reminder recurs with 1 time left', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.FixedIntervalDays,
        frequency: 3,
        durationType: RepeatDurationType.FixedAmount,
        duration: 5,
      });

      reminder.repeatInfo.elapsedReminders = 4;

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats every 3 days 1 more time");
    });

    it('returns "Repeats {frequency} until {date}" when reminder recurs until a set date', () => {
      const reminder = new ScheduledReminder();
      reminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.FixedIntervalDays,
        frequency: 3,
        durationType: RepeatDurationType.Date,
        duration: new Date("06-20-2025").getTime(),
      });

      reminder.repeatInfo.elapsedReminders = 4;

      const readableRepeatValue = getReadableRepeatValue(reminder, dateFormat);
      expect(readableRepeatValue).toBe("Repeats every 3 days until June 20");
    });
  });
});

describe("getSimplifiedReadableRepeatValue", () => {
  it('returns "Custom" when reminder doesn\'t fit into any simple frequency and has a set duration', () => {
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.FixedIntervalWeeks,
      frequency: 1,
      durationType: RepeatDurationType.FixedAmount,
      duration: 3,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Custom");
  });

  it('returns "Daily" when reminder recurs daily and doesn\'t have a set duration', () => {
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.FixedIntervalDays,
      frequency: 1,
      durationType: RepeatDurationType.Forever,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Daily");
  });

  it('returns "Weekdays" when reminder recurs on all weekdays and doesn\'t have a set duration', () => {
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.Weekdays,
      frequency: [true, true, true, true, true, false, false],
      durationType: RepeatDurationType.Forever,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Weekdays");
  });

  it('returns "Custom" when reminder recurs on some weekdays and doesn\'t have a set duration', () => {
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.Weekdays,
      frequency: [true, true, false, true, true, false, false],
      durationType: RepeatDurationType.Forever,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Custom");
  });

  it('returns "Weekly" when reminder recurs weekly and doesn\'t have a set duration', () => {
    // Monthly, Yearly, Don't Repeat
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.FixedIntervalWeeks,
      frequency: 1,
      durationType: RepeatDurationType.Forever,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Weekly");
  });

  it('returns "Monthly" when reminder recurs monthly and doesn\'t have a set duration', () => {
    // Yearly, Don't Repeat
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.FixedIntervalMonths,
      frequency: 1,
      durationType: RepeatDurationType.Forever,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Monthly");
  });

  it('returns "Yearly" when reminder recurs yearly and doesn\'t have a set duration', () => {
    // Don't Repeat
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.FixedIntervalYears,
      frequency: 1,
      durationType: RepeatDurationType.Forever,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Yearly");
  });

  it('returns "Don\'t Repeat" when reminder does not repeat', () => {
    // Don't Repeat
    const reminder = new ScheduledReminder();
    reminder.repeatInfo = new RepeatInfo({
      frequencyType: FrequencyType.Never,
    });

    const simplifiedReadableRepeatValue =
      getSimplifiedReadableRepeatValue(reminder);
    expect(simplifiedReadableRepeatValue).toBe("Don't Repeat");
  });
});
