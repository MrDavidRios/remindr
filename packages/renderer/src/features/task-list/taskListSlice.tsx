import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  AppMode,
  Repeat,
  Task,
  TaskCollection,
  TaskListAction,
  Timeframe,
  generateUniqueID,
  getTimeframeDisplayName,
  setDate,
} from '@remindr/shared';
import { sortForDisplay } from '@renderer/components/task-management-page/task-list-display/task-group/taskgroups';
import { updateOverlayIcons } from '@renderer/scripts/systems/badges';
import { getTaskListWithinTimeframe } from '@renderer/scripts/utils/getReminderListWithinTimeframe';
import getNextRepeatDate from '@renderer/scripts/utils/repeatHelper';
import { saveTaskData } from '@renderer/scripts/utils/taskfunctions';
import { getTaskIdx } from '@renderer/scripts/utils/tasklistutils';
import _ from 'lodash';
import { setAppMode } from '../app-mode/appModeSlice';
import { updateUserState } from '../user-state/userSlice';
import {
  addTaskReducer,
  completeTaskReducer,
  duplicateTaskReducer,
  duplicateTasksReducer,
  markTaskIncompleteReducer,
  pinTasksReducer,
  removeTaskReducer,
  removeTasksReducer,
  unpinTasksReducer,
  updateTaskReducer,
} from './basicTaskListOperations';
import { initializeTaskListSyncListener } from './taskListSync';

export interface TaskListState {
  value: InstanceType<typeof Task>[];
  taskListGetStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  timeframe: Timeframe;
  selectedTasks: InstanceType<typeof Task>[];
  searchQuery: string;
  taskListDisplayOutdated: boolean;
  lastSelectedTaskNoShift?: Task;
  lastTaskListAction?: { type: TaskListAction; task: Task; undone: boolean; relatedTaskId?: number };
}

const initialState: TaskListState = {
  value: [],
  taskListGetStatus: 'idle',
  timeframe: Timeframe.All,
  selectedTasks: [],
  searchQuery: '',
  taskListDisplayOutdated: false,
  lastSelectedTaskNoShift: undefined,
  lastTaskListAction: undefined,
};

export const getTaskList = createAsyncThunk('taskList/getTaskList', async () => {
  const taskListCollection: TaskCollection = await window.data.loadData('tasks');

  // using JSON.stringify makes sure that we're putting the serializable version of the class into state
  return JSON.parse(JSON.stringify(taskListCollection.taskList));
});

export const taskListSlice = createSlice({
  name: 'taskList',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<InstanceType<typeof Task>>) => addTaskReducer(state, action, saveTaskData),
    removeTask: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      removeTaskReducer(state, action, saveTaskData),
    updateTask: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      updateTaskReducer(state, action, saveTaskData),
    duplicateTask: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      duplicateTaskReducer(state, action, saveTaskData),
    completeTask: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      completeTaskReducer(state, action, saveTaskData),
    markTaskIncomplete: (state, action: PayloadAction<InstanceType<typeof Task>>) =>
      markTaskIncompleteReducer(state, action, saveTaskData),
    removeTasks: (state, action: PayloadAction<InstanceType<typeof Task>[]>) =>
      removeTasksReducer(state, action, saveTaskData),
    duplicateTasks: (state, action: PayloadAction<InstanceType<typeof Task>[]>) =>
      duplicateTasksReducer(state, action, saveTaskData),
    pinTasks: (state, action: PayloadAction<InstanceType<typeof Task>[]>) =>
      pinTasksReducer(state, action, saveTaskData),
    unpinTasks: (state, action: PayloadAction<InstanceType<typeof Task>[]>) =>
      unpinTasksReducer(state, action, saveTaskData),
    setTaskList: (state, action: PayloadAction<InstanceType<typeof Task>[]>) => {
      state.value = action.payload;

      saveTaskData(state.value);
    },
    togglePinTask(state, action: PayloadAction<InstanceType<typeof Task>>) {
      const taskIdx = getTaskIdx(action.payload, state.value);
      const oldTaskState = JSON.parse(JSON.stringify(state.value[taskIdx]));

      state.value[taskIdx].pinned = !state.value[taskIdx].pinned;

      state.lastTaskListAction = { type: 'update', task: oldTaskState, undone: false };
      saveTaskData(state.value);
    },
    setTimeframe: (state, action: PayloadAction<Timeframe>) => {
      state.timeframe = action.payload;

      document.title = `${getTimeframeDisplayName(action.payload)} - Remindr`;
    },
    setSelectedTask: (state, action: PayloadAction<InstanceType<typeof Task>>) => {
      const taskIdx = _.findIndex(state.selectedTasks, action.payload);
      if (taskIdx >= 0 && state.selectedTasks.length === 1) {
        // If task is the only one selected, deselect it
        state.selectedTasks.splice(taskIdx, 1);
        state.lastSelectedTaskNoShift = undefined;
        return;
      }

      state.lastSelectedTaskNoShift = action.payload;
      state.selectedTasks = [action.payload];
    },
    addSelectedTask: (state, action: PayloadAction<InstanceType<typeof Task>>) => {
      const taskIdx = _.findIndex(state.selectedTasks, action.payload);
      if (taskIdx >= 0) {
        state.selectedTasks.splice(taskIdx, 1);
        return;
      }

      state.selectedTasks.push(action.payload);
    },
    clearSelectedTasks: (state) => {
      state.selectedTasks = [];
    },
    removeSelectedTask(state, action: PayloadAction<InstanceType<typeof Task>>) {
      _.remove(state.selectedTasks, action.payload);

      if (_.isEqual(state.lastSelectedTaskNoShift, action.payload)) {
        state.lastSelectedTaskNoShift = undefined;
      }
    },
    selectTasksBetween(state, action: PayloadAction<InstanceType<typeof Task>>) {
      const onlyOtherSelectedTaskIsCurrentTask =
        state.selectedTasks.length === 1 && state.selectedTasks[0].creationTime === action.payload.creationTime;

      if (state.selectedTasks.length === 0 || onlyOtherSelectedTaskIsCurrentTask)
        throw new Error('selectTasksBetween: no other tasks selected');

      const tasksOnScreen = sortForDisplay(
        getTaskListWithinTimeframe(state.value, state.timeframe, true),
        state.searchQuery,
      );

      let anchorIdx = _.findIndex(tasksOnScreen, state.lastSelectedTaskNoShift);
      let endingTaskIdx = _.findIndex(tasksOnScreen, action.payload);

      if (anchorIdx > endingTaskIdx) {
        const temp = endingTaskIdx;
        endingTaskIdx = anchorIdx;
        anchorIdx = temp;
      }

      const tasksBetween = tasksOnScreen.slice(anchorIdx, endingTaskIdx + 1);
      state.selectedTasks = tasksBetween;
    },
    setTaskDisplayOutdated: (state, action: PayloadAction<boolean>) => {
      state.taskListDisplayOutdated = action.payload;
    },
    undoTaskListChange: (state) => {
      if (!state.lastTaskListAction) return;
      if (state.lastTaskListAction.undone) return;

      const selectedTaskIdx = _.findIndex(state.selectedTasks, state.lastTaskListAction.task);
      if (selectedTaskIdx >= 0) state.selectedTasks.splice(selectedTaskIdx, 1);

      const taskIdx = getTaskIdx(state.lastTaskListAction.task, state.value);
      switch (state.lastTaskListAction?.type) {
        case 'add':
        case 'duplicate':
          state.value.splice(taskIdx, 1);
          break;
        case 'remove':
          state.value.push(state.lastTaskListAction.task);
          break;
        case 'update':
        case 'complete':
        case 'markIncomplete':
          state.value[taskIdx] = state.lastTaskListAction.task;
          break;
        case 'complete-recurring':
          state.value[taskIdx] = state.lastTaskListAction.task;

          // Here, the related task id is the completed task created when marking the task w/ recurring reminders as complete
          const relatedTaskId = state.lastTaskListAction.relatedTaskId;
          if (relatedTaskId === undefined) {
            throw new Error('[undoTaskListChange - complete-recurring]: Related task ID not found');
          }

          const relatedReminderIdx = state.value.findIndex((t) => t.creationTime === relatedTaskId);
          if (relatedReminderIdx === -1) return;

          state.value.splice(relatedReminderIdx, 1);
          break;
      }

      state.lastTaskListAction.undone = true;
      saveTaskData(state.value);
    },
    advanceRecurringReminder: (
      state,
      action: PayloadAction<{ task: InstanceType<typeof Task>; reminderIdx: number }>,
    ) => {
      const taskIdx = getTaskIdx(action.payload.task, state.value);
      const task = state.value[taskIdx];

      const scheduledReminderClone = JSON.parse(JSON.stringify(task.scheduledReminders[action.payload.reminderIdx]));
      const advancedScheduledReminder = setDate(scheduledReminderClone, getNextRepeatDate(scheduledReminderClone));
      advancedScheduledReminder.id = generateUniqueID();

      state.value[taskIdx].scheduledReminders[action.payload.reminderIdx].repeat = Repeat["Don't Repeat"];
      state.value[taskIdx].scheduledReminders.push(advancedScheduledReminder);
    },
    updateTaskGroupOrder: (state, action: PayloadAction<InstanceType<typeof Task>[]>) => {
      // For each task, remove from state and re-add in new order
      _.remove(state.value, (task) => _.filter(action.payload, (t) => t.creationTime === task.creationTime).length > 0);
      state.value = state.value.concat(action.payload);

      // Don't save if task list hasn't changed
      saveTaskData(state.value);
    },
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTaskList.pending, (state) => {
      if (state.taskListGetStatus !== 'pending') {
        state.taskListGetStatus = 'pending';
      }
    });
    builder.addCase(getTaskList.fulfilled, (state, action) => {
      state.value = action.payload;
      state.taskListGetStatus = 'succeeded';
    });
    builder.addCase(getTaskList.rejected, (state) => {
      if (state.taskListGetStatus !== 'failed') {
        state.taskListGetStatus = 'failed';
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
  removeTask,
  updateTask,
  duplicateTask,
  completeTask,
  markTaskIncomplete,
  removeTasks,
  duplicateTasks,
  pinTasks,
  unpinTasks,
  setTaskList,
  togglePinTask,
  setTimeframe,
  setSelectedTask,
  addSelectedTask,
  removeSelectedTask,
  clearSelectedTasks,
  selectTasksBetween,
  setTaskDisplayOutdated,
  undoTaskListChange,
  advanceRecurringReminder,
  updateTaskGroupOrder,
  updateSearchQuery,
} = taskListSlice.actions;
