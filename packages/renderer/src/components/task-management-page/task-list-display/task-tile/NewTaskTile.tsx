import { DynamicTextArea } from '@renderer/components/dynamic-text-area/DynamicTextArea';
import React from 'react';

interface NewTaskTileProps {
  onEscape: () => void;
  createTask: (name: string) => void;
}

export const NewTaskTile: React.FC<NewTaskTileProps> = ({ createTask, onEscape }) => {
  const [taskName, setTaskName] = React.useState('');

  return (
    <div
      className="new-task-tile frosted"
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
        aria-label="task title input"
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
    </div>
  );
};
