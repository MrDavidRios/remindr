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
  const yesterdayTasks = tasksInColumns.filter((t) => t.taskColumnId === 'Yesterday');
  const todayTasks = tasksInColumns.filter((t) => t.taskColumnId === 'Today');
  const tomorrowTasks = tasksInColumns.filter((t) => t.taskColumnId === 'Tomorrow');

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
              <TaskTileWrapper task={task} />
            </div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    );
  }

  return columns;
});
