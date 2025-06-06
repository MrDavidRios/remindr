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
