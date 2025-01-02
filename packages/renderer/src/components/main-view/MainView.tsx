import { Page } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { FC } from 'react';
import { StreamEditorPage } from '../stream-editor-page/StreamEditorPage';
import { TaskManagementPage } from '../task-management-page/TaskManagementPage';
import { Toolbar } from '../toolbar/Toolbar';
import { UndoNotification } from '../undo-notification/UndoNotification';

export const MainView: FC = () => {
  const currentTaskPage = useAppSelector((state) => state.pageState.currentPage);

  const onTaskViewPage = currentTaskPage === Page.ColumnView || currentTaskPage === Page.ListView;

  return (
    <div id="appMainPageContainer">
      <Toolbar />

      <div id="mainContainer">
        {onTaskViewPage && <TaskManagementPage />}
        {currentTaskPage === Page.StreamEditor && <StreamEditorPage />}
      </div>

      <UndoNotification />
    </div>
  );
};
