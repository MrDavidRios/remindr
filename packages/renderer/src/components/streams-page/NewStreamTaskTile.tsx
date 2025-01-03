import { DynamicTextArea } from '@renderer/components/dynamic-text-area/DynamicTextArea';
import React from 'react';

interface NewStreamTaskTileProps {
  onEscape: () => void;
  createTask: (name: string) => void;
}

export const NewStreamTaskTile: React.FC<NewStreamTaskTileProps> = ({ createTask, onEscape }) => {
  const [name, setName] = React.useState('');

  return (
    <div
      className="new-stream-task-tile frosted"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();

          onEscape();
          createTask(name);
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
        value={name}
        autoFocus
        allowNewLine={false}
        onChange={(e) => {
          // If there's no change, don't re-render
          if (name === e.currentTarget.value) return;

          setName(e.currentTarget.value);
        }}
      />
    </div>
  );
};
