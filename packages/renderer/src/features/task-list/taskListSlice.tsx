import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  AppMode,
  Task,
  TaskCollection,
  TaskListAction,
  Timeframe,
  getTimeframeDisplayName,
} from "@remindr/shared";
import { advanceRecurringReminderInList } from "@remindr/shared/src";
import {
  getTasksInGroup,
  sortForDisplay,
} from "@renderer/components/task-management-page/task-list-display/task-group/taskgroups";
import { updateOverlayIcons } from "@renderer/scripts/systems/badges";
import { getTaskListWithinTimeframe } from "@renderer/scripts/utils/getReminderListWithinTimeframe";
import { getTaskIdx } from "@renderer/scripts/utils/tasklistutils";
import _ from "lodash";
import { setAppMode } from "../app-mode/appModeSlice";
import { updateUserState } from "../user-state/userSlice";
import {
  addTaskReducer,
  completeTaskReducer,
  duplicateTasksReducer,
  markTaskIncompleteReducer,
  pinTasksReducer,
  removeTasksReducer,
  unpinTasksReducer,
  updateTaskReducer,
} from "./basicTaskListOperations";
import { initializeTaskListSyncListener } from "./taskListSync";

function saveTaskData(taskList: Task[]) {
  window.data.saveTaskData(JSON.stringify(taskList));
}

export interface TaskListState {
  value: InstanceType<typeof Task>[];
  taskListGetStatus: "idle" | "pending" | "succeeded" | "failed";
  timeframe: Timeframe;
  selectedTasks: InstanceType<typeof Task>[];
  searchQuery: string;
  taskListDisplayOutdated: boolean;
  lastSelectedTaskNoShift?: Task;
  lastTaskListAction?: {
    type: TaskListAction;
    tasks: Task[];
    undone: boolean;
    relatedTaskId?: number;
  };
}

const initialState: TaskListState = {
  value: [],
  taskListGetStatus: "idle",
  timeframe: Timeframe.All,
  selectedTasks: [],
  searchQuery: "",
  taskListDisplayOutdated: false,
  lastSelectedTaskNoShift: undefined,
  lastTaskListAction: undefined,
};

export const getTaskList = createAsyncThunk(
  "taskList/getTaskList",
  async () => {
    const taskListCollection: TaskCollection = await window.data.loadTaskData();

    // using JSON.stringify makes sure that we're putting the serializable version of the class into state
    return JSON.parse(JSON.stringify(taskListCollection.taskList));
  }
);

export const taskListSlice = createSlice({
  name: "taskList",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      addTaskReducer(state, action, saveTaskData),
    updateTask: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      updateTaskReducer(state, action, saveTaskData),
    completeTask: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      completeTaskReducer(state, action, saveTaskData),
    markTaskIncomplete: (
      state,
      action: PayloadAction<InstanceType<typeof Task>>
    ) => markTaskIncompleteReducer(state, action, saveTaskData),
    removeTasks: (state, action: PayloadAction<InstanceType<typeof Task>[]>) =>
      removeTasksReducer(state, action, saveTaskData),
    duplicateTasks: (
      state,
      action: PayloadAction<InstanceType<typeof Task>[]>
    ) => duplicateTasksReducer(state, action, saveTaskData),
    pinTasks: (state, action: PayloadAction<InstanceType<typeof Task>[]>) =>
      pinTasksReducer(state, action, saveTaskData),
    unpinTasks: (state, action: PayloadAction<InstanceType<typeof Task>[]>) =>
      unpinTasksReducer(state, action, saveTaskData),
    setTaskList: (
      state,
      action: PayloadAction<InstanceType<typeof Task>[]>
    ) => {
      state.value = action.payload;

      saveTaskData(state.value);
    },
    togglePinTask(state, action: PayloadAction<InstanceType<typeof Task>>) {
      const taskIdx = getTaskIdx(action.payload, state.value);
      const oldTaskState: Task = JSON.parse(
        JSON.stringify(state.value[taskIdx])
      );

      state.value[taskIdx].pinned = !state.value[taskIdx].pinned;

      state.lastTaskListAction = {
        type: "update",
        tasks: [oldTaskState],
        undone: false,
      };
      saveTaskData(state.value);
    },
    removeFromColumn(state, action: PayloadAction<InstanceType<typeof Task>>) {
      const taskIdx = getTaskIdx(action.payload, state.value);
      const oldTaskState: Task = JSON.parse(
        JSON.stringify(state.value[taskIdx])
      );

      state.value[taskIdx].columnIdx = undefined;

      state.lastTaskListAction = {
        type: "update",
        tasks: [oldTaskState],
        undone: false,
      };
      saveTaskData(state.value);
    },
    setTimeframe: (state, action: PayloadAction<Timeframe>) => {
      state.timeframe = action.payload;

      document.title = `${getTimeframeDisplayName(action.payload)} - Remindr`;
    },
    setSelectedTask: (
      state,
      action: PayloadAction<InstanceType<typeof Task>>
    ) => {
      const taskIdx = getTaskIdx(action.payload, state.selectedTasks);

      if (taskIdx >= 0 && state.selectedTasks.length === 1) {
        // If task is the only one selected, deselect it
        state.selectedTasks.splice(taskIdx, 1);
        state.lastSelectedTaskNoShift = undefined;
        return;
      }

      state.lastSelectedTaskNoShift = action.payload;
      state.selectedTasks = [action.payload];
    },
    setSelectedTasks: (
      state,
      action: PayloadAction<InstanceType<typeof Task>[]>
    ) => {
      const tasksToAddToSelection = action.payload.filter(
        (task) => getTaskIdx(task, state.value) !== -1
      );

      state.selectedTasks = tasksToAddToSelection;
    },
    addSelectedTask: (
      state,
      action: PayloadAction<InstanceType<typeof Task>>
    ) => {
      const taskIdx = getTaskIdx(action.payload, state.selectedTasks);

      if (taskIdx >= 0) {
        state.selectedTasks.splice(taskIdx, 1);
        return;
      }

      state.selectedTasks.push(action.payload);
    },
    clearSelectedTasks: (state) => {
      state.selectedTasks = [];
    },
    removeSelectedTask(
      state,
      action: PayloadAction<InstanceType<typeof Task>>
    ) {
      _.remove(state.selectedTasks, action.payload);

      if (_.isEqual(state.lastSelectedTaskNoShift, action.payload)) {
        state.lastSelectedTaskNoShift = undefined;
      }
    },
    selectTasksBetween(
      state,
      action: PayloadAction<InstanceType<typeof Task>>
    ) {
      const onlyOtherSelectedTaskIsCurrentTask =
        state.selectedTasks.length === 1 &&
        state.selectedTasks[0].creationTime === action.payload.creationTime;

      // If there currently aren't any selected tasks, select the chosen task
      if (state.selectedTasks.length === 0) {
        state.selectedTasks = [action.payload];
        return;
      }

      // If the other selected task is the current one, de-select it
      if (onlyOtherSelectedTaskIsCurrentTask) {
        state.selectedTasks = [];
        return;
      }

      const tasksOnScreen = sortForDisplay(
        getTaskListWithinTimeframe(state.value, state.timeframe, true),
        state.searchQuery
      );

      let anchorIdx = getTaskIdx(state.lastSelectedTaskNoShift, tasksOnScreen);
      let endingTaskIdx = getTaskIdx(action.payload, tasksOnScreen);

      if (anchorIdx > endingTaskIdx) {
        const temp = endingTaskIdx;
        endingTaskIdx = anchorIdx;
        anchorIdx = temp;
      }

      const tasksBetween = tasksOnScreen.slice(anchorIdx, endingTaskIdx + 1);

      state.selectedTasks = tasksBetween;
    },
    selectAllTasksInGroup(state, action: PayloadAction<string>) {
      const tasksInGroup = getTasksInGroup(state.value, action.payload);
      state.selectedTasks = tasksInGroup;
    },
    deselectAllTasksInGroup(state, action: PayloadAction<string>) {
      const tasksInGroupIds = getTasksInGroup(state.value, action.payload).map(
        (task) => task.creationTime
      );
      state.selectedTasks = state.selectedTasks.filter(
        (task) => !tasksInGroupIds.includes(task.creationTime)
      );
    },
    setTaskDisplayOutdated: (state, action: PayloadAction<boolean>) => {
      state.taskListDisplayOutdated = action.payload;
    },
    undoTaskListChange: (state) => {
      if (!state.lastTaskListAction) return;
      if (state.lastTaskListAction.undone) return;

      // If the task we're modifying through undo is selected, de-select it before modifying it.
      for (const task of state.lastTaskListAction.tasks) {
        const selectedTaskIdx = getTaskIdx(task, state.selectedTasks);
        if (selectedTaskIdx >= 0)
          state.selectedTasks.splice(selectedTaskIdx, 1);

        const taskIdx = getTaskIdx(task, state.value);
        switch (state.lastTaskListAction?.type) {
          case "add":
          case "duplicate":
            state.value.splice(taskIdx, 1);
            break;
          case "remove":
            state.value.push(task);
            break;
          case "update":
          case "complete":
          case "markIncomplete":
          case "pin":
          case "unpin":
            state.value[taskIdx] = task;
            break;
          case "complete-recurring": {
            state.value[taskIdx] = task;

            // Here, the related task is the completed task created when marking the task w/ recurring reminders as complete
            const relatedTaskId = state.lastTaskListAction.relatedTaskId;
            if (relatedTaskId === undefined) {
              throw new Error(
                "[undoTaskListChange - complete-recurring]: Related task ID not found"
              );
            }

            const relatedReminderIdx = state.value.findIndex(
              (t) => t.creationTime === relatedTaskId
            );
            if (relatedReminderIdx === -1) return;

            state.value.splice(relatedReminderIdx, 1);
            break;
          }
        }
      }

      state.lastTaskListAction.undone = true;
      saveTaskData(state.value);
    },
    advanceRecurringReminderInTask: (
      state,
      action: PayloadAction<{
        task: InstanceType<typeof Task>;
        reminderIdx: number;
      }>
    ) => {
      const taskIdx = getTaskIdx(action.payload.task, state.value);
      const task = state.value[taskIdx];

      const updatedScheduledReminders = advanceRecurringReminderInList(
        task.scheduledReminders,
        action.payload.reminderIdx
      );
      state.value[taskIdx].scheduledReminders = updatedScheduledReminders;
    },
    updateTaskGroupOrder: (
      state,
      action: PayloadAction<InstanceType<typeof Task>[]>
    ) => {
      // For each task, remove from state and re-add in new order
      _.remove(
        state.value,
        (task) =>
          _.filter(action.payload, (t) => t.creationTime === task.creationTime)
            .length > 0
      );
      state.value = state.value.concat(action.payload);

      // Don't save if task list hasn't changed
      saveTaskData(state.value);
    },
    /**
     * Updates a specific set of tasks.
     * @param state
     * @param action
     */
    updateTasks: (
      state,
      action: PayloadAction<InstanceType<typeof Task>[]>
    ) => {
      // for each task, update the task in the state
      for (const task of action.payload) {
        const taskIdx = getTaskIdx(task, state.value);
        state.value[taskIdx] = task;
      }

      saveTaskData(state.value);
    },
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTaskList.pending, (state) => {
      if (state.taskListGetStatus !== "pending") {
        state.taskListGetStatus = "pending";
      }
    });
    builder.addCase(getTaskList.fulfilled, (state, action) => {
      state.value = action.payload;
      state.taskListGetStatus = "succeeded";
    });
    builder.addCase(getTaskList.rejected, (state) => {
      if (state.taskListGetStatus !== "failed") {
        state.taskListGetStatus = "failed";
      }
    });
    /*
     * Mimicking pageLogic.tsx's logic, this resets the task list/task list get state when:
     * - App mode is set to login screen/offline
     * - User signs out
     */
    builder.addCase(setAppMode, (state, action) => {
      if (action.payload !== AppMode.Online) resetTaskListState(state);
    });
    builder.addCase(updateUserState, (state, action) => {
      // If user is de-authenticated, clear task list
      if (!action.payload.authenticated) resetTaskListState(state);
    });
  },
});

function resetTaskListState(state: TaskListState) {
  state.value = initialState.value;
  state.taskListGetStatus = initialState.taskListGetStatus;
  state.timeframe = initialState.timeframe;
  state.selectedTasks = initialState.selectedTasks;
  state.taskListDisplayOutdated = initialState.taskListDisplayOutdated;
  state.lastSelectedTaskNoShift = initialState.lastSelectedTaskNoShift;
  state.lastTaskListAction = initialState.lastTaskListAction;

  updateOverlayIcons(initialState.value);
}

initializeTaskListSyncListener();

export default taskListSlice.reducer;
export const {
  addTask,
  updateTask,
  updateTasks,
  completeTask,
  markTaskIncomplete,
  removeTasks,
  duplicateTasks,
  pinTasks,
  unpinTasks,
  setTaskList,
  togglePinTask,
  removeFromColumn,
  setTimeframe,
  setSelectedTask,
  addSelectedTask,
  removeSelectedTask,
  clearSelectedTasks,
  setSelectedTasks,
  selectTasksBetween,
  selectAllTasksInGroup,
  deselectAllTasksInGroup,
  setTaskDisplayOutdated,
  undoTaskListChange,
  advanceRecurringReminderInTask,
  updateTaskGroupOrder,
  updateSearchQuery,
} = taskListSlice.actions;
