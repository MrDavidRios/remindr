import expandIcon from "@assets/icons/expand.svg";
import { ContextMenuType } from "@remindr/shared";
import { hideContextMenu } from "@renderer/features/menu-state/menuSlice";
import { selectAllTasksInGroup } from "@renderer/features/task-list/taskListSlice";
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

  const taskGroupName = document
    .elementsFromPoint(x, y)
    .find((el) => el.classList.contains("task-group-header"))
    ?.querySelector("span")?.innerText;

  return (
    <ContextMenu
      id="taskGroupContextMenu"
      hideMenu={hideTaskContextMenu}
      x={x}
      y={y}
    >
      <ReactFocusLock>
        <ArrowNavigable autoFocus asUl waitForChildAnimation>
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
        </ArrowNavigable>
      </ReactFocusLock>
    </ContextMenu>
  );
};
