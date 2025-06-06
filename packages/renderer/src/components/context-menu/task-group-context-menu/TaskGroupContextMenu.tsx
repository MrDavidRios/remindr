import expandIcon from "@assets/icons/expand.svg";
import removeIcon from "@assets/icons/remove.svg";
import { ContextMenuType } from "@remindr/shared";
import { hideContextMenu } from "@renderer/features/menu-state/menuSlice";
import { allTasksInGroupSelectedSelector } from "@renderer/features/task-list/selectors/taskGroupSelectors";
import {
  deselectAllTasksInGroup,
  selectAllTasksInGroup,
} from "@renderer/features/task-list/taskListSlice";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import React from "react";
import ReactFocusLock from "react-focus-lock";
import { ArrowNavigable } from "../../accessibility/ArrowNavigable";
import { ContextMenu } from "../ContextMenu";

export const TaskGroupContextMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const { x, y } = useAppSelector(
    (state) =>
      state.menuState.contextMenuPositions[ContextMenuType.TaskGroupContextMenu]
  );

  const hideTaskContextMenu = (fromEscKeypress: boolean) =>
    dispatch(hideContextMenu(ContextMenuType.TaskGroupContextMenu), {
      fromEscKeypress,
    });

  function dropdownAction(action: () => void) {
    action();
    hideTaskContextMenu(false);
  }

  const taskGroupName = useAppSelector(
    (state) => state.menuState.currentTaskGroupContextMenuGroup ?? ""
  );

  const allTasksInGroupSelected = useAppSelector((state) =>
    allTasksInGroupSelectedSelector(state, taskGroupName)
  );

  return (
    <ContextMenu
      id="taskGroupContextMenu"
      hideMenu={hideTaskContextMenu}
      x={x}
      y={y}
    >
      <ReactFocusLock>
        <ArrowNavigable autoFocus asUl waitForChildAnimation>
          {allTasksInGroupSelected ? (
            <li
              onClick={() => {
                if (!taskGroupName) return;

                dropdownAction(() => {
                  dispatch(deselectAllTasksInGroup(taskGroupName));
                });
              }}
              className="menu-bottom-border"
              title="De-select all tasks in this group"
            >
              <img
                src={removeIcon}
                className="task-tile-image"
                draggable="false"
                alt=""
              />
              <p>{`De-select All Tasks in "${taskGroupName}"`}</p>
            </li>
          ) : (
            <li
              onClick={() => {
                if (!taskGroupName) return;

                dropdownAction(() => {
                  dispatch(selectAllTasksInGroup(taskGroupName));
                });
              }}
              className="menu-bottom-border"
              title="Select all tasks in this group"
            >
              <img
                src={expandIcon}
                className="task-tile-image"
                draggable="false"
                alt=""
              />
              <p>{`Select All Tasks in "${taskGroupName}"`}</p>
            </li>
          )}
        </ArrowNavigable>
      </ReactFocusLock>
    </ContextMenu>
  );
};
