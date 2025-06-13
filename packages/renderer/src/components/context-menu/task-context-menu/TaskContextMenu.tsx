import duplicateIcon from '@assets/icons/duplicate.svg';
import pinIcon from '@assets/icons/pin.svg';
import removeIcon from '@assets/icons/remove.svg';
import skipIcon from '@assets/icons/skip.svg';
import trashcanIcon from '@assets/icons/trashcan.svg';
import unpinIcon from '@assets/icons/unpin.svg';
import type { Task } from '@remindr/shared';
import { ContextMenuType, Menu, Page, TASK_COLUMNS, taskHasReminders } from '@remindr/shared';
import store from '@renderer/app/store';
import { hideContextMenu } from '@renderer/features/menu-state/menuSlice';
import {
  clearSelectedTasks,
  duplicateTask,
  removeFromColumn,
  removeTasks,
  togglePinTask,
} from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { doIfTaskMenusAreClosed } from '@renderer/scripts/utils/menuutils';
import React from 'react';
import ReactFocusLock from 'react-focus-lock';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';
import { ContextMenu } from '../ContextMenu';
import { PostponeContextMenu } from './PostponeContextMenu';

export const TaskContextMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const { x, y } = useAppSelector((state) => state.menuState.contextMenuPositions[ContextMenuType.TaskContextMenu]);
  const task = useAppSelector((state) => state.menuState.contextMenuTask);
  const page = useAppSelector((state) => state.pageState.currentPage);

  const inListView = page === Page.ListView;
  const inColumnView = page === Page.ColumnView;

  const hideTaskContextMenu = (fromEscKeypress: boolean) =>
    dispatch(hideContextMenu(ContextMenuType.TaskContextMenu), { fromEscKeypress });

  useHotkey(
    ['mod+p'],
    () => doIfTaskMenusAreClosed(() => dropdownAction(task, (t) => dispatch(togglePinTask(t)))),
    Menu.None,
  );
  useHotkey(
    ['mod+d'],
    () => doIfTaskMenusAreClosed(() => dropdownAction(task, (t) => dispatch(duplicateTask(t)))),
    Menu.None,
  );
  useHotkey(
    ['delete'],
    () => doIfTaskMenusAreClosed(() => dropdownAction(task, (t) => dispatch(removeTasks([t])))),
    Menu.None,
  );

  function dropdownAction(actionTask: Task | undefined, action: (t: Task) => void) {
    if (actionTask === undefined) return;

    const selectedTasks = store.getState().taskList.selectedTasks;

    const actionTaskSelected = selectedTasks.filter((t) => t.creationTime === actionTask.creationTime).length > 0;
    if (!actionTaskSelected) {
      action(actionTask);
      hideTaskContextMenu(false);
      return;
    }

    for (const selectedTask of selectedTasks) {
      action(selectedTask);
    }

    dispatch(clearSelectedTasks());
    hideTaskContextMenu(false);
  }

  const showPinButtons = inListView;
  const showRemoveFromColumnBtn =
    inColumnView && task?.columnIdx !== undefined && task?.scheduledReminders.length === 0;
  const showWide = showRemoveFromColumnBtn;

  return (
    <ContextMenu id="taskContextMenu" className={showWide ? 'wide' : ''} x={x} y={y} hideMenu={hideTaskContextMenu}>
      <ReactFocusLock>
        <ArrowNavigable className="menu frosted" query=":scope > li:not(.hidden)" asUl autoFocus waitForChildAnimation>
          {showPinButtons && (
            <>
              {task?.pinned ? (
                <li
                  title="Unpin task (Ctrl + P)"
                  onClick={() => dropdownAction(task, (t) => dispatch(togglePinTask(t)))}
                >
                  <img src={unpinIcon} className="task-tile-image" draggable="false" alt="" />
                  <p>Unpin</p>
                </li>
              ) : (
                <li title="Pin task (Ctrl + P)" onClick={() => dropdownAction(task, (t) => dispatch(togglePinTask(t)))}>
                  <img src={pinIcon} className="task-tile-image" draggable="false" alt="" />
                  <p>Pin</p>
                </li>
              )}
            </>
          )}
          {showRemoveFromColumnBtn && task.columnIdx !== undefined && (
            <li
              title={`Remove task from "${TASK_COLUMNS.get(task.columnIdx)}" column`}
              onClick={() => dropdownAction(task, (t) => dispatch(removeFromColumn(t)))}
            >
              <img src={removeIcon} className="task-tile-image" draggable="false" alt="" />
              <p>Remove from column</p>
            </li>
          )}
          <li
            className={inListView || showRemoveFromColumnBtn ? 'menu-top-border' : ''}
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
          {task && taskHasReminders(task) && (
            <PostponeContextMenu dropdownAction={dropdownAction} task={task} dispatch={dispatch} />
          )}
          <li
            className="menu-top-border"
            style={{ color: '#b72929' }}
            title="Delete task (Delete)"
            onClick={() => dropdownAction(task, (t) => dispatch(removeTasks([t])))}
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
