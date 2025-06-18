import { describe, expect, it } from "vitest";
import { FrequencyType } from "../../src/types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../../src/types/classes/task/scheduledReminder.js";
import { getNextRepeatDate } from "../../src/utils/repeatutils/getnextrepeatdate.js";
import { setDate } from "../../src/utils/scheduledreminderfunctions.js";

describe("getNextRepeatDate", () => {
  describe("weekdays", () => {
    const tuesday = new Date("06-17-2025");
    const reminder = setDate(new ScheduledReminder(), tuesday);
    reminder.repeatInfo.frequencyType = FrequencyType.Weekdays;
    reminder.repeatInfo.frequency = [
      true, // Monday
      true, // Tuesday
      false, // Wednesday
      true, // Thursday
      true, // Friday
      false, // Saturday
      false, // Sunday
    ];

    it("should return the next weekday date", () => {
      const thursday = new Date("06-19-2025");
      const nextDate = getNextRepeatDate(reminder);
      // If today is Friday, next date should be Monday
      expect(nextDate).toEqual(thursday);
      expect(nextDate.getHours()).toBe(tuesday.getHours());
      expect(nextDate.getMinutes()).toBe(tuesday.getMinutes());
    });
  });

  describe("fixed intervals", () => {
    const reminder = setDate(new ScheduledReminder(), new Date());

    it("should return the next date after three days", () => {
      reminder.repeatInfo.frequencyType = FrequencyType.FixedIntervalDays;
      reminder.repeatInfo.frequency = 3;

      const today = new Date();
      const nextDate = getNextRepeatDate(reminder);
      expect(nextDate.getDate()).toBe(today.getDate() + 3);
      expect(nextDate.getHours()).toBe(today.getHours());
      expect(nextDate.getMinutes()).toBe(today.getMinutes());
    });

    it("should return the next date after two minutes", () => {
      reminder.repeatInfo.frequencyType = FrequencyType.FixedIntervalMinutes;
      reminder.repeatInfo.frequency = 2;

      const now = new Date();
      // Must be rounded to nearest minute, since getNextRepeatDate uses getReminderDate, which rounds
      // to the nearest minute (since seconds aren't saved as part of reminders yet)
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        0,
        0
      );
      const nextDate = getNextRepeatDate(reminder);

      expect(nextDate.getTime()).toBe(today.getTime() + 2 * 60 * 1000);
      expect(nextDate.getHours()).toBe(today.getHours());
      expect(nextDate.getMinutes()).toBe((today.getMinutes() + 2) % 60);
    });
  });
});
