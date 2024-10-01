import plusIcon from '@assets/icons/plus.svg';
import { Task } from '@remindr/shared';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import React from 'react';
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

const InternalTaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  return (
    <>
      {tasks.map((task) => (
        <div key={task.creationTime}>
          <TaskTileWrapper task={task} reorderable={false} />
        </div>
      ))}
    </>
  );
};

export const TaskColumn: React.FC<TaskColumnProps> = ({ name, tasks }) => {
  const animationsEnabled = useAnimationsEnabled();

  const completeTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  return (
    <div className="task-column">
      <AnimateChangeInHeight show>
        <h2>{name}</h2>
        <div className="tasks">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {incompleteTasks.length === 0 ? (
                <p className="no-tasks-message">All done here!</p>
              ) : (
                <InternalTaskList tasks={incompleteTasks} />
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
          </LayoutGroup>
        </div>
        <TaskColumnActionBar />
      </AnimateChangeInHeight>
    </div>
  );
};
