import { Task } from '@remindr/shared';
import { menuWidthAnimationProps } from '@renderer/animation';
import { clearSelectedTasks, updateTask } from '@renderer/features/task-list/taskListSlice';
import { setEditedTask, setOriginalTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { FC, HTMLProps, useEffect, useState } from 'react';
import { TaskModificationInterface } from '../task-modification-menu/TaskModificationInterface';

interface TaskEditMenuProps extends HTMLProps<HTMLDivElement> {
  selectedTask: Task;
}

export const TaskEditMenu: FC<TaskEditMenuProps> = ({ selectedTask }) => {
  const dispatch = useAppDispatch();

  const animationsEnabled = useAnimationsEnabled();
  const [animationComplete, setAnimationComplete] = useState(!animationsEnabled);

  const width = useMotionValue(animationsEnabled ? 0 : 329);
  useMotionValueEvent(width, 'animationStart', () => setAnimationComplete(false));
  useMotionValueEvent(width, 'animationComplete', () => {
    // Bug with framer motion type - width.get() outputs '0px' although being typed as a number
    //
    // Return if height is 0, as animation complete state is mainly used to manage input autofocus.
    // Setting this to true while opening the task creation menu at the same time may cause the task creation
    // menu title to get defocused.
    if ((width.get() as unknown as string) === '0px') return;

    setAnimationComplete(true);
  });
  useMotionValueEvent(width, 'animationCancel', () => setAnimationComplete(false));

  const animationProps = animationsEnabled
    ? {
        layout: true,
        ...menuWidthAnimationProps(animationsEnabled),
        animate: { width: '329px' },
      }
    : {};

  function onSave(task: Task) {
    dispatch(updateTask(task));
    dispatch(clearSelectedTasks());
  }

  useEffect(() => {
    if (!selectedTask) return;
    dispatch(setOriginalTask({ task: selectedTask, creating: false }));
    dispatch(setEditedTask({ task: selectedTask, creating: false }));
  }, [selectedTask]);

  return (
    <motion.div id="taskEditWindow" {...animationProps} style={{ width }} className="active">
      <TaskModificationInterface creating={false} animationComplete={animationComplete} onSave={onSave} />
    </motion.div>
  );
};
