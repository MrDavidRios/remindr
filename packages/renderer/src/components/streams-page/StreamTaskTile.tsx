import { StreamTask } from '@remindr/shared';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { Reorder, useMotionValue } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { TaskCompleteButton } from '../task-management-page/task-list-display/task-tile/TaskCompleteButton';

interface StreamTaskTileProps {
  streamTask: StreamTask;
  onToggleCompleteTask: (task: StreamTask) => void;
  onReorderComplete?: () => void;
  hideConnector?: boolean;
}

export const StreamTaskTile: React.FC<StreamTaskTileProps> = ({
  streamTask,
  onToggleCompleteTask,
  onReorderComplete,
  hideConnector,
}) => {
  const animationsEnabled = useAnimationsEnabled();

  const reorderableComponentRef = useRef<HTMLElement>(null);
  const ignorePointerEvents = useRef<boolean>(false);
  const y = useMotionValue(0);

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
    <Reorder.Item
      className={`stream-task-tile ${streamTask.completed ? 'completed' : ''}`}
      key={streamTask.creationTime}
      value={streamTask}
      style={{ y }}
      onPointerUp={onReorderComplete}
      onClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        // Detail is 0 when the click is triggered by a keyboard event (spacebar)
        if (e.detail === 0) return;

        if (ignorePointerEvents.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }}
      ref={reorderableComponentRef}
      transition={animationsEnabled ? {} : { duration: 0, ease: 'linear' }}
      layout={animationsEnabled ? 'position' : undefined}
    >
      <TaskCompleteButton task={streamTask} toggleComplete={() => onToggleCompleteTask(streamTask)} />
      <p>{streamTask.name}</p>
      {!hideConnector && <div className="stream-task-connector" />}
    </Reorder.Item>
  );
};
