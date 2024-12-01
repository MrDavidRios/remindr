import { Menu, Task } from '@remindr/shared';
import { menuHeightAnimationProps } from '@renderer/animation';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { addTask } from '@renderer/features/task-list/taskListSlice';
import { setEditedTask, setOriginalTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch, useAppStore } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import { isFullscreenMenuOpen } from '@renderer/scripts/utils/menuutils';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { FC, HTMLProps, useEffect, useState } from 'react';
import { TaskModificationInterface } from '../task-modification-menu/TaskModificationInterface';

interface TaskCreateMenuProps extends HTMLProps<HTMLDivElement> {}

export const TaskCreateMenu: FC<TaskCreateMenuProps> = () => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const animationsEnabled = useAnimationsEnabled();
  const [animationComplete, setAnimationComplete] = useState(!animationsEnabled);
  const [closing, setClosing] = useState(false);

  const height = useMotionValue(animationsEnabled ? 0 : 520);
  useMotionValueEvent(height, 'animationCancel', () => setAnimationComplete(false));
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

  useHotkey(['esc'], () => {
    const menuState = store.getState().menuState;
    const scheduledReminderEditMenuOpen = menuState.openMenus.includes(Menu.ScheduledReminderEditMenu);
    if (isFullscreenMenuOpen(menuState) || scheduledReminderEditMenuOpen) return;

    dispatch(hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: true, fromEscKeypress: true }));
  });

  const ref = useClickOutside(async () => {
    const menuState = store.getState().menuState;
    const scheduledReminderEditMenuOpen = menuState.openMenus.includes(Menu.ScheduledReminderEditMenu);
    if (isFullscreenMenuOpen(menuState) || scheduledReminderEditMenuOpen) return;

    dispatch(hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: true }));
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
          if (animationsEnabled && !animationComplete) return;

          dispatch(addTask(task));
          dispatch(hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: false }));
        }}
      />
    </motion.div>
  );
};
