import Task from 'main/types/classes/task/task';
import { FC } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import store from 'renderer/app/store';
import {
  clearSelectedTasks,
  duplicateTasks,
  pinTasks,
  removeTasks,
  unpinTasks,
} from 'renderer/features/task-list/taskListSlice';
import { useAppDispatch } from 'renderer/hooks';
import { isFullscreenMenuOpen } from 'renderer/scripts/utils/menuutils';
import duplicateIcon from '../../../../../assets/icons/duplicate.svg';
import pinIcon from '../../../../../assets/icons/pin.svg';
import trashcanIcon from '../../../../../assets/icons/trashcan.svg';
import unpinIcon from '../../../../../assets/icons/unpin.svg';

export const TaskSelectionBar: FC<{ selectedTasks: Task[] }> = ({ selectedTasks }) => {
  const dispatch = useAppDispatch();

  const taskPinned = selectedTasks.find((t) => t.pinned) !== undefined;
  setupHotkeys(onUnpin, onPin, taskPinned, onDuplicate, onDelete);

  function onUnpin() {
    dispatch(unpinTasks(selectedTasks));
    dispatch(clearSelectedTasks());
  }

  function onPin() {
    dispatch(pinTasks(selectedTasks));
    dispatch(clearSelectedTasks());
  }

  function onDuplicate() {
    dispatch(duplicateTasks(selectedTasks));
    dispatch(clearSelectedTasks());
  }

  function onDelete() {
    dispatch(removeTasks(selectedTasks));
    dispatch(clearSelectedTasks());
  }

  return (
    <div id="multipleSelectionWrapper" className="frosted">
      <h3 id="multipleSelectionCounter">{selectedTasks.length} Tasks Selected</h3>
      <div id="multipleSelectionActionButtons">
        {taskPinned ? (
          <button className="accessible-button" type="button" onClick={onUnpin} aria-label="Unpin selected tasks">
            <img
              id="unpinMultipleTasks"
              src={unpinIcon}
              className="svg-filter"
              draggable="false"
              title="Unpin (Ctrl + P)"
              alt=""
            />
          </button>
        ) : (
          <button className="accessible-button" type="button" onClick={onPin} aria-label="Pin selected tasks">
            <img
              id="pinMultipleTasks"
              src={pinIcon}
              className="svg-filter"
              draggable="false"
              title="Pin (Ctrl + P)"
              alt=""
            />
          </button>
        )}
        <button className="accessible-button" type="button" onClick={onDuplicate} aria-label="Duplicate selected tasks">
          <img
            id="duplicateMultipleTasks"
            src={duplicateIcon}
            className="svg-filter"
            draggable="false"
            title="Duplicate (Ctrl + D)"
            alt=""
          />
        </button>
        <button className="accessible-button" type="button" onClick={onDelete} aria-label="Delete selected tasks">
          <img
            id="deleteMultipleTasks"
            src={trashcanIcon}
            className="svg-filter"
            draggable="false"
            title="Delete (Del)"
            alt=""
          />
        </button>
      </div>
    </div>
  );
};

function setupHotkeys(
  onUnpin: () => void,
  onPin: () => void,
  taskPinned: boolean,
  onDuplicate: () => void,
  onDelete: () => void,
) {
  useHotkeys(
    'mod+d',
    () => {
      if (isFullscreenMenuOpen(store.getState().menuState)) return;

      onDuplicate();
    },
    {
      enableOnFormTags: true,
    },
  );
  useHotkeys(
    'mod+p',
    () => {
      if (isFullscreenMenuOpen(store.getState().menuState)) return;
      taskPinned ? onUnpin() : onPin();
    },
    {
      enableOnFormTags: true,
    },
  );

  useHotkeys('delete', () => {
    if (isFullscreenMenuOpen(store.getState().menuState)) return;
    onDelete();
  });
}
