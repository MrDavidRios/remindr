import { ContextMenuType, Task, reminderRepeats, taskHasNotes } from '@remindr/shared';
import { AppDispatch } from '@renderer/app/store';
import { showContextMenu } from '@renderer/features/menu-state/menuSlice';
import {
  addSelectedTask,
  removeSelectedTask,
  selectTasksBetween,
  setSelectedTask,
} from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { getTaskIdx } from '@renderer/scripts/utils/tasklistutils';
import { Reorder, motion, useMotionValue } from 'framer-motion';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import { TaskTileContents } from './TaskTileContents';

interface TaskTileWrapperProps {
  task: Task;
  reorderable?: boolean;
  onReorderComplete?: () => void;
}

/// Returns true if there was no change in task selection state (tells React to not re-render)
const taskSelectionChange = (task: Task, selectedTasksBefore: Task[], selectedTasksAfter: Task[]) => {
  const wasSelectedBefore = _.some(
    selectedTasksBefore,
    (selectedTask) => selectedTask.creationTime === task.creationTime,
  );
  const isSelectedAfter = _.some(selectedTasksAfter, (selectedTask) => selectedTask.creationTime === task.creationTime);

  return wasSelectedBefore === isSelectedAfter;
};

export const TaskTileWrapper: React.FC<TaskTileWrapperProps> = ({ task, reorderable = false, onReorderComplete }) => {
  const dispatch = useAppDispatch();

  const selectedTasks = useAppSelector(
    (state) => state.taskList.selectedTasks,
    (selectedTasksBefore, selectedTasksAfter) => taskSelectionChange(task, selectedTasksBefore, selectedTasksAfter),
  );

  const selected = getTaskIdx(task, selectedTasks) >= 0;

  const hasReminders = task.scheduledReminders.length > 0;
  const hasNotes = taskHasNotes(task);
  const repeats = hasReminders ? reminderRepeats(task.scheduledReminders[0]) : false;
  const multipleReminders = task.scheduledReminders.length > 1;
  const hasSubtasks = task.subtasks.length > 0;
  const hasLinks = task.links?.length > 0;

  const hasIndicators = hasReminders || hasNotes || repeats || multipleReminders || hasSubtasks || hasLinks;

  const animationsEnabled = useAnimationsEnabled();

  const opacity = task.completed ? 0.7 : 1;
  const y = useMotionValue(0);
  const taskTileProps = {
    className: taskTileClasses(task.completed, hasIndicators, selected),
    // Fixes bug where task tiles would be invisible if list was expanded and animations were suddenly disabled
    style: { y, opacity },
    onClick: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      // Detail is 0 when the click is triggered by a keyboard event (spacebar)
      if (e.detail === 0) return;

      if (ignorePointerEvents.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      handleTaskTileClick(e, task, selectedTasks, dispatch);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTaskTileClick(e as unknown as React.MouseEvent<HTMLLIElement, MouseEvent>, task, selectedTasks, dispatch);
      }
    },
    onFocus: () => {
      const ref = reorderable ? reorderableComponentRef : defaultWrapperRef;
      const completeButton = ref.current?.querySelector('button');
      if (!completeButton) return;

      completeButton.tabIndex = 0;
    },
    onBlur: () => {
      const ref = reorderable ? reorderableComponentRef : defaultWrapperRef;
      const completeButton = ref.current?.querySelector('button');
      if (!completeButton) return;

      completeButton.tabIndex = -1;
    },
    onContextMenu: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) =>
      dispatch(showContextMenu({ contextMenu: ContextMenuType.TaskContextMenu, task, x: e.clientX, y: e.clientY })),
  };

  const defaultWrapperRef = useRef<HTMLLIElement>(null);
  const reorderableComponentRef = useRef<HTMLElement>(null);
  const ignorePointerEvents = useRef<boolean>(false);

  // Fixes this bug: https://github.com/framer/motion/issues/1404
  // https://github.com/rashidshamloo/fem_034_todo-app/blob/main/src/components/Todo.tsx
  // This disabled pointer events until the task tile reaches its destination
  useEffect(() => {
    const handleDragStyle = (yPos: number) => {
      if (yPos === 0) {
        ignorePointerEvents.current = false;
        return;
      }

      ignorePointerEvents.current = true;
      setTimeout(() => {
        if (y.get() === yPos) y.set(0);
      }, 50);
    };
    const unsubscribe = y.on('change', handleDragStyle);
    return () => unsubscribe();
  }, [y]);

  return (
    <>
      {reorderable ? (
        <Reorder.Item
          {...taskTileProps}
          key={task.creationTime}
          value={task}
          onPointerUp={onReorderComplete}
          ref={reorderableComponentRef}
          transition={animationsEnabled ? {} : { duration: 0, ease: 'linear' }}
          layout={animationsEnabled ? 'position' : undefined}
        >
          <TaskTileContents task={task} />
        </Reorder.Item>
      ) : (
        <motion.li
          ref={defaultWrapperRef}
          {...taskTileProps}
          key={task.creationTime}
          layout={animationsEnabled ? 'position' : false}
        >
          <TaskTileContents task={task} />
        </motion.li>
      )}
    </>
  );
};

const taskTileClasses = (completed: boolean, hasIndicators: boolean, selected: boolean) => {
  return `task-tile frosted ${hasIndicators ? '' : 'task-tile-no-attributes'} ${selected ? 'selected' : ''} ${
    completed ? 'completed' : ''
  }`;
};

function handleTaskTileClick(
  e: React.MouseEvent<HTMLLIElement>,
  task: Task,
  selectedTasks: Task[],
  dispatch: AppDispatch,
) {
  const onlySelectedTaskIsCurrentTask =
    selectedTasks.length === 1 && selectedTasks[0].creationTime === task.creationTime;

  if (onlySelectedTaskIsCurrentTask) {
    dispatch(removeSelectedTask(task));
    return;
  }

  if (e.metaKey || e.ctrlKey) {
    dispatch(addSelectedTask(task));
    return;
  }

  if (e.shiftKey) {
    dispatch(selectTasksBetween(task));
    return;
  }

  dispatch(setSelectedTask(task));
}
