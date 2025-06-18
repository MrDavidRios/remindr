import {
  ActionCreatorWithPayload,
  Dispatch,
  Middleware,
} from "@reduxjs/toolkit";
import { isSameTask, isTaskInList, Task } from "@remindr/shared";
import { RootState } from "@renderer/app/store";
import {
  clearTaskEditState,
  setEditedTask,
  setOriginalTask,
} from "@renderer/features/task-modification/taskModificationSlice";
import {
  getTaskFromList,
  getTaskIdx,
} from "@renderer/scripts/utils/tasklistutils";
import {
  advanceRecurringReminder,
  completeTask,
  removeTasks,
  togglePinTask,
  updateTask,
  updateTasks,
} from "../taskListSlice";

export const syncModifiedTaskMiddleware: Middleware =
  ({ getState, dispatch }: { getState: () => RootState; dispatch: Dispatch }) =>
  (next) =>
  (action) => {
    const result = next(action);

    const currentlyEditedTask =
      getState().taskModificationState.taskEditState.originalTask;
    if (currentlyEditedTask === undefined) return result;

    // If currently edited task is completed, clear taskmodificationstate.taskEditState
    if (completeTask.match(action)) {
      if (isSameTask(currentlyEditedTask, action.payload)) {
        dispatch(clearTaskEditState());
      }
    }

    // If currently edited task is removed, clear taskmodificationstate.taskEditState
    if (removeTasks.match(action)) {
      if (isTaskInList(currentlyEditedTask, action.payload)) {
        dispatch(clearTaskEditState());
      }
    }

    // If currently edited task is updated externally, update edited task in taskModificationState
    const taskUpdateActions = [
      updateTask,
      advanceRecurringReminder,
      togglePinTask,
    ];
    if (
      taskUpdateActions.some((actionCreator) => actionCreator.match(action))
    ) {
      const typedAction = action as { payload: any };
      const task =
        "task" in typedAction.payload
          ? typedAction.payload.task
          : typedAction.payload;

      if (isSameTask(currentlyEditedTask, task)) {
        const taskList = getState().taskList.value;
        const updatedTask = taskList[getTaskIdx(currentlyEditedTask, taskList)];

        dispatch(
          setOriginalTask({
            creating: false,
            task,
          })
        );
        dispatch(
          setEditedTask({
            creating: false,
            task: updatedTask,
          })
        );
      }
    }

    const multipleTaskUpdateActions: ActionCreatorWithPayload<
      Task[],
      string
    >[] = [updateTasks];
    if (
      multipleTaskUpdateActions.some((actionCreator) =>
        actionCreator.match(action)
      )
    ) {
      const { payload: task } = action as { payload: Task[]; type: string };
      const taskWasEdited =
        getTaskFromList(currentlyEditedTask, task) !== undefined;
      if (taskWasEdited) {
        const updatedTask = getTaskFromList(
          currentlyEditedTask,
          getState().taskList.value
        );
        if (!updatedTask) return result;

        dispatch(
          setOriginalTask({
            creating: false,
            task: currentlyEditedTask,
          })
        );
        dispatch(
          setEditedTask({
            creating: false,
            task: updatedTask,
          })
        );
      }
    }
    return result;
  };
