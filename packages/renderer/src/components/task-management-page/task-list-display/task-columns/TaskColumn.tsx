import plusIcon from '@assets/icons/plus.svg';
import { Task } from '@remindr/shared';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { tasksInSameOrder } from '@renderer/scripts/utils/tasklistutils';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import React, { useState } from 'react';
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

const InternalTaskList: React.FC<{ tasks: Task[]; onReorderComplete?: () => void }> = ({
  tasks,
  onReorderComplete,
}) => {
  return (
    <>
      {tasks.map((task) => (
        <div key={task.creationTime}>
          <TaskTileWrapper
            task={task}
            reorderable={onReorderComplete !== undefined}
            onReorderComplete={onReorderComplete}
          />
        </div>
      ))}
    </>
  );
};

export const TaskColumn: React.FC<TaskColumnProps> = ({ name, tasks }) => {
  const dispatch = useAppDispatch();
  const animationsEnabled = useAnimationsEnabled();

  const completeTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  const [orderedIncompleteTasks, setOrderedIncompleteTasks] = useState(incompleteTasks);

  const onReorder = (newOrder: Task[]) => setOrderedIncompleteTasks(newOrder);

  // useEffect(() => {
  //   if ()
  // }, [tasks]);

  const animationProps = animationsEnabled
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {};

  const onReorderComplete = () => {
    if (tasksInSameOrder(incompleteTasks, orderedIncompleteTasks)) return;

    // dispatch(updateTaskGroupOrder(orderedIncompleteTasks));
  };

  return (
    <div className="task-column">
      <AnimateChangeInHeight show>
        <h2>{name}</h2>
        <div className="tasks">
          <Reorder.Group className="task-group" values={tasks} axis="y" onReorder={onReorder} {...animationProps}>
            <AnimatePresence mode="popLayout">
              {orderedIncompleteTasks.length === 0 ? (
                <p className="no-tasks-message">All done here!</p>
              ) : (
                <InternalTaskList tasks={orderedIncompleteTasks} onReorderComplete={onReorderComplete} />
              )}
              {completeTasks.length > 0 && (
                <>
                  <motion.p className="complete-tasks-header" layout={animationsEnabled ? 'position' : false}>
                    Completed
                  </motion.p>
                  <InternalTaskList tasks={completeTasks} />
                </>
              )}
            </AnimatePresence>
          </Reorder.Group>
        </div>
        <TaskColumnActionBar />
      </AnimateChangeInHeight>
    </div>
  );
};
