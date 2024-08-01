import { Menu, Task } from '@remindr/shared';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { FC, HTMLProps, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { TaskModificationInterface } from '../task-modification-menu/TaskModificationInterface';
import { menuHeightAnimationProps } from '/@/animation';
import { hideMenu } from '/@/features/menu-state/menuSlice';
import { addTask } from '/@/features/task-list/taskListSlice';
import { setEditedTask, setOriginalTask } from '/@/features/task-modification/taskModificationSlice';
import { useAppDispatch, useAppStore } from '/@/hooks';
import { useAnimationsEnabled } from '/@/scripts/utils/hooks/useanimationsenabled';
import { useClickOutside } from '/@/scripts/utils/hooks/useoutsideclick';
import { isFullscreenMenuOpen } from '/@/scripts/utils/menuutils';

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

  useHotkeys(
    'esc',
    () => {
      const menuState = store.getState().menuState;
      const scheduledReminderEditMenuOpen = menuState.openMenus.includes(Menu.ScheduledReminderEditMenu);
      if (isFullscreenMenuOpen(menuState) || scheduledReminderEditMenuOpen) return;

      dispatch(hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: true, fromEscKeypress: true }));
    },
    {
      enableOnFormTags: true,
    },
  );

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
        showActionButtons={false}
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
