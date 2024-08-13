import duplicateIcon from '@assets/icons/duplicate.svg';
import pinIcon from '@assets/icons/pin.svg';
import skipIcon from '@assets/icons/skip.svg';
import trashcanIcon from '@assets/icons/trashcan.svg';
import unpinIcon from '@assets/icons/unpin.svg';
import type { Task } from '@remindr/shared';
import { taskHasReminders } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import store from '@renderer/app/store';
import {
  clearSelectedTasks,
  duplicateTask,
  removeTask,
  togglePinTask,
} from '@renderer/features/task-list/taskListSlice';
import { doIfTaskMenusAreClosed } from '@renderer/scripts/utils/menuutils';
import React from 'react';
import ReactFocusLock from 'react-focus-lock';
import { useHotkeys } from 'react-hotkeys-hook';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';
import { ContextMenu } from '../ContextMenu';
import { PostponeContextMenu } from './PostponeContextMenu';

interface TaskContextMenuProps {
  x: number;
  y: number;
  task: Task;
  dispatch: AppDispatch;
  hideTaskContextMenu: () => void;
}

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({ x, y, task, dispatch, hideTaskContextMenu }) => {
  useHotkeys('mod+p', () => doIfTaskMenusAreClosed(() => dropdownAction(task, (t) => dispatch(togglePinTask(t)))));
  useHotkeys('mod+d', () => doIfTaskMenusAreClosed(() => dropdownAction(task, (t) => dispatch(duplicateTask(t)))));
  useHotkeys('delete', () => doIfTaskMenusAreClosed(() => dropdownAction(task, (t) => dispatch(removeTask(t)))));

  function dropdownAction(actionTask: Task, action: (t: Task) => void) {
    const selectedTasks = store.getState().taskList.selectedTasks;

    const actionTaskSelected = selectedTasks.filter((t) => t.creationTime === actionTask.creationTime).length > 0;
    if (!actionTaskSelected) {
      action(actionTask);
      hideTaskContextMenu();
      return;
    }

    for (let i = 0; i < selectedTasks.length; i++) action(selectedTasks[i]);

    dispatch(clearSelectedTasks());
    hideTaskContextMenu();
  }

  return (
    <ContextMenu id="taskContextMenu" x={x} y={y} hideMenu={hideTaskContextMenu}>
      <ReactFocusLock>
        <ArrowNavigable className="menu frosted" query=":scope > li:not(.hidden)" asUl autoFocus waitForChildAnimation>
          {task.pinned ? (
            <li title="Unpin task (Ctrl + P)" onClick={() => dropdownAction(task, (t) => dispatch(togglePinTask(t)))}>
              <img src={unpinIcon} className="task-tile-image" draggable="false" alt="" />
              <p>Unpin</p>
            </li>
          ) : (
            <li title="Pin task (Ctrl + P)" onClick={() => dropdownAction(task, (t) => dispatch(togglePinTask(t)))}>
              <img src={pinIcon} className="task-tile-image" draggable="false" alt="" />
              <p>Pin</p>
            </li>
          )}
          <li
            className="menu-top-border"
            title="Duplicate task (Ctrl + D)"
            onClick={() => dropdownAction(task, (t) => dispatch(duplicateTask(t)))}
          >
            <img src={duplicateIcon} className="task-tile-image" draggable="false" alt="" />
            <p>Duplicate</p>
          </li>
          <li className="menu-top-border hidden" title="Skip to next repeat date">
            <img src={skipIcon} className="task-tile-image" draggable="false" alt="" />
            <p>Skip</p>
          </li>
          {taskHasReminders(task) && (
            <PostponeContextMenu dropdownAction={dropdownAction} task={task} dispatch={dispatch} />
          )}
          <li
            className="menu-top-border"
            style={{ color: '#b72929' }}
            title="Delete task (Delete)"
            onClick={() => dropdownAction(task, (t) => dispatch(removeTask(t)))}
          >
            <img
              src={trashcanIcon}
              className="task-tile-image"
              style={{
                filter: 'invert(9%) sepia(77%) saturate(6607%) hue-rotate(9deg) brightness(94%) contrast(116%)',
              }}
              draggable="false"
              alt=""
            />
            <p>Delete</p>
          </li>
        </ArrowNavigable>
      </ReactFocusLock>
    </ContextMenu>
  );
};
