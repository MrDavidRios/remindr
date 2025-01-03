import { Task } from '@remindr/shared';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { useAppSelector } from '@renderer/hooks';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { FC } from 'react';
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
  const reoderableTodoTasksEnabled = useAppSelector((state) => state.settings.value.reorderableTodo ?? false);

  return (
    <ArrowNavigable waitForChildAnimation query=".task-tile:not(.animating)" id={name}>
      <AnimatePresence>
        {expanded && (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {reorderable && reoderableTodoTasksEnabled ? (
              <Reorder.Group className="task-group" values={tasks} layoutScroll axis="y" onReorder={onReorder}>
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <div key={task.creationTime}>
                      <TaskTileWrapper task={task} reorderable onReorderComplete={onReorderComplete} />
                    </div>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            ) : (
              <motion.div className="task-group">
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <div key={task.creationTime}>
                      <TaskTileWrapper task={task} />
                    </div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </ArrowNavigable>
  );
};
