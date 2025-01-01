import { Task, getDayName, getReminderDate, getWeekNumber, isOverdue, isReminderToday } from '@remindr/shared';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function categorizeTaskByDate(task: Task): string {
  const { reminderToday, adjacentDay } = isReminderToday(task.scheduledReminders[0], true) as {
    reminderToday: boolean;
    adjacentDay: string;
  };

  if (isOverdue(task.scheduledReminders[0])) return 'Overdue';

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (task.scheduledReminders[0].reminderYear === currentYear) {
    // Compare weeks
    const currentWeek = getWeekNumber(new Date());
    const reminderWeek = getWeekNumber(getReminderDate(task.scheduledReminders[0]));

    if (reminderToday) return 'Today';
    if (adjacentDay === 'tomorrow') return 'Tomorrow';

    if (reminderWeek === currentWeek) return getDayName(getReminderDate(task.scheduledReminders[0])); // Day; Ex: Monday

    if (reminderWeek === currentWeek + 1) return 'Next Week';

    // If not last, this, or next week, return month label.
    if (task.scheduledReminders[0].reminderMonth === currentMonth) return 'This Month';
    if (task.scheduledReminders[0].reminderMonth === currentMonth + 1) return 'Next Month';
    return months[task.scheduledReminders[0].reminderMonth - 1]; // Month; Ex: December
  }
  return `${months[task.scheduledReminders[0].reminderMonth - 1]} ${task.scheduledReminders[0].reminderYear}`; // Month Year; Ex: December 2020
}

// Possibilities: Overdue, Today, Tomorrow, Day name (Monday), Next Week, This Month, Next Month, Month name (December), Month name and year (December 2020)
