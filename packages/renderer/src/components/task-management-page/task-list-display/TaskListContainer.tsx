import { Timeframe } from '@remindr/shared';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import HashLoader from 'react-spinners/HashLoader';
import { TaskList } from './TaskList';
import { TaskListHeader } from './TaskListHeader';
import { AppDispatch } from '/@/app/store';
import { clearSelectedTasks, getTaskList, setTaskDisplayOutdated } from '/@/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector, useAppStore } from '/@/hooks';
import { getAccentColor } from '/@/scripts/systems/stylemanager';
import { isFloatingMenuOpen, isFullscreenMenuOpen } from '/@/scripts/utils/menuutils';

interface TaskListDisplayProps {
  timeframe: Timeframe;
  taskMenuShown: boolean;
}

export const TaskListDisplay: React.FC<TaskListDisplayProps> = ({ timeframe, taskMenuShown }) => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const taskListGetStatus = useAppSelector((state) => state.taskList.taskListGetStatus);

  // Deselect all tasks on esc keypress
  useHotkeys(
    'esc',
    () => {
      if (isFullscreenMenuOpen(store.getState().menuState) || isFloatingMenuOpen(store.getState().menuState)) return;

      dispatch(clearSelectedTasks());
    },
    {
      enableOnFormTags: true,
    },
  );

  useEffect(() => {
    attemptGetTaskList(taskListGetStatus, dispatch);
  }, [taskListGetStatus]);

  // Manual rerendering logic
  const taskListOutdated = useAppSelector((state) => state.taskList.taskListDisplayOutdated);
  useEffect(() => {
    if (taskListOutdated) {
      dispatch(setTaskDisplayOutdated(false));
    }
  }, [taskListOutdated]);

  return (
    <motion.div id="taskListContainer" layoutScroll>
      <div id="listWrapper" className={taskMenuShown ? 'show-task-menu' : ''}>
        <TaskListHeader timeframe={timeframe} />

        <ul id="taskListDisplayContainer" className="transition-disabled">
          {taskListGetStatus !== 'succeeded' ? (
            <HashLoader color={getAccentColor()} cssOverride={{ margin: 16 }} />
          ) : (
            <TaskList timeframe={timeframe} />
          )}
        </ul>
      </div>
    </motion.div>
  );
};

function attemptGetTaskList(taskListGetStatus: string, dispatch: AppDispatch) {
  if (taskListGetStatus === 'pending' || taskListGetStatus === 'succeeded') return;

  if (taskListGetStatus === 'failed') {
    // Adding a delay seems to allow enough time for firebase to realize that the client is back online
    setTimeout(() => dispatch(getTaskList()), 1000);
    return;
  }

  // Should automatically retry if failed
  dispatch(getTaskList());
}
