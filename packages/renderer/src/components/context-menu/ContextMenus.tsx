import { ContextMenuType } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { isContextMenuOpen } from '@renderer/scripts/utils/menuutils';
import React from 'react';
import { GeneralContextMenu } from './general-context-menu/GeneralContextMenu';
import { StreamTaskContextMenu } from './stream-task-context-menu/StreamTaskContextMenu';
import { TaskContextMenu } from './task-context-menu/TaskContextMenu';

export const ContextMenus: React.FC = () => {
  const menuState = useAppSelector((state) => state.menuState);

  return (
    <>
      {isContextMenuOpen(menuState, ContextMenuType.GeneralContextMenu) && <GeneralContextMenu />}
      {isContextMenuOpen(menuState, ContextMenuType.TaskContextMenu) && <TaskContextMenu />}
      {isContextMenuOpen(menuState, ContextMenuType.StreamTaskContextMenu) && <StreamTaskContextMenu />}
    </>
  );
};
