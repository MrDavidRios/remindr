import _ from 'lodash';
import { createDefaultSettings } from 'main/types/classes/settings';
import Task from 'main/types/classes/task/task';
import { Timeframe } from 'main/types/timeframe';
import store from 'renderer/app/store';
import { getWeekNumber } from '../../../main/utils/datefunctions';
import { getCalculableDate, isOverdue, isReminderToday } from '../../../main/utils/reminderfunctions';

/**
 * Returns a list of reminders that are within the inputted timeframe.
 *
 * Timeframe options: today, tomorrow, this week, next week, all, todo, overdue
 */

// Caching this since this function is also called from taskListSlice.tsx. Avoids the case of reading the store while being called from the store
let cachedOverdueAsTodaySetting = createDefaultSettings().overdueShownAsToday;
export function getTaskListWithinTimeframe(taskList: Task[], timeframe: Timeframe, fromStore = false): Task[] {
  const overdueShownAsToday = fromStore
    ? cachedOverdueAsTodaySetting
    : store.getState().settings.value.overdueShownAsToday;
  if (!fromStore) cachedOverdueAsTodaySetting = overdueShownAsToday;

  let reminderListWithinTimeframe = taskList;

  switch (timeframe) {
    case 'today':
      reminderListWithinTimeframe = _.filter(reminderListWithinTimeframe, (task: Task) => {
        if (task.scheduledReminders.length === 0) return false;

        if (isReminderToday(task.scheduledReminders[0]) && !isOverdue(task.scheduledReminders[0])) return true;

        if (overdueShownAsToday && !task.completed) {
          if (isOverdue(task.scheduledReminders[0])) return true;
          return false;
        }
        return false;
      });
      break;
    case 'tomorrow':
      reminderListWithinTimeframe = _.filter(reminderListWithinTimeframe, (task: Task) => {
        if (task.scheduledReminders.length === 0) return false;

        const { isReminderToday: reminderToday, adjacentDay } = isReminderToday(task.scheduledReminders[0], true) as {
          isReminderToday: boolean;
          adjacentDay: string;
        };

        return !reminderToday && adjacentDay === 'tomorrow';
      });
      break;
    case 'thisWeek':
      reminderListWithinTimeframe = _.filter(reminderListWithinTimeframe, (task: Task) => {
        if (task.scheduledReminders.length === 0) return false;

        let reminderDate = new Date(
          task.scheduledReminders[0].reminderYear,
          task.scheduledReminders[0].reminderMonth - 1,
          task.scheduledReminders[0].reminderDay,
        );

        reminderDate = getCalculableDate(reminderDate, task.scheduledReminders[0]);

        return getWeekNumber(new Date()) === getWeekNumber(reminderDate);
      });
      break;
    case 'nextWeek':
      reminderListWithinTimeframe = _.filter(reminderListWithinTimeframe, (task: Task) => {
        if (task.scheduledReminders.length === 0) return false;

        let reminderDate = new Date(
          task.scheduledReminders[0].reminderYear,
          task.scheduledReminders[0].reminderMonth - 1,
          task.scheduledReminders[0].reminderDay,
        );

        reminderDate = getCalculableDate(reminderDate, task.scheduledReminders[0]);

        return getWeekNumber(new Date()) + 1 === getWeekNumber(reminderDate);
      });
      break;
    case 'todo':
      reminderListWithinTimeframe = _.filter(reminderListWithinTimeframe, (task: Task) => {
        return task.scheduledReminders.length === 0;
      });
      break;
    case 'overdue':
      reminderListWithinTimeframe = _.filter(reminderListWithinTimeframe, (task: Task) => {
        if (task.scheduledReminders.length === 0) return false;
        if (task.completed) return false;

        return isOverdue(task.scheduledReminders[0]);
      });
      break;
    case 'all':
    default:
      break;
  }

  return reminderListWithinTimeframe;
}
