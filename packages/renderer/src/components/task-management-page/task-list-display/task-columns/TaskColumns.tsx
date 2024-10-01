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

  const filteredSearchResults = useAppSelector((state) => {
    const tasks = state.taskList.value;
    const searchResults = searchTasks(tasks, searchQuery);

    const showCompleted = state.settings.value.showCompletedTasks ?? true;
    return showCompleted ? searchResults : searchResults.filter((task) => !task.completed);
  }, shallowEqual);

  const yesterdayTasks = filteredSearchResults.filter(
    (t) =>
      (isReminderToday(t.scheduledReminders[0], true) as { isReminderToday: boolean; adjacentDay: string })
        .adjacentDay == 'yesterday',
  );
  const todayTasks = filteredSearchResults.filter((t) => isReminderToday(t.scheduledReminders[0]));
  const tomorrowTasks = filteredSearchResults.filter(
    (t) =>
      (isReminderToday(t.scheduledReminders[0], true) as { isReminderToday: boolean; adjacentDay: string })
        .adjacentDay == 'tomorrow',
  );

  console.log('yesterdayTasks', yesterdayTasks);
  console.log('todayTasks', todayTasks);
  console.log('tomorrowTasks', tomorrowTasks);

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
          {filteredSearchResults.map((task) => (
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
