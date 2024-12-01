import collapseIcon from '@assets/icons/collapse.svg';
import expandIcon from '@assets/icons/expand.svg';
import { ContextMenuType } from '@remindr/shared';
import { hideContextMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import React from 'react';
import ReactFocusLock from 'react-focus-lock';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';
import { ContextMenu } from '../ContextMenu';

export const GeneralContextMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const { x, y } = useAppSelector((state) => state.menuState.contextMenuPositions[ContextMenuType.GeneralContextMenu]);

  const hideGeneralContextMenu = (fromEscKeypress: boolean) =>
    dispatch(hideContextMenu(ContextMenuType.GeneralContextMenu), { fromEscKeypress });

  function dropdownAction(action: () => void) {
    action();
    hideGeneralContextMenu(false);
  }

  return (
    <ContextMenu id="generalContextMenu" hideMenu={hideGeneralContextMenu} x={x} y={y}>
      <ReactFocusLock>
        <ArrowNavigable autoFocus asUl waitForChildAnimation>
          <li
            onClick={() =>
              dropdownAction(() => {
                window.mainWindow.webContents.sendMessage('expand-all-groups', true);
              })
            }
            className="menu-bottom-border"
            title="Expand all task groups"
          >
            <img src={expandIcon} className="task-tile-image" draggable="false" alt="" />
            <p>Expand All</p>
          </li>
          <li
            onClick={() =>
              dropdownAction(() => {
                window.mainWindow.webContents.sendMessage('expand-all-groups', false);
              })
            }
            title="Collapse all task groups"
          >
            <img src={collapseIcon} className="task-tile-image" draggable="false" alt="" />
            <p>Collapse All</p>
          </li>
        </ArrowNavigable>
      </ReactFocusLock>
    </ContextMenu>
  );
};
