import { AnimatePresence, Reorder, motion } from 'framer-motion';
import Task from 'main/types/classes/task/task';
import { FC } from 'react';
import { ArrowNavigable } from 'renderer/components/accessibility/ArrowNavigable';
import { useAppSelector } from 'renderer/hooks';
import { useAnimationsEnabled } from 'renderer/scripts/utils/hooks/useanimationsenabled';
import { AnimateChangeInHeight } from '../../AnimateChangeInHeight';
import { TaskTileWrapper } from '../task-tile/TaskTileWrapper';

interface TaskGroupProps {
  tasks: Task[];
  reorderable: boolean;
  expanded: boolean;
  onReorder: (newOrder: Task[]) => void;
  onReorderComplete: () => void;
  name: string;
}

export const TaskGroup: FC<TaskGroupProps> = ({ tasks, reorderable, onReorder, onReorderComplete, expanded, name }) => {
  const animationsEnabled = useAnimationsEnabled();
  const reoderableTodoTasksEnabled = useAppSelector((state) => state.settings.value.reorderableTodo ?? false);

  const animationProps = animationsEnabled
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {};

  return (
    <ArrowNavigable waitForChildAnimation query=".task-tile:not(.animating)" id={name}>
      <AnimateChangeInHeight show={expanded}>
        <AnimatePresence>
          {expanded && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {reorderable && reoderableTodoTasksEnabled ? (
                <Reorder.Group className="task-group" values={tasks} axis="y" onReorder={onReorder} {...animationProps}>
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                      <div key={task.creationTime}>
                        <TaskTileWrapper task={task} reorderable onReorderComplete={onReorderComplete} />
                      </div>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              ) : (
                <motion.div className="task-group" {...animationProps}>
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                      <div key={task.creationTime}>
                        <TaskTileWrapper task={task} reorderable={false} />
                      </div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </AnimateChangeInHeight>
    </ArrowNavigable>
  );
};