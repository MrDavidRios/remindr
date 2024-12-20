import closeButtonIcon from '@assets/icons/close-button.svg';
import searchIcon from '@assets/icons/search.svg';
import { Menu, Task } from '@remindr/shared';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { FloatingMenu } from '@renderer/components/floating-menu/FloatingMenu';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { updateTask } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { useDetectWheel } from '@renderer/scripts/utils/hooks/usedetectwheel';
import { useEscToClose } from '@renderer/scripts/utils/hooks/useesctoclose';
import { isValidSearchString, searchTasks } from '@renderer/scripts/utils/searchutils';
import { FC, useState } from 'react';
import ReactFocusLock from 'react-focus-lock';

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

  const closeMenu = () => dispatch(hideMenu({ menu: Menu.AddExistingReminderMenu }));
  useEscToClose(dispatch, Menu.AddExistingReminderMenu);

  // Hide menu when scrolling on task list container
  useDetectWheel({
    element: document.getElementById('taskListDisplayContainer') as HTMLElement | undefined,
    callback: () => dispatch(hideMenu({ menu: Menu.AddExistingReminderMenu })),
  });

  return (
    <ReactFocusLock returnFocus>
      <FloatingMenu
        anchor={anchor}
        yOffset={yOffset}
        gap={gap}
        id="addExistingReminderMenu"
        className="frosted"
        clickOutsideExceptions={['.add-external-task-button']}
        onClickOutside={() => dispatch(hideMenu({ menu: Menu.AddExistingReminderMenu, fromEscKeypress: true }))}
      >
        <div className="titlebar">
          <p>Add Existing Task</p>
          <button type="button" className="close-button" onClick={closeMenu} title="Close Menu" aria-label="Close Menu">
            <img src={closeButtonIcon} draggable="false" />
          </button>
        </div>
        <div className="search-bar">
          <img src={searchIcon} className="svg-filter" draggable="false" title="Search" alt="" />
          <input placeholder="Search tasks" autoFocus onChange={(e) => setSearchQuery(e.currentTarget.value)} />
        </div>
        {filteredTasks.length > 0 ? (
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
        ) : (
          <p>No tasks available to search.</p>
        )}
      </FloatingMenu>
    </ReactFocusLock>
  );
};
