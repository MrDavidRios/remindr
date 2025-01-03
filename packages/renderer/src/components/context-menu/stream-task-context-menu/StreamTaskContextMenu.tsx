import removeIcon from '@assets/icons/remove.svg';
import type { StreamTask } from '@remindr/shared';
import { ContextMenuType, Menu } from '@remindr/shared';
import { hideContextMenu } from '@renderer/features/menu-state/menuSlice';
import { removeTaskFromStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { doIfTaskMenusAreClosed } from '@renderer/scripts/utils/menuutils';
import React from 'react';
import ReactFocusLock from 'react-focus-lock';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';
import { ContextMenu } from '../ContextMenu';

export const StreamTaskContextMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const { x, y } = useAppSelector(
    (state) => state.menuState.contextMenuPositions[ContextMenuType.StreamTaskContextMenu],
  );
  const streamTask = useAppSelector((state) => state.menuState.contextMenuStreamTask);

  const hideMenu = (fromEscKeypress: boolean) =>
    dispatch(hideContextMenu(ContextMenuType.StreamTaskContextMenu), { fromEscKeypress });

  useHotkey(
    ['delete'],
    () => doIfTaskMenusAreClosed(() => dropdownAction(streamTask, (t) => dispatch(removeTaskFromStream(t)))),
    Menu.None,
  );

  function dropdownAction(actionTask: StreamTask | undefined, action: (t: StreamTask) => void) {
    if (actionTask === undefined) return;

    action(actionTask);

    hideMenu(false);
  }

  return (
    <ContextMenu id="streamTaskContextMenu" x={x} y={y} hideMenu={hideMenu} parentContainerId="streamTaskList">
      <ReactFocusLock>
        <ArrowNavigable className="menu frosted" query=":scope > li:not(.hidden)" asUl autoFocus waitForChildAnimation>
          <li
            title={`Remove task from stream`}
            onClick={() => dropdownAction(streamTask, (t) => dispatch(removeTaskFromStream(t)))}
          >
            <img src={removeIcon} className="task-tile-image" draggable="false" alt="" />
            <p>Remove from stream</p>
          </li>
        </ArrowNavigable>
      </ReactFocusLock>
    </ContextMenu>
  );
};
