import doubleExpandArrowIcon from '@assets/icons/angel-right-double.svg';
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
  duplicateTasks,
  removeTasks,
  togglePinTask
} from '@renderer/features/task-list/taskListSlice';
import { getEditedTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { isMenuOpen } from '@renderer/scripts/utils/menuutils';
import type { FC } from 'react';

interface ActionBarProps {
  task: Task;
  creatingTask: boolean;
  onSave: () => void;
}

export const ActionBar: FC<ActionBarProps> = ({ task, creatingTask, onSave }) => {
  const dispatch = useAppDispatch();

  useSetupHotkeys(creatingTask, onSave, dispatch);

  return (
    <div id="taskActionsBar" className={!creatingTask ? '' : 'action-buttons-hidden'}>
      {creatingTask ? (
        <button
          id="saveTaskButton"
          className="action-button accessible-button"
          onClick={() => onSave()}
          type="button"
          title="Save Changes (Ctrl + S)"
          aria-label="Save Changes"
        >
          <img src={checkIcon} className="svg-filter" draggable="false" alt="Save Changes" />
        </button>
      ) : (
        <>
          <div>
            <button
              id="collapseTaskEditMenu"
              className="action-button accessible-button"
              onClick={() => dispatch(clearSelectedTasks())}
              type="button"
              title="Close (Esc)"
              aria-label="Close Menu"
            >
              <img src={doubleExpandArrowIcon} draggable="false" alt="Close Menu" />
            </button>
          </div>
          <div data-testid="action-buttons-wrapper">
            {task.pinned ? (
              <button
                className="action-button accessible-button"
                id="unpinBtn"
                onClick={() => togglePinOnEditedTask(dispatch)}
                type="button"
                title="Unpin (Ctrl + P)"
                aria-label="Unpin Task"
              >
                <img src={unpinIcon} className="action-button svg-filter" draggable="false" alt="Unpin Task" />
              </button>
            ) : (
              <button
                className="action-button accessible-button"
                onClick={() => togglePinOnEditedTask(dispatch)}
                type="button"
                title="Pin (Ctrl + P)"
                aria-label="Pin Task"
              >
                <img src={pinIcon} className="action-button svg-filter" draggable="false" alt="Pin Task" />
              </button>
            )}
            <button
              className="action-button accessible-button"
              onClick={() => duplicateEditedTask(dispatch)}
              type="button"
              title="Duplicate (Ctrl + D)"
              aria-label="Duplicate Task"
            >
              <img src={duplicateIcon} className="action-button svg-filter" draggable="false" alt="Duplicate Task" />
            </button>
            <button
              className="action-button accessible-button"
              onClick={() => removeEditedTask(dispatch)}
              type="button"
              title="Delete (Del)"
              aria-label="Delete Task"
            >
              <img src={trashcanIcon} className="action-button svg-filter" draggable="false" alt="Delete Task" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function useSetupHotkeys(creatingTask: boolean, onSave: () => void, dispatch: AppDispatch) {
  const menu = creatingTask ? Menu.TaskCreateMenu : Menu.TaskEditMenu;

  useHotkey(
    ['mod+s'],
    (e) => {
      const taskCreationMenuOpen = isMenuOpen(store.getState().menuState, Menu.TaskCreateMenu);

      if (!taskCreationMenuOpen || e.repeat) return;

      onSave();
    },
    menu,
  );
  useHotkey(
    ['mod+d'],
    () => {
      if (creatingTask) return;

      duplicateEditedTask(dispatch);
    },
    menu,
  );
  useHotkey(
    ['mod+p'],
    () => {
      if (!isMenuOpen(store.getState().menuState, Menu.TaskEditMenu) || creatingTask) return;

      togglePinOnEditedTask(dispatch);
    },
    menu,
  );

  useHotkey(
    ['delete'],
    () => {
      if (!isMenuOpen(store.getState().menuState, Menu.TaskEditMenu) || creatingTask) return;

      removeEditedTask(dispatch);
    },
    menu,
    {
      disableOnFormTags: true,
    },
  );
}

function togglePinOnEditedTask(dispatch: AppDispatch) {
  const task = getEditedTask(store.getState().taskModificationState);
  if (!task) return;

  dispatch(togglePinTask(task));
  dispatch(clearSelectedTasks());
}

function removeEditedTask(dispatch: AppDispatch) {
  const task = getEditedTask(store.getState().taskModificationState);
  if (!task) return;

  dispatch(removeTasks([task]));
  dispatch(clearSelectedTasks());
}

function duplicateEditedTask(dispatch: AppDispatch) {
  const task = getEditedTask(store.getState().taskModificationState);
  if (!task) return;

  dispatch(duplicateTasks([task]));
  dispatch(clearSelectedTasks());
}
