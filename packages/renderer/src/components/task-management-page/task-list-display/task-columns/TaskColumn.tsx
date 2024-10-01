import plusIcon from '@assets/icons/plus.svg';
import { Task } from '@remindr/shared';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
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

export const TaskColumn: React.FC<TaskColumnProps> = ({ name, tasks }) => {
  return (
    <div className="task-column">
      <AnimateChangeInHeight show>
        <h2>{name}</h2>
        <div className="tasks">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <div key={task.creationTime}>
                  <TaskTileWrapper task={task} reorderable={false} />
                </div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>
        <TaskColumnActionBar />
      </AnimateChangeInHeight>
    </div>
  );
};
