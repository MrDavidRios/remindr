import plusThinIcon from '@assets/icons/plus-thin.svg';
import type { MenuState } from '@remindr/shared';
import { Menu } from '@remindr/shared';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { AppDispatch } from '/@/app/store';
import { hideMenu, showMenu } from '/@/features/menu-state/menuSlice';
import { clearSelectedTasks } from '/@/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '/@/hooks';
import { useAnimationsEnabled } from '/@/scripts/utils/hooks/useanimationsenabled';
import { isFullscreenMenuOpen, isMenuOpen } from '/@/scripts/utils/menuutils';

export const TaskCreateButton: FC = () => {
  const dispatch = useAppDispatch();

  const menuState = useAppSelector(state => state.menuState);
  const animate = useAnimationsEnabled();

  const taskModificationMenuOpen =
    isMenuOpen(menuState, Menu.TaskEditMenu) || isMenuOpen(menuState, Menu.TaskCreateMenu);

  const titleText = taskModificationMenuOpen ? 'Cancel Edits (Esc)' : 'Add Task (Ctrl + N)';

  useHotkeys(
    'mod+n',
    () => {
      if (isFullscreenMenuOpen(menuState)) return;

      if (isMenuOpen(menuState, Menu.TaskEditMenu)) {
        dispatch(clearSelectedTasks());
      }

      dispatch(showMenu(Menu.TaskCreateMenu));
    },
    { enableOnFormTags: true },
  );

  return (
    <button
      type="button"
      id="taskCreateButton"
      className="toolbar-button"
      title={titleText}
      onClick={() => handleButtonClick(menuState, taskModificationMenuOpen, dispatch)}
    >
      <div className="toolbar-button-img-container">
        <motion.img
          src={plusThinIcon}
          draggable="false"
          {...getImgAnimationProps(taskModificationMenuOpen, animate)}
        />
      </div>
    </button>
  );
};

function getImgAnimationProps(taskModificationMenuOpen: boolean, animate: boolean) {
  const transform = taskModificationMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)';

  return {
    animate: {
      transform,
    },
    transition: {
      duration: animate ? 0.2 : 0,
    },
  };
}

function handleButtonClick(
  menuState: MenuState,
  taskModificationMenuOpen: boolean,
  dispatch: AppDispatch,
) {
  if (taskModificationMenuOpen) {
    closeTaskModificationMenu(menuState, dispatch);
    return;
  }

  dispatch(showMenu(Menu.TaskCreateMenu));
}

function closeTaskModificationMenu(menuState: MenuState, dispatch: AppDispatch) {
  if (isMenuOpen(menuState, Menu.TaskEditMenu)) {
    dispatch(clearSelectedTasks());
    return;
  }

  if (isMenuOpen(menuState, Menu.TaskCreateMenu)) {
    dispatch(hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: true }));
  }
}
