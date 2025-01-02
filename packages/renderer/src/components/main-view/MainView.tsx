import { Menu, Page } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { AnimatePresence } from 'framer-motion';
import { FC } from 'react';
import { TaskCreateMenu } from '../menus/task-create-menu/TaskCreateMenu';
import { StreamEditorPage } from '../stream-editor-page/StreamEditorPage';
import { TaskManagementPage } from '../task-management-page/TaskManagementPage';
import { Toolbar } from '../toolbar/Toolbar';
import { UndoNotification } from '../undo-notification/UndoNotification';

export const MainView: FC = () => {
  const currentTaskPage = useAppSelector((state) => state.pageState.currentPage);
  const onTaskViewPage = currentTaskPage === Page.ColumnView || currentTaskPage === Page.ListView;
  const showTaskCreateMenu = useAppSelector((state) => state.menuState.openMenus.includes(Menu.TaskCreateMenu));

  return (
    <div id="appMainPageContainer">
      <Toolbar />

      <div id="mainContainer">
        {onTaskViewPage && <TaskManagementPage />}
        {currentTaskPage === Page.StreamEditor && <StreamEditorPage />}
        <AnimatePresence>{showTaskCreateMenu && <TaskCreateMenu id="taskCreationWindow" />}</AnimatePresence>
      </div>

      <UndoNotification />
    </div>
  );
};
