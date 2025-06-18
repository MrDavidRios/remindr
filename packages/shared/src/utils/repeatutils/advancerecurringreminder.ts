import { FrequencyType } from "../../types/classes/task/repeatInfo.js";
import { ScheduledReminder } from "../../types/classes/task/scheduledReminder.js";
import { generateUniqueID } from "../idutils.js";
import {
  getScheduledReminderClone,
  setDate,
  sortReminders,
} from "../scheduledreminderfunctions.js";
import { getNextRepeatDate } from "./getnextrepeatdate.js";
import {
  canReminderBeFurtherAdvanced,
  reminderRepeats,
} from "./repeatutils.js";

export function advanceRecurringReminder(scheduledReminder: ScheduledReminder) {
  if (!reminderRepeats(scheduledReminder))
    throw new Error("Scheduled reminder does not repeat.");

  const scheduledReminderClone = getScheduledReminderClone(scheduledReminder);

  const advancedScheduledReminder = setDate(
    scheduledReminderClone,
    getNextRepeatDate(scheduledReminderClone)
  );

  advancedScheduledReminder.repeatInfo.elapsedReminders++;
  advancedScheduledReminder.id = generateUniqueID();

  return advancedScheduledReminder;
}

/**
 * If scheduled reminder list contains a recurring reminder, this function advances it.
 * Defaults to find the frist recurring reminder in list and advances it. Optionally takes in a specific reminder idx.
 */
export function advanceRecurringReminderInList(
  scheduledReminders: ScheduledReminder[],
  idx = -1
) {
  const reminderListClone: ScheduledReminder[] = JSON.parse(
    JSON.stringify(scheduledReminders)
  );
  const firstRecurringReminderIdx = reminderListClone.findIndex((r) =>
    reminderRepeats(r)
  );
  if (firstRecurringReminderIdx === -1) return reminderListClone;
  if (idx !== -1 && idx >= reminderListClone.length)
    throw new Error(`Index ${idx} outside bounds of scheduled reminders.`);
  if (idx !== -1 && !reminderRepeats(reminderListClone[idx]))
    throw new Error(`Reminder at index ${idx} does not repeat.`);

  const scheduledReminderIdx = idx === -1 ? firstRecurringReminderIdx : idx;

  const advancedScheduledReminder = advanceRecurringReminder(
    reminderListClone[scheduledReminderIdx]
  );

  // If this was the last possible time the reminder can be advanced,
  // set it to never repeat.
  if (!canReminderBeFurtherAdvanced(advancedScheduledReminder)) {
    advancedScheduledReminder.repeatInfo.frequencyType = FrequencyType.Never;
  }

  reminderListClone[scheduledReminderIdx].repeatInfo.frequencyType =
    FrequencyType.Never;
  reminderListClone.push(advancedScheduledReminder);
  return sortReminders(reminderListClone);
}
