import { Menu } from '@remindr/shared';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import CloseMenuButton from '../../close-menu-button/CloseMenuButton';
import { FullScreenMenu } from '../fullscreen-menu/FullScreenMenu';
import { SettingsPage, SettingsSidebar } from './SettingsSidebar';
import { AdvancedSettingsPage } from './settings-pages/AdvancedSettingsPage';
import { DataSettingsPage } from './settings-pages/DataSettingsPage';
import { GeneralSettingsPage } from './settings-pages/GeneralSettingsPage';
import { NotificationsSettingsPage } from './settings-pages/NotificationsSettingsPage';
import { TasksSettingsPage } from './settings-pages/TasksSettingsPage';
import { AppearanceSettingsPage } from './settings-pages/appearance-settings-page/AppearanceSettingsPage';
import { hideMenu } from '/@/features/menu-state/menuSlice';
import { useAppDispatch, useAppStore } from '/@/hooks';
import { isMenuOpen } from '/@/scripts/utils/menuutils';

export default function SettingsMenu() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<SettingsPage>(SettingsPage.General);
  const store = useAppStore();

  useHotkeys(
    'esc',
    () => {
      const { menuState } = store.getState();
      if (isMenuOpen(menuState, Menu.BackupDataMenu) || isMenuOpen(menuState, Menu.RestoreDataMenu)) return;

      // If the user is currently focused on an open dropdown, don't close the menu.
      if (
        document.activeElement?.classList.contains('select-box') &&
        (document.activeElement?.children.length ?? 0) > 1
      )
        return;

      dispatch(hideMenu({ menu: Menu.SettingsMenu, fromEscKeypress: true }));
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
    },
  );

  return (
    <FullScreenMenu id="settingsMenu">
      <div id="settingsHeaderWrapper">
        <h2 id="settingsMenuHeader">Settings</h2>
        <CloseMenuButton id="settingsMenuCloseButton" onClick={() => dispatch(hideMenu({ menu: Menu.SettingsMenu }))} />
      </div>
      <hr className="menu-header-divider" />
      <div id="settingsWrapper">
        <SettingsSidebar page={page} setPage={setPage} />
        <div id="settings">{getSettingsPage(page)}</div>
      </div>
    </FullScreenMenu>
  );
}

function getSettingsPage(page: SettingsPage) {
  switch (page) {
    case SettingsPage.General:
      return <GeneralSettingsPage />;
    case SettingsPage.Appearance:
      return <AppearanceSettingsPage />;
    case SettingsPage.Tasks:
      return <TasksSettingsPage />;
    case SettingsPage.Notifications:
      return <NotificationsSettingsPage />;
    case SettingsPage.Data:
      return <DataSettingsPage />;
    case SettingsPage.Advanced:
      return <AdvancedSettingsPage />;
    default:
      throw new Error(`Invalid settings page: ${page}`);
  }
}
