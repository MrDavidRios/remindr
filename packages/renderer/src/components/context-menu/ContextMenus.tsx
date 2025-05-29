import { ContextMenuType } from "@remindr/shared";
import { useAppSelector } from "@renderer/hooks";
import { isContextMenuOpen } from "@renderer/scripts/utils/menuutils";
import React from "react";
import { StreamTaskContextMenu } from "./stream-task-context-menu/StreamTaskContextMenu";
import { TaskContextMenu } from "./task-context-menu/TaskContextMenu";
import { TaskGroupContextMenu } from "./task-group-context-menu/TaskGroupContextMenu";

export const ContextMenus: React.FC = () => {
  const menuState = useAppSelector((state) => state.menuState);

  return (
    <>
      {isContextMenuOpen(menuState, ContextMenuType.TaskGroupContextMenu) && (
        <TaskGroupContextMenu />
      )}
      {isContextMenuOpen(menuState, ContextMenuType.TaskContextMenu) && (
        <TaskContextMenu />
      )}
      {isContextMenuOpen(menuState, ContextMenuType.StreamTaskContextMenu) && (
        <StreamTaskContextMenu />
      )}
    </>
  );
};
