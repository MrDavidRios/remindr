import visibilityOffIcon from '@assets/icons/visibility-off.svg';
import visibilityOnIcon from '@assets/icons/visibility-on.svg';
import { Menu } from '@remindr/shared';
import store from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { updateSetting } from '@renderer/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { rgbaToHex } from '@renderer/scripts/utils/colorutils';
import { useDetectWheel } from '@renderer/scripts/utils/hooks/usedetectwheel';
import { isFullscreenMenuOpen, isPrimaryMenuOpen } from '@renderer/scripts/utils/menuutils';
import type { FC } from 'react';
import ReactFocusLock from 'react-focus-lock';
import { useHotkeys } from 'react-hotkeys-hook';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';
import { DropdownMenu } from '../../menus/dropdown-menu/DropdownMenu';

export const TaskViewSettingsDropdown: FC = () => {
  const dispatch = useAppDispatch();

  const showCompletedTasks = useAppSelector((state) => state.settings.value.showCompletedTasks ?? true);

  const backgroundColor = rgbaToHex(getComputedStyle(document.documentElement).getPropertyValue('--surface-primary'));

  useHotkeys(
    'esc',
    () => {
      const competingMenuOpen =
        isPrimaryMenuOpen(store.getState().menuState) || isFullscreenMenuOpen(store.getState().menuState);
      if (competingMenuOpen) return;

      dispatch(hideMenu({ menu: Menu.TaskListViewSettingsMenu, fromEscKeypress: true }));
    },
    { enableOnFormTags: true },
  );

  useDetectWheel({
    element: document.body,
    callback: () => {
      dispatch(hideMenu({ menu: Menu.TaskListViewSettingsMenu, fromEscKeypress: true }));
    },
  });

  const setCompletedTasksSetting = (value: boolean) => {
    dispatch(updateSetting({ key: 'showCompletedTasks', value }));
    dispatch(hideMenu({ menu: Menu.TaskListViewSettingsMenu, fromEscKeypress: false }));
  };

  return (
    <DropdownMenu
      className="menu context-menu"
      id="taskListViewSettingsMenu"
      onClickOutside={() => dispatch(hideMenu({ menu: Menu.TaskListViewSettingsMenu }))}
      clickOutsideExceptions={['#viewSettingsButton']}
      style={{ backgroundColor }}
      animate={false}
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
