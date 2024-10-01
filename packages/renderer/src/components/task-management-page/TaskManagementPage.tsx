import { Menu } from '@remindr/shared';
import { hideMenu, showMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual } from 'react-redux';
import { TaskCreateMenu } from '../menus/task-create-menu/TaskCreateMenu';
import { TaskEditMenu } from '../menus/task-edit-menu/TaskEditMenu';
import { Toolbar } from '../toolbar/Toolbar';
import { UndoNotification } from '../undo-notification/UndoNotification';
import { TaskListDisplay } from './task-list-display/TaskListContainer';

export function TaskManagementPage() {
  const dispatch = useAppDispatch();

  const selectedTasks = useAppSelector((state) => state.taskList.selectedTasks, shallowEqual);
  const timeframe = useAppSelector((state) => state.taskList.timeframe);

  const showTaskEditMenu = useAppSelector((state) => state.menuState.openMenus.includes(Menu.TaskEditMenu));
  const showTaskCreateMenu = useAppSelector((state) => state.menuState.openMenus.includes(Menu.TaskCreateMenu));

  useEffect(() => {
    if (selectedTasks.length === 1 && !showTaskEditMenu) {
      // Close task create menu if it's open
      dispatch(hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: false }));
    }

    if (selectedTasks.length === 1) {
      dispatch(showMenu(Menu.TaskEditMenu));
      return;
    }

    dispatch(hideMenu({ menu: Menu.TaskEditMenu }));
  }, [selectedTasks]);

  // Test notifications with Cmd/Ctrl + T in development
  useHotkeys('mod+t', () => {
    if (window.electron.remote.isPackaged()) return;

    for (let i = 0; i < selectedTasks.length; i++) {
      window.notifications.notify(JSON.stringify(selectedTasks[i]), 0);
    }
  });

  return (
    <div id="appMainPageContainer">
      <Toolbar />

      <div id="mainContainer">
        <TaskListDisplay timeframe={timeframe} taskMenuShown={showTaskEditMenu} />
        <AnimatePresence>{showTaskEditMenu ? <TaskEditMenu selectedTask={selectedTasks[0]} /> : null}</AnimatePresence>
        <AnimatePresence>{showTaskCreateMenu && <TaskCreateMenu id="taskCreationWindow" />}</AnimatePresence>
      </div>

      <UndoNotification />
    </div>
  );
}
