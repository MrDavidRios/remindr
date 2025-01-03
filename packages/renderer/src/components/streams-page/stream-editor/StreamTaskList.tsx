import { Stream, StreamState, StreamTask } from '@remindr/shared';
import { AnimatePresence, Reorder } from 'framer-motion';
import { FC } from 'react';
import { StreamTaskTile } from '../StreamTaskTile';

interface StreamTaskListProps {
  showNewTaskTile: boolean;
  orderedTasks: StreamTask[];
  currentStream: Stream;
  onReorder: (reorderedTasks: StreamTask[]) => void;
  onReorderComplete: () => void;
  onToggleCompleteTask: (task: StreamTask) => void;
}

export const StreamTaskList: FC<StreamTaskListProps> = ({
  showNewTaskTile,
  orderedTasks,
  currentStream,
  onReorder,
  onReorderComplete,
  onToggleCompleteTask,
}) => {
  if (orderedTasks.length === 0 && !showNewTaskTile) return <p className="text-secondary">The world's your oyster.</p>;

  return (
    <Reorder.Group id="streamTaskList" values={orderedTasks} axis="y" onReorder={onReorder}>
      <AnimatePresence mode="popLayout">
        {orderedTasks.map((task, idx) => (
          <div key={task.creationTime}>
            <StreamTaskTile
              streamTask={task}
              onToggleCompleteTask={onToggleCompleteTask}
              onReorderComplete={onReorderComplete}
              hideConnector={currentStream.state === StreamState.Active && idx === orderedTasks.length - 1}
            />
          </div>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};
