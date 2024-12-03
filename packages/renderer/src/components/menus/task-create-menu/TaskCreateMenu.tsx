import { Menu, Task } from '@remindr/shared';
import { menuHeightAnimationProps } from '@renderer/animation';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { addTask } from '@renderer/features/task-list/taskListSlice';
import { setEditedTask, setOriginalTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useEscToClose } from '@renderer/scripts/utils/hooks/useesctoclose';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { FC, HTMLProps, useEffect, useRef, useState } from 'react';
import { TaskModificationInterface } from '../task-modification-menu/TaskModificationInterface';

interface TaskCreateMenuProps extends HTMLProps<HTMLDivElement> {}

export const TaskCreateMenu: FC<TaskCreateMenuProps> = () => {
  const dispatch = useAppDispatch();

  const animationsEnabled = useAnimationsEnabled();
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationCompleteRef = useRef<boolean>();
  const [closing, setClosing] = useState(false);

  // Allows TaskModificationInterface -> onSave callback function to access the updated value of animationComplete
  animationCompleteRef.current = animationComplete;

  const height = useMotionValue(animationsEnabled ? 0 : 520);
  useMotionValueEvent(height, 'animationCancel', () => {
    setAnimationComplete(false);
  });
  useMotionValueEvent(height, 'animationStart', () => {
    if (parseInt((height.get() as unknown as string).slice(0, -2), 10) > 500) {
      setClosing(true);
    }

    setAnimationComplete(false);
  });
  useMotionValueEvent(height, 'animationComplete', () => {
    if ((height.get() as unknown as string) === '0px') {
      setClosing(false);
      return;
    }

    setAnimationComplete(true);
  });

  const animationProps = animationsEnabled
    ? {
        layout: true,
        ...menuHeightAnimationProps(animationsEnabled),
        animate: { height: '520px' },
      }
    : { style: { height: '520px' } };

  useEscToClose(dispatch, Menu.TaskCreateMenu); /* checkForUnsavedWork: true */

  const ref = useClickOutside(async () => {
    dispatch(hideMenu({ menu: Menu.TaskCreateMenu })); /* checkForUnsavedWork: true */
  }, ['#taskCreateButton', '#scheduledReminderEditMenu', '#linkMenu']);

  useEffect(() => {
    const serializableTask = JSON.parse(JSON.stringify(new Task('')));
    dispatch(setOriginalTask({ task: serializableTask, creating: true }));
    dispatch(setEditedTask({ task: serializableTask, creating: true }));
  }, []);

  return (
    <motion.div
      id="taskCreationWindow"
      {...animationProps}
      className={`active ${animationComplete ? '' : 'hide-overflow'} ${closing ? 'closing' : ''}`}
      style={{ height }}
      ref={ref as any}
    >
      <TaskModificationInterface
        animationComplete={animationComplete}
        creating
        onSave={(task: Task) => {
          // If the menu is opening/closing, don't save - this mitigates repeated task saves/creations
          if (animationsEnabled && !animationCompleteRef.current) return;

          dispatch(addTask(task));
          dispatch(hideMenu({ menu: Menu.TaskCreateMenu /*checkForUnsavedWork: false*/ }));
        }}
      />
    </motion.div>
  );
};
