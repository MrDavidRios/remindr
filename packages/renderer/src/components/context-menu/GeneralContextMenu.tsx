/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import ReactFocusLock from 'react-focus-lock';
import collapseIcon from '../../../../assets/icons/collapse.svg';
import expandIcon from '../../../../assets/icons/expand.svg';
import { ArrowNavigable } from '../accessibility/ArrowNavigable';
import { ContextMenu } from './ContextMenu';

interface GeneralContextMenuProps {
  x: number;
  y: number;
  hideGeneralContextMenu: () => void;
}

export const GeneralContextMenu: React.FC<GeneralContextMenuProps> = ({ x, y, hideGeneralContextMenu }) => {
  function dropdownAction(action: () => void) {
    action();
    hideGeneralContextMenu();
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
