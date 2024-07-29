export enum Timeframe {
  All = 'all',
  Today = 'today',
  Tomorrow = 'tomorrow',
  ThisWeek = 'thisWeek',
  NextWeek = 'nextWeek',
  Todo = 'todo',
  Overdue = 'overdue',
}

export const timeframeDisplayNames = ['All Tasks', 'Today', 'Tomorrow', 'This Week', 'Next Week', 'To-do', 'Overdue'];

export function getTimeframeDisplayName(timeframe: Timeframe): string {
  return timeframeDisplayNames[Object.values(Timeframe).indexOf(timeframe)];
}
