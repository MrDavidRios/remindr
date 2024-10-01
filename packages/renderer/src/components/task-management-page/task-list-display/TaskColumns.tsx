import { isReminderToday, Timeframe } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { getTaskListWithinTimeframe } from '@renderer/scripts/utils/getReminderListWithinTimeframe';
import { isValidSearchString, searchTasks } from '@renderer/scripts/utils/searchutils';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { memo } from 'react';
import { shallowEqual } from 'react-redux';
import { groupTasks } from './task-group/taskgroups';
import { TaskTileWrapper } from './task-tile/TaskTileWrapper';

interface TaskColumnsProps {
  timeframe: Timeframe;
}

export const TaskColumns = memo(function TaskColumns({ timeframe }: TaskColumnsProps) {
  const searchQuery = useAppSelector((state) => state.taskList.searchQuery);

  const filteredSearchResults = useAppSelector((state) => {
    const tasks = state.taskList.value;
    const searchResults = searchTasks(tasks, searchQuery);

    const showCompleted = state.settings.value.showCompletedTasks ?? true;
    return showCompleted ? searchResults : searchResults.filter((task) => !task.completed);
  }, shallowEqual);

  const groups = useAppSelector((state) => {
    const showCompletedTasks = state.settings.value.showCompletedTasks ?? true;
    const filteredTaskList = showCompletedTasks
      ? state.taskList.value
      : state.taskList.value.filter((task) => !task.completed);

    return Array.from(groupTasks(getTaskListWithinTimeframe(filteredTaskList, timeframe)).keys());
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
      <div className="task-column">
        <h2>Yesterday</h2>
        <div className="tasks">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {yesterdayTasks.map((task) => (
                <div key={task.creationTime}>
                  <TaskTileWrapper task={task} reorderable={false} />
                </div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>

      <div className="task-column">
        <h2>Today</h2>
        <div className="tasks">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {todayTasks.map((task) => (
                <div key={task.creationTime}>
                  <TaskTileWrapper task={task} reorderable={false} />
                </div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>

      {/* Tomorrow */}
      <div className="task-column">
        <h2>Tomorrow</h2>
        <div className="tasks">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {tomorrowTasks.map((task) => (
                <div key={task.creationTime}>
                  <TaskTileWrapper task={task} reorderable={false} />
                </div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>
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
