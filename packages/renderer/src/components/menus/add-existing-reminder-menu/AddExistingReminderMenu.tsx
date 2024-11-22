import closeButtonIcon from '@assets/icons/close-button.svg';
import searchIcon from '@assets/icons/search.svg';
import { Menu, Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { FloatingMenu } from '@renderer/components/floating-menu/FloatingMenu';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { updateTask } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { isFullscreenMenuOpen, isPrimaryMenuOpen } from '@renderer/scripts/utils/menuutils';
import { isValidSearchString, searchTasks } from '@renderer/scripts/utils/searchutils';
import { FC, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export const AddExistingReminderMenu: FC = () => {
  const dispatch = useAppDispatch();
  const { anchor, yOffset, gap } = useAppSelector((state) => state.menuState.addExistingReminderMenuPosition);
  const taskList = useAppSelector((state) => state.taskList.value);
  const focusedColumnIdx = useAppSelector((state) => state.taskColumns.focusedTaskColumnIdx);

  const reminderlessTasks = taskList.filter(
    (task) => task.scheduledReminders.length === 0 && task.columnIdx !== focusedColumnIdx && !task.completed,
  );

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = isValidSearchString(searchQuery)
    ? searchTasks(reminderlessTasks, searchQuery)
    : reminderlessTasks;

  useHotkeys(
    'esc',
    () => {
      const competingMenuOpen =
        isPrimaryMenuOpen(store.getState().menuState) || isFullscreenMenuOpen(store.getState().menuState);
      if (competingMenuOpen) return;

      dispatch(hideMenu({ menu: Menu.AddExistingReminderMenu, fromEscKeypress: true }));
    },
    { enableOnFormTags: true },
  );

  const closeMenu = () => dispatch(hideMenu({ menu: Menu.AddExistingReminderMenu }));

  return (
    <FloatingMenu
      anchor={anchor}
      yOffset={yOffset}
      gap={gap}
      id="addExistingReminderMenu"
      className="frosted"
      clickOutsideExceptions={['.add-external-task-button']}
      onClickOutside={() => {
        dispatch(hideMenu({ menu: Menu.AddExistingReminderMenu, fromEscKeypress: true }));
      }}
    >
      <div className="titlebar">
        <p>Add Existing Task</p>
        <button type="button" className="close-button" onClick={closeMenu} title="Close Menu" aria-label="Close Menu">
          <img src={closeButtonIcon} draggable="false" />
        </button>
      </div>
      <div className="search-bar">
        <img src={searchIcon} className="svg-filter" draggable="false" title="Search" alt="" />
        <input placeholder="Search tasks" onChange={(e) => setSearchQuery(e.currentTarget.value)} />
      </div>
      <ArrowNavigable asUl>
        {filteredTasks.map((task) => (
          <div
            key={task.creationTime}
            onClick={() => {
              const taskClone: Task = { ...task, columnIdx: focusedColumnIdx };
              dispatch(updateTask(taskClone));
              closeMenu();
            }}
          >
            {task.name}
          </div>
        ))}
      </ArrowNavigable>
    </FloatingMenu>
  );
};
