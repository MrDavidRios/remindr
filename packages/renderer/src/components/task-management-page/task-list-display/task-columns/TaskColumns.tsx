import { isReminderToday } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { isValidSearchString, searchTasks } from '@renderer/scripts/utils/searchutils';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { memo } from 'react';
import { shallowEqual } from 'react-redux';
import { TaskTileWrapper } from '../task-tile/TaskTileWrapper';
import { TaskColumn } from './TaskColumn';

export const TaskColumns = memo(function TaskColumns() {
  const searchQuery = useAppSelector((state) => state.taskList.searchQuery);

  const filteredTasks = useAppSelector((state) => {
    const tasks = state.taskList.value;
    const searchResults = searchTasks(tasks, searchQuery);

    const showCompleted = state.settings.value.showCompletedTasks ?? true;
    return showCompleted ? searchResults : searchResults.filter((task) => !task.completed);
  }, shallowEqual);

  const tasksInColumns = filteredTasks.filter((task) => task.taskColumnId !== undefined && task.taskColumnId !== '');
  console.log('[TaskColumns]: tasksInColumns:', tasksInColumns);

  const yesterdayTasks = tasksInColumns.filter(
    (t) =>
      (isReminderToday(t.scheduledReminders[0], true) as { reminderToday: boolean; adjacentDay: string }).adjacentDay ==
      'yesterday',
  );
  const todayTasks = tasksInColumns.filter((t) => isReminderToday(t.scheduledReminders[0]));
  const tomorrowTasks = tasksInColumns.filter(
    (t) =>
      (isReminderToday(t.scheduledReminders[0], true) as { reminderToday: boolean; adjacentDay: string }).adjacentDay ==
      'tomorrow',
  );

  const columns = (
    <div id="taskColumns">
      <TaskColumn name="Yesterday" tasks={yesterdayTasks} />
      <TaskColumn name="Today" tasks={todayTasks} />
      <TaskColumn name="Tomorrow" tasks={tomorrowTasks} />
    </div>
  );

  if (isValidSearchString(searchQuery)) {
    return (
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <div key={task.creationTime}>
              <TaskTileWrapper task={task} reorderable={false} />
            </div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    );
  }

  return columns;
});
