import { AppMode, Menu } from '@remindr/shared';
import { AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { AppDispatch } from './app/store';
import { AccountMenu } from './components/menus/account-menu/AccountMenu';
import { LinkMenu } from './components/menus/link-menu/LinkMenu';
import { ScheduledReminderEditMenu } from './components/menus/scheduled-reminder-menus/scheduled-reminder-edit-menu/ScheduledReminderEditMenu';
import SettingsMenu from './components/menus/settings-menu/SettingsMenu';
import { BackupDataMenu } from './components/menus/settings-menu/backup-menus/BackupDataMenu';
import { RestoreDataMenu } from './components/menus/settings-menu/backup-menus/RestoreDataMenu';
import { MessageModal } from './components/message-modal/MessageModal';
import { TaskViewSettingsDropdown } from './components/task-management-page/task-list-display/TaskViewSettingsDropdown';
import { TimeframeSelectMenu } from './components/toolbar/TimeframeSelectMenu';
import { UpdateNotification } from './components/update-notification/UpdateNotification';
import { showMenu } from './features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from './hooks';
import { isMenuOpen } from './scripts/utils/menuutils';

export const DisplayMenus = () => {
  const dispatch = useAppDispatch();

  const menuState = useAppSelector((state) => state.menuState);
  const appMode = useAppSelector((state) => state.appMode.value);
  const authenticated = useAppSelector((state) => state.userState.authenticated);

  useMenuHotkeys(dispatch, appMode, authenticated);

  return (
    <>
      <AnimatePresence>
        {isMenuOpen(menuState, Menu.ScheduledReminderEditMenu) && <ScheduledReminderEditMenu />}
      </AnimatePresence>
      <AnimatePresence>
        {isMenuOpen(menuState, Menu.TaskListViewSettingsMenu) && <TaskViewSettingsDropdown />}
      </AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.LinkMenu) && <LinkMenu />}</AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.TimeframeMenu) && <TimeframeSelectMenu />}</AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.SettingsMenu) && <SettingsMenu />}</AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.BackupDataMenu) && <BackupDataMenu />}</AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.RestoreDataMenu) && <RestoreDataMenu />}</AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.AccountMenu) && <AccountMenu />}</AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.MessageModal) && <MessageModal />}</AnimatePresence>
      <AnimatePresence>{isMenuOpen(menuState, Menu.UpdateNotification) && <UpdateNotification />}</AnimatePresence>
    </>
  );
};

function useMenuHotkeys(dispatch: AppDispatch, appMode: AppMode, authenticated: boolean) {
  const onLoginScreen = appMode === AppMode.LoginScreen || (appMode === AppMode.Online && !authenticated);

  // mod corresponds to the command key on Mac and the control key on Windows and Linux.
  useHotkeys('mod+a', () => {
    if (onLoginScreen || !authenticated) return;

    dispatch(showMenu(Menu.AccountMenu));
  });
  useHotkeys(
    'mod+comma',
    () => {
      if (onLoginScreen) return;

      dispatch(showMenu(Menu.SettingsMenu));
    },
    {
      enableOnFormTags: true,
    },
  );
}
