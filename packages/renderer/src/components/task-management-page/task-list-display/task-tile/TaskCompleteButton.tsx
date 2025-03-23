import checkImg from '@assets/icons/check.png';
import circle from '@assets/icons/circle.svg';
import { StreamTask, Task } from '@remindr/shared';
import { FC } from 'react';

interface TaskCompleteButtonProps {
  task: Task | StreamTask;
  toggleComplete: () => void;
}

export const TaskCompleteButton: FC<TaskCompleteButtonProps> = ({ task, toggleComplete }) => {
  const toggleCompleteButtonTitle = task.completed ? 'Mark incomplete' : 'Mark complete';

  return (
    <button
      className={`task-complete-button-container ${task.completed ? 'complete' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();

          toggleComplete();
        }
      }}
      onClick={(e) => {
        // Stops the parent from taking credit for the click
        e.stopPropagation();

        toggleComplete();
      }}
      tabIndex={-1}
      type="button"
      aria-label={toggleCompleteButtonTitle}
      title={toggleCompleteButtonTitle}
    >
      <img className="task-complete-button svg-filter" src={circle} draggable="false" alt="" />
      <img className="task-complete-button-checkmark" src={checkImg} draggable="false" alt="" />
    </button>
  );
};
