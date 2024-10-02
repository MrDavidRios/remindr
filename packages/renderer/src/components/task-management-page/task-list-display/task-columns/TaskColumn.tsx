import plusIcon from '@assets/icons/plus.svg';
import { columnTasksInDifferentOrder, Task } from '@remindr/shared';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { updateTasks } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { tasksInSameOrder } from '@renderer/scripts/utils/tasklistutils';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { AnimateChangeInHeight } from '../../AnimateChangeInHeight';
import { TaskTileWrapper } from '../task-tile/TaskTileWrapper';

interface TaskColumnProps {
  name: string;
  tasks: Task[];
}

const TaskColumnActionBar: React.FC = () => {
  const animationsEnabled = useAnimationsEnabled();

  return (
    <motion.div className="task-column-action-bar" layout={animationsEnabled ? 'position' : false}>
      <button>
        <img src={plusIcon} draggable={false} alt="" />
        Add task
      </button>
    </motion.div>
  );
};

const getOrderedIncompleteTasks = (tasks: Task[]) => {
  const filtered = tasks.filter((task) => !task.completed);
  const sorted = filtered.sort((a, b) => a.orderInTaskColumn - b.orderInTaskColumn);
  return sorted;
};

export const TaskColumn: React.FC<TaskColumnProps> = ({ name, tasks }) => {
  const dispatch = useAppDispatch();
  const animationsEnabled = useAnimationsEnabled();

  const completeTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = getOrderedIncompleteTasks(tasks);

  const [orderedIncompleteTasks, setOrderedIncompleteTasks] = useState(incompleteTasks);

  useEffect(() => {
    if (!_.isEqual(tasks, orderedIncompleteTasks) || !tasksInSameOrder(tasks, orderedIncompleteTasks)) {
      const filteredTasks = getOrderedIncompleteTasks(tasks);
      setOrderedIncompleteTasks(filteredTasks);
      return;
    }
  }, [tasks]);

  const onReorder = (reorderedTasks: Task[]) => setOrderedIncompleteTasks(reorderedTasks);

  const animationProps = animationsEnabled
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {};

  const onReorderComplete = () => {
    const clonedIncompleteTasks: Task[] = [];
    for (let i = 0; i < orderedIncompleteTasks.length; i++) {
      const task = JSON.parse(JSON.stringify(orderedIncompleteTasks[i]));
      task.orderInTaskColumn = i;

      clonedIncompleteTasks.push(task);
    }

    // If sorting the column tasks puts them in the same order, don't re-save the list.
    if (!columnTasksInDifferentOrder(orderedIncompleteTasks, clonedIncompleteTasks)) return;

    dispatch(updateTasks(clonedIncompleteTasks));
  };

  return (
    <div className="task-column">
      <ArrowNavigable waitForChildAnimation query=".task-tile:not(.animating)" id={name}>
        <AnimateChangeInHeight show>
          <h2>{name}</h2>
          <div className="tasks">
            {orderedIncompleteTasks.length === 0 && <p className="no-tasks-message">All done here!</p>}
            <Reorder.Group
              className="task-group"
              values={orderedIncompleteTasks}
              axis="y"
              onReorder={onReorder}
              {...animationProps}
            >
              <AnimatePresence mode="popLayout">
                {orderedIncompleteTasks.map((task) => (
                  <div key={task.creationTime}>
                    <TaskTileWrapper task={task} reorderable onReorderComplete={onReorderComplete} />
                  </div>
                ))}
              </AnimatePresence>
            </Reorder.Group>
            {completeTasks.length > 0 && (
              <>
                <motion.p className="complete-tasks-header" layout={animationsEnabled ? 'position' : false}>
                  Completed
                </motion.p>
                <AnimatePresence mode="popLayout">
                  {completeTasks.map((task) => (
                    <div key={task.creationTime}>
                      <TaskTileWrapper task={task} />
                    </div>
                  ))}
                </AnimatePresence>
              </>
            )}
          </div>
          <TaskColumnActionBar />
        </AnimateChangeInHeight>
      </ArrowNavigable>
    </div>
  );
};
