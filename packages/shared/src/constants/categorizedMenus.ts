import { Menu, MenuType } from '../types/index.js';

/**
 * Menu Priority (top to bottom):
 * 1. Modal
 * 2. Floating
 * 3. Primary
 * 4. Secondary
 *
 * Dropdown menus will be assigned to a parent menu to know whether to close menu or dropdown on esc keypress
 */

export const MENU_TYPES = new Map<Menu, MenuType>([
  [Menu.AccountMenu, MenuType.Primary],
  [Menu.AccountDeleteMenu, MenuType.Secondary],
  [Menu.EmailResetMenu, MenuType.Secondary],
  [Menu.LinkMenu, MenuType.Secondary],

  [Menu.SettingsMenu, MenuType.Primary],
  [Menu.BackupDataMenu, MenuType.Secondary],
  [Menu.RestoreDataMenu, MenuType.Secondary],

  [Menu.TaskCreateMenu, MenuType.Primary],
  [Menu.TaskEditMenu, MenuType.Primary],
  [Menu.ScheduledReminderEditMenu, MenuType.Secondary],

  [Menu.TaskListViewSettingsMenu, MenuType.Floating],
  [Menu.AddExistingReminderMenu, MenuType.Floating],

  [Menu.MessageModal, MenuType.Modal],

  [Menu.TimeframeMenu, MenuType.Floating],
  [Menu.HamburgerMenu, MenuType.Floating],
  [Menu.AddExistingReminderMenu, MenuType.Floating],
  [Menu.UpdateNotification, MenuType.Floating],
]);
