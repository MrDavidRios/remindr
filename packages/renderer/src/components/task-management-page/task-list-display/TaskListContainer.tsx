import { Menu, Page, Timeframe } from '@remindr/shared';
import { AppDispatch } from '@renderer/app/store';
import { clearSelectedTasks, getTaskList, setTaskDisplayOutdated } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { getAccentColor } from '@renderer/scripts/systems/stylemanager';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import HashLoader from 'react-spinners/HashLoader';
import { TaskColumns } from './task-columns/TaskColumns';
import { TaskList } from './TaskList';
import { TaskListHeader } from './TaskListHeader';

interface TaskListDisplayProps {
  timeframe: Timeframe;
  taskMenuShown: boolean;
}

export const TaskListDisplay: React.FC<TaskListDisplayProps> = ({ timeframe, taskMenuShown }) => {
  const dispatch = useAppDispatch();

  const taskListGetStatus = useAppSelector((state) => state.taskList.taskListGetStatus);
  const taskView = useAppSelector((state) => state.pageState.currentPage);
  const columnView = taskView === Page.ColumnView;

  // Deselect all tasks on esc keypress
  useHotkey(
    ['esc'],
    () => {
      dispatch(clearSelectedTasks());
    },
    Menu.None,
    {
      disableOnFormTags: true,
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

        <ul id="taskListDisplayContainer" className={`transition-disabled ${columnView ? 'column-view' : ''}`}>
          {taskListGetStatus !== 'succeeded' ? (
            <HashLoader color={getAccentColor()} cssOverride={{ margin: 16 }} />
          ) : columnView ? (
            <TaskColumns />
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
