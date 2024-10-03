import { DynamicTextArea } from '@renderer/components/dynamic-text-area/DynamicTextArea';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { motion } from 'framer-motion';
import React from 'react';

interface NewTaskTileProps {
  onEscape: () => void;
  createTask: (name: string) => void;
}

export const NewTaskTile: React.FC<NewTaskTileProps> = ({ createTask, onEscape }) => {
  const animationsEnabled = useAnimationsEnabled();

  const [taskName, setTaskName] = React.useState('');

  return (
    <motion.div
      className="new-task-tile frosted"
      layout={animationsEnabled ? 'position' : false}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();

          onEscape();
          createTask(taskName);
        }

        if (e.key === 'Escape') {
          e.preventDefault();

          onEscape();
        }
      }}
      onBlur={onEscape}
    >
      <DynamicTextArea
        aria-label="task-title"
        placeholder="Enter a title"
        maxLength={255}
        value={taskName}
        autoFocus
        allowNewLine={false}
        onChange={(e) => {
          // If there's no change, don't re-render
          if (taskName === e.currentTarget.value) return;

          setTaskName(e.currentTarget.value);
        }}
      />
    </motion.div>
  );
};
