import { Stream, StreamState, StreamTask } from '@remindr/shared';
import { AnimatePresence, Reorder } from 'framer-motion';
import { FC } from 'react';
import { StreamTaskTile } from '../StreamTaskTile';

interface StreamTaskListProps {
  showNewTaskTile: boolean;
  tasks: StreamTask[];
  currentStream: Stream;
  onChange: (tasks: StreamTask[]) => void;
  onReorder: (reorderedTasks: StreamTask[]) => void;
  onReorderComplete: () => void;
}

export const StreamTaskList: FC<StreamTaskListProps> = ({
  showNewTaskTile,
  tasks,
  currentStream,
  onChange,
  onReorder,
  onReorderComplete,
}) => {
  if (tasks.length === 0 && !showNewTaskTile) return <p className="text-secondary">The world's your oyster.</p>;
  const activeOrComplete = currentStream.state === StreamState.Active || currentStream.state === StreamState.Completed;

  const onChangeTask = (task: StreamTask) => {
    const taskIdx = tasks.findIndex((t) => t.creationTime === task.creationTime);
    const updatedTasks = [...tasks];
    updatedTasks[taskIdx] = task;

    onChange(updatedTasks);
  };

  return (
    <Reorder.Group id="streamTaskList" values={tasks} layoutScroll axis="y" onReorder={onReorder}>
      <AnimatePresence mode="popLayout">
        {tasks.map((task, idx) => (
          <div key={task.creationTime}>
            <StreamTaskTile
              streamTask={task}
              onChange={onChangeTask}
              onReorderComplete={onReorderComplete}
              showConnector={!activeOrComplete || idx !== tasks.length - 1}
            />
          </div>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};
