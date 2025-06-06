import pinIcon from "@assets/icons/pin.svg";
import { ContextMenuType, isTaskInList } from "@remindr/shared";
import {
  setTaskGroupContextMenuGroup,
  showContextMenu,
} from "@renderer/features/menu-state/menuSlice";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { getTaskListWithinTimeframe } from "@renderer/scripts/utils/getReminderListWithinTimeframe";
import { useAnimationsEnabled } from "@renderer/scripts/utils/hooks/useanimationsenabled";
import { tasksInSameOrder } from "@renderer/scripts/utils/tasklistutils";
import { motion } from "framer-motion";
import _ from "lodash";
import { memo, useEffect, useState } from "react";
import { shallowEqual } from "react-redux";
import { TaskGroup } from "./TaskGroup";
import { getTasksInGroup } from "./taskgroups";

interface TaskGroupContainerProps {
  name: string;
}

export const TaskGroupContainer = memo(function TaskGroupContainer({
  name,
}: TaskGroupContainerProps) {
  const dispatch = useAppDispatch();

  const animationsEnabled = useAnimationsEnabled();

  const tasks = useAppSelector((state) => {
    const timeframe = state.taskList.timeframe;
    const taskListWithinTimeframe = getTaskListWithinTimeframe(
      state.taskList.value,
      timeframe
    );

    return getTasksInGroup(taskListWithinTimeframe, name);
  }, shallowEqual);
  const selectedTasks = useAppSelector((state) => state.taskList.selectedTasks);
  const allTasksInGroupSelected = tasks.every((task) =>
    isTaskInList(task, selectedTasks)
  );

  const [expanded, setExpanded] = useState(true);

  const pinned = name === "Pinned";
  const reorderable = name === "To-do";

  const [orderedTasks, setOrderedTasks] = useState(tasks);
  const groupTasks = reorderable ? orderedTasks : tasks;

  useEffect(() => {
    if (!reorderable) return;

    if (
      !_.isEqual(tasks, orderedTasks) ||
      !tasksInSameOrder(tasks, orderedTasks)
    ) {
      setOrderedTasks(tasks);
    }
  }, [orderedTasks, reorderable, tasks]);

  return (
    <motion.div
      className={`task-group-container ${expanded ? "expanded" : ""} ${
        allTasksInGroupSelected ? "all-tasks-selected" : ""
      }`}
      layout={animationsEnabled ? "position" : false}
    >
      <button
        className={`task-group-header frosted ${pinned ? "icon" : ""} ${
          animationsEnabled ? "animate" : ""
        }`}
        onClick={() => setExpanded(!expanded)}
        onContextMenu={(e) => {
          dispatch(
            showContextMenu({
              contextMenu: ContextMenuType.TaskGroupContextMenu,
              x: e.clientX,
              y: e.clientY,
            })
          );
          dispatch(setTaskGroupContextMenuGroup(name));
        }}
        type="button"
      >
        {pinned && (
          <img
            id="rotatedPinnedIcon"
            src={pinIcon}
            className="svg-filter"
            draggable="false"
            alt=""
          />
        )}
        <span>{name}</span>
        <span className="task-group-counter">{groupTasks.length}</span>
      </button>
      <TaskGroup tasks={groupTasks} expanded={expanded} name={name} />
    </motion.div>
  );
});
