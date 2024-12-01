import { Menu } from '@remindr/shared';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useState } from 'react';
import { CloseMenuButton } from '../../close-menu-button/CloseMenuButton';
import { FullScreenMenu } from '../fullscreen-menu/FullScreenMenu';
import { SettingsPage, SettingsSidebar } from './SettingsSidebar';
import { AdvancedSettingsPage } from './settings-pages/AdvancedSettingsPage';
import { DataSettingsPage } from './settings-pages/DataSettingsPage';
import { GeneralSettingsPage } from './settings-pages/GeneralSettingsPage';
import { NotificationsSettingsPage } from './settings-pages/NotificationsSettingsPage';
import { TasksSettingsPage } from './settings-pages/TasksSettingsPage';
import { AppearanceSettingsPage } from './settings-pages/appearance-settings-page/AppearanceSettingsPage';

export const SettingsMenu = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<SettingsPage>(SettingsPage.General);

  console.log('we live on');

  return (
    <FullScreenMenu
      menuType={Menu.SettingsMenu}
      id="settingsMenu"
      onClose={() => dispatch(hideMenu({ menu: Menu.SettingsMenu }))}
    >
      <div id="settingsHeaderWrapper">
        <h2 id="settingsMenuHeader">Settings</h2>
        <CloseMenuButton id="settingsMenuCloseButton" />
      </div>
      <hr className="menu-header-divider" />
      <div id="settingsWrapper">
        <SettingsSidebar page={page} setPage={setPage} />
        <div id="settings">{getSettingsPage(page)}</div>
      </div>
    </FullScreenMenu>
  );
};

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
