import { createDefaultSettings, TASK_COLUMNS } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { isValidSearchString, searchTasks } from '@renderer/scripts/utils/searchutils';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { memo } from 'react';
import { shallowEqual } from 'react-redux';
import { TaskTileWrapper } from '../task-tile/TaskTileWrapper';
import { TaskColumn } from './TaskColumn';

export const TaskColumns = memo(function TaskColumns() {
  const searchQuery = useAppSelector((state) => state.taskList.searchQuery);
  const enabledTaskColumns =
    useAppSelector((state) => state.settings.value.enabledTaskColumns) ?? createDefaultSettings().enabledTaskColumns;

  const filteredTasks = useAppSelector((state) => {
    const tasks = state.taskList.value;
    const searchResults = searchTasks(tasks, searchQuery);

    const showCompleted = state.settings.value.showCompletedTasks ?? true;
    return showCompleted ? searchResults : searchResults.filter((task) => !task.completed);
  }, shallowEqual);

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

  const taskColumnsToRender = Array.from(TASK_COLUMNS.keys()).filter((columnIdx) =>
    enabledTaskColumns.includes(columnIdx),
  );
  console.log('Rendering task columns', taskColumnsToRender);

  return (
    <div id="taskColumns">
      {taskColumnsToRender.map((columnIdx) => {
        const columnName = TASK_COLUMNS.get(columnIdx);
        if (!columnName) {
          return null;
        }

        const tasksInColumn = filteredTasks.filter((task) => task.columnIdx === columnIdx);
        return <TaskColumn key={columnName} name={columnName} tasks={tasksInColumn} />;
      })}
    </div>
  );
});
