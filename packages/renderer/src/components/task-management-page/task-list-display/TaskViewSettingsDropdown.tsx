import visibilityOffIcon from '@assets/icons/visibility-off.svg';
import visibilityOnIcon from '@assets/icons/visibility-on.svg';
import { Menu } from '@remindr/shared';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { updateSetting } from '@renderer/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { rgbaToHex } from '@renderer/scripts/utils/colorutils';
import { type FC } from 'react';
import ReactFocusLock from 'react-focus-lock';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';
import { DropdownMenu } from '../../menus/dropdown-menu/DropdownMenu';

export const TaskViewSettingsDropdown: FC = () => {
  const dispatch = useAppDispatch();

  const showCompletedTasks = useAppSelector((state) => state.settings.value.showCompletedTasks ?? true);

  const backgroundColor = rgbaToHex(getComputedStyle(document.documentElement).getPropertyValue('--surface-primary'));

  const setCompletedTasksSetting = (value: boolean) => {
    dispatch(updateSetting({ key: 'showCompletedTasks', value }));
    dispatch(hideMenu({ menu: Menu.TaskListViewSettingsMenu, fromEscKeypress: false }));
  };

  return (
    <DropdownMenu
      parentMenu={Menu.None}
      id="taskListViewSettingsMenu"
      className="menu context-menu"
      onClose={() => dispatch(hideMenu({ menu: Menu.TaskListViewSettingsMenu }))}
      clickOutsideExceptions={['#viewSettingsButton']}
      style={{ backgroundColor }}
      animate={false}
      closeOnScroll
    >
      <ReactFocusLock>
        <ArrowNavigable className="menu frosted" query=":scope > li:not(.hidden)" asUl autoFocus>
          {showCompletedTasks ? (
            <li
              onClick={() => setCompletedTasksSetting(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setCompletedTasksSetting(false);
              }}
            >
              <img src={visibilityOffIcon} className="task-tile-image" draggable="false" alt="" />
              <p>Hide completed tasks</p>
            </li>
          ) : (
            <li
              onClick={() => setCompletedTasksSetting(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setCompletedTasksSetting(true);
              }}
            >
              <img src={visibilityOnIcon} className="task-tile-image" draggable="false" alt="" />
              <p>Show completed tasks</p>
            </li>
          )}
        </ArrowNavigable>
      </ReactFocusLock>
    </DropdownMenu>
  );
};
