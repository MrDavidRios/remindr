import checkIcon from '@assets/icons/check.svg';
import duplicateIcon from '@assets/icons/duplicate.svg';
import pinIcon from '@assets/icons/pin.svg';
import trashcanIcon from '@assets/icons/trashcan.svg';
import unpinIcon from '@assets/icons/unpin.svg';
import type { Task } from '@remindr/shared';
import { Menu } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import store from '@renderer/app/store';
import {
  clearSelectedTasks,
  duplicateTask,
  removeTask,
  togglePinTask,
} from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { isFullscreenMenuOpen, isMenuOpen } from '@renderer/scripts/utils/menuutils';
import type { FC } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface ActionBarProps {
  task: Task;
  showActionButtons: boolean;
  onSave: (task: Task) => void;
}

export const ActionBar: FC<ActionBarProps> = ({ task, showActionButtons, onSave }) => {
  const dispatch = useAppDispatch();

  useSetupHotkeys(task, showActionButtons, onSave, dispatch);

  return (
    <div id="taskActionsBar" className={!showActionButtons ? 'action-buttons-hidden' : ''}>
      {showActionButtons && (
        <div>
          <button className="action-button accessible-button" onClick={() => deleteTask(task, dispatch)} type="button">
            <img
              src={trashcanIcon}
              className="action-button svg-filter"
              draggable="false"
              title="Delete (Del)"
              alt="Delete Task"
            />
          </button>
          <button
            className="action-button accessible-button"
            onClick={() => duplicateEditedTask(task, dispatch)}
            type="button"
          >
            <img
              src={duplicateIcon}
              className="action-button svg-filter"
              draggable="false"
              title="Duplicate (Ctrl + D)"
              alt="Duplicate Task"
            />
          </button>
          {task.pinned ? (
            <button
              className="action-button accessible-button"
              id="unpinBtn"
              onClick={() => togglePinOnTask(task, dispatch)}
              type="button"
            >
              <img
                src={unpinIcon}
                className="action-button svg-filter"
                draggable="false"
                title="Unpin (Ctrl + P)"
                alt="Unpin Task"
              />
            </button>
          ) : (
            <button
              className="action-button accessible-button"
              onClick={() => togglePinOnTask(task, dispatch)}
              type="button"
            >
              <img
                src={pinIcon}
                className="action-button svg-filter"
                draggable="false"
                title="Pin (Ctrl + P)"
                alt="Pin Task"
              />
            </button>
          )}
        </div>
      )}
      <button
        id="saveTaskButton"
        className="action-button accessible-button"
        onClick={() => onSave(task)}
        type="button"
      >
        <img
          src={checkIcon}
          className="svg-filter"
          draggable="false"
          title="Save Changes (Ctrl + S)"
          alt="Save Changes"
        />
      </button>
    </div>
  );
};

function useSetupHotkeys(task: Task, showActionButtons: boolean, onSave: (task: Task) => void, dispatch: AppDispatch) {
  useHotkeys(
    'mod+s',
    (e) => {
      if (
        isFullscreenMenuOpen(store.getState().menuState) ||
        isMenuOpen(store.getState().menuState, Menu.ScheduledReminderEditMenu) ||
        (!isMenuOpen(store.getState().menuState, Menu.TaskCreateMenu) &&
          !isMenuOpen(store.getState().menuState, Menu.TaskEditMenu)) ||
        e.repeat
      )
        return;
      onSave(task);
    },
    {
      enableOnFormTags: true,
    },
  );
  useHotkeys(
    'mod+d',
    () => {
      if (
        isFullscreenMenuOpen(store.getState().menuState) ||
        !isMenuOpen(store.getState().menuState, Menu.TaskEditMenu) ||
        !showActionButtons
      )
        return;

      duplicateEditedTask(task, dispatch);
    },
    {
      enableOnFormTags: true,
    },
  );
  useHotkeys(
    'mod+p',
    () => {
      if (
        isFullscreenMenuOpen(store.getState().menuState) ||
        !isMenuOpen(store.getState().menuState, Menu.TaskEditMenu) ||
        !showActionButtons
      )
        return;
      togglePinOnTask(task, dispatch);
    },
    {
      enableOnFormTags: true,
    },
  );

  useHotkeys('delete', () => {
    if (
      isFullscreenMenuOpen(store.getState().menuState) ||
      !isMenuOpen(store.getState().menuState, Menu.TaskEditMenu) ||
      !showActionButtons
    )
      return;
    deleteTask(task, dispatch);
  });
}

function togglePinOnTask(task: Task, dispatch: AppDispatch) {
  dispatch(togglePinTask(task));
  dispatch(clearSelectedTasks());
}

function deleteTask(task: Task, dispatch: AppDispatch) {
  dispatch(removeTask(task));
  dispatch(clearSelectedTasks());
}

function duplicateEditedTask(task: Task, dispatch: AppDispatch) {
  dispatch(duplicateTask(task));
  dispatch(clearSelectedTasks());
}
