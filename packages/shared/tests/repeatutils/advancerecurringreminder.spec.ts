import { describe, expect, it } from "vitest";
import {
  FrequencyType,
  RepeatDurationType,
  RepeatInfo,
} from "../../src/types/classes/task/repeatInfo";
import { advanceRecurringReminderInList } from "../../src/utils/repeatutils/advancerecurringreminder";
import { getDefaultScheduledReminder } from "../../src/utils/scheduledreminderfunctions";

describe("advanceRecurringReminder", () => {
  describe("fixed duration", () => {
    it("adds non-recurring reminder once elasped reminders reaches duration", () => {
      const fixedDurationReminder = getDefaultScheduledReminder();
      fixedDurationReminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.FixedIntervalDays,
        durationType: RepeatDurationType.FixedAmount,
        duration: 3,
      });

      let scheduledReminders = [fixedDurationReminder];
      scheduledReminders = advanceRecurringReminderInList(scheduledReminders);
      expect(scheduledReminders.length).toBe(2);
      expect(scheduledReminders[1].repeatInfo.elapsedReminders).toBe(1);
      scheduledReminders = advanceRecurringReminderInList(scheduledReminders);
      expect(scheduledReminders.length).toBe(3);
      expect(scheduledReminders[2].repeatInfo.elapsedReminders).toBe(2);
      scheduledReminders = advanceRecurringReminderInList(scheduledReminders);
      expect(scheduledReminders.length).toBe(4);
      expect(scheduledReminders[3].repeatInfo.elapsedReminders).toBe(3);
      scheduledReminders = advanceRecurringReminderInList(scheduledReminders);
      expect(scheduledReminders.length).toBe(4);
      expect(scheduledReminders[3].repeatInfo.frequencyType).toBe(
        FrequencyType.Never
      );
    });

    it("adds non-recurring reminder once repeat end date has been passed", () => {
      const fixedDurationReminder = getDefaultScheduledReminder();
      fixedDurationReminder.repeatInfo = new RepeatInfo({
        frequencyType: FrequencyType.FixedIntervalDays,
        durationType: RepeatDurationType.Date,
        duration: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).getTime(),
      });

      let scheduledReminders = [fixedDurationReminder];
      scheduledReminders = advanceRecurringReminderInList(scheduledReminders);
      expect(scheduledReminders.length).toBe(2);
      expect(scheduledReminders[1].repeatInfo.elapsedReminders).toBe(1);
      scheduledReminders = advanceRecurringReminderInList(scheduledReminders);
      expect(scheduledReminders.length).toBe(3);
      expect(scheduledReminders[2].repeatInfo.elapsedReminders).toBe(2);
      scheduledReminders = advanceRecurringReminderInList(scheduledReminders);
      expect(scheduledReminders.length).toBe(3);
      expect(scheduledReminders[2].repeatInfo.frequencyType).toBe(
        FrequencyType.Never
      );
    });
  });
});
