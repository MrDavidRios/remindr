import { Timeframe } from "@remindr/shared";
import { useAppSelector } from "@renderer/hooks";
import { getTaskListWithinTimeframe } from "@renderer/scripts/utils/getReminderListWithinTimeframe";
import {
  isValidSearchString,
  searchTasks,
} from "@renderer/scripts/utils/searchutils";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { memo } from "react";
import { shallowEqual } from "react-redux";
import { TaskGroupContainer } from "./task-group/TaskGroupContainer";
import { groupTasks } from "./task-group/taskgroups";
import { TaskTileWrapper } from "./task-tile/TaskTileWrapper";

interface TaskListProps {
  timeframe: Timeframe;
}

export const TaskList = memo(function TaskList({ timeframe }: TaskListProps) {
  const searchQuery = useAppSelector((state) => state.taskList.searchQuery);

  const filteredSearchResults = useAppSelector((state) => {
    const tasks = state.taskList.value;
    const searchResults = searchTasks(tasks, searchQuery);

    const showCompleted = state.settings.value.showCompletedTasks ?? true;
    return showCompleted
      ? searchResults
      : searchResults.filter((task) => !task.completed);
  }, shallowEqual);

  const groups = useAppSelector((state) => {
    const showCompletedTasks = state.settings.value.showCompletedTasks ?? true;
    const filteredTaskList = showCompletedTasks
      ? state.taskList.value
      : state.taskList.value.filter((task) => !task.completed);

    return Array.from(
      groupTasks(getTaskListWithinTimeframe(filteredTaskList, timeframe)).keys()
    );
  }, shallowEqual);

  if (isValidSearchString(searchQuery)) {
    return (
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {filteredSearchResults.map((task) => (
            <div key={task.creationTime}>
              <TaskTileWrapper task={task} />
            </div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    );
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group}>
          <TaskGroupContainer name={group} />
        </div>
      ))}
    </div>
  );
});
