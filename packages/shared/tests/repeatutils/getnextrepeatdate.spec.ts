import { describe, expect, it } from "vitest";
import { FrequencyType } from "../../src/types/classes/task/repeatInfo.js";
import { getNextRepeatDate } from "../../src/utils/getnextrepeatdate.js";
import { getDefaultScheduledReminder } from "../../src/utils/scheduledreminderfunctions.js";

describe("getNextRepeatDate", () => {
  describe("weekdays", () => {
    const reminder = getDefaultScheduledReminder();
    reminder.repeatInfo.frequencyType = FrequencyType.Weekdays;
    reminder.repeatInfo.frequency = [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
    ];
    it("should return the next weekday date", () => {
      const today = new Date();
      const nextDate = getNextRepeatDate(reminder);
      // If today is Friday, next date should be Monday
      if (today.getDay() === 5) {
        expect(nextDate.getDay()).toBe(1);
      } else {
        expect(nextDate.getDay()).toBe(today.getDay() + 1);
      }
      expect(nextDate.getHours()).toBe(today.getHours());
      expect(nextDate.getMinutes()).toBe(today.getMinutes());
    });
  });

  describe("fixed intervals", () => {});
});
