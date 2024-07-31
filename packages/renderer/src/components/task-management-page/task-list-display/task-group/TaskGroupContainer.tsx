import pinIcon from '@assets/icons/pin.svg';
import type { Task } from '@remindr/shared';
import { motion } from 'framer-motion';
import _ from 'lodash';
import { memo, useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { TaskGroup } from './TaskGroup';
import { getTasksInGroup } from './taskgroups';
import { GeneralContextMenu } from '/@/components/context-menu/GeneralContextMenu';
import { updateTaskGroupOrder } from '/@/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '/@/hooks';
import { getTaskListWithinTimeframe } from '/@/scripts/utils/getReminderListWithinTimeframe';
import { useAnimationsEnabled } from '/@/scripts/utils/hooks/useanimationsenabled';
import { getIpcRendererOutput } from '/@/scripts/utils/ipcRendererOutput';
import { tasksInSameOrder } from '/@/scripts/utils/tasklistutils';

interface TaskGroupContainerProps {
  name: string;
}

export const TaskGroupContainer = memo(function TaskGroupContainer({
  name,
}: TaskGroupContainerProps) {
  const dispatch = useAppDispatch();

  const animationsEnabled = useAnimationsEnabled();

  const tasks = useAppSelector(state => {
    const timeframe = state.taskList.timeframe;
    const taskListWithinTimeframe = getTaskListWithinTimeframe(state.taskList.value, timeframe);

    return getTasksInGroup(taskListWithinTimeframe, name);
  }, shallowEqual);

  const [expanded, setExpanded] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState({ show: false, x: 0, y: 0 });

  const pinned = name === 'Pinned';
  const reorderable = name === 'To-do';

  const [orderedTasks, setOrderedTasks] = useState(tasks);
  const groupTasks = reorderable ? orderedTasks : tasks;

  useEffect(() => {
    const expandGroup = (e: unknown) => setExpanded(getIpcRendererOutput(e));
    const expandListener = window.electron.ipcRenderer.on('expand-all-groups', expandGroup);

    return () => {
      expandListener();
    };
  }, []);

  const animationProps = animationsEnabled
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {};

  // Reorderable group logic
  const onReorder = (newOrder: Task[]) => setOrderedTasks(newOrder);
  const onReorderComplete = () => {
    if (tasksInSameOrder(tasks, orderedTasks)) return;

    dispatch(updateTaskGroupOrder(orderedTasks));
  };

  useEffect(() => {
    if (!reorderable) return;

    if (!_.isEqual(tasks, orderedTasks)) {
      setOrderedTasks(tasks);
      return;
    }

    if (tasksInSameOrder(tasks, orderedTasks)) return;

    setOrderedTasks(tasks);
  }, [tasks]);

  return (
    <>
      <motion.div
        className={`task-group-container ${expanded ? 'expanded' : ''}`}
        {...animationProps}
        layout={animationsEnabled ? 'position' : false}
      >
        <button
          className={`task-group-header frosted ${pinned ? 'icon' : ''} ${
            animationsEnabled ? 'animate' : ''
          }`}
          onClick={() => setExpanded(!expanded)}
          onContextMenu={e => setShowContextMenu({ show: true, x: e.clientX, y: e.clientY })}
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
        <TaskGroup
          tasks={groupTasks}
          reorderable={reorderable}
          onReorder={onReorder}
          onReorderComplete={onReorderComplete}
          expanded={expanded}
          name={name}
        />
      </motion.div>
      {showContextMenu.show && (
        <GeneralContextMenu
          x={showContextMenu.x}
          y={showContextMenu.y}
          hideGeneralContextMenu={() => setShowContextMenu({ show: false, x: 0, y: 0 })}
        />
      )}
    </>
  );
});
