import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@renderer/app/store";
import { groupTasks } from "@renderer/components/task-management-page/task-list-display/task-group/taskgroups";

export const tasksInGroupSelector = createSelector(
  [
    (state: RootState) => state.taskList.value,
    (_: RootState, groupName: string) => groupName,
  ],
  (tasks, groupName) => {
    const taskGroups = groupTasks(tasks);
    return taskGroups.get(groupName) ?? [];
  }
);

/**
 * Returns true only if selected tasks and tasks in a group are identical sets.
 */
export const selectedTasksPerfectlyMatchGroupSelector = createSelector(
  [
    (state: RootState, groupName: string) =>
      tasksInGroupSelector(state, groupName),
    (state: RootState) => state.taskList.selectedTasks,
  ],
  (tasksInGroup, selectedTasks) => {
    return (
      tasksInGroup.length === selectedTasks.length &&
      tasksInGroup.every((task) =>
        selectedTasks.some((t) => t.creationTime === task.creationTime)
      )
    );
  }
);

export const allTasksInGroupSelectedSelector = createSelector(
  [
    (state: RootState, groupName: string) =>
      tasksInGroupSelector(state, groupName),
    (state: RootState) => state.taskList.selectedTasks,
  ],
  (tasksInGroup, selectedTasks) => {
    return tasksInGroup.every((task) =>
      selectedTasks.some((t) => t.creationTime === task.creationTime)
    );
  }
);
