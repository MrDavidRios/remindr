export enum Menu {
  TimeframeMenu,
  AccountMenu,
  AccountDeleteMenu,
  EmailResetMenu,
  SettingsMenu,
  TaskEditMenu,
  TaskCreateMenu,
  ScheduledReminderEditMenu,
  TaskListViewSettingsMenu,
  LinkMenu,
  BackupDataMenu,
  RestoreDataMenu,
  MessageModal,
  HamburgerMenu,
  UpdateNotification,
}

export interface MenuRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MenuState {
  openMenus: Menu[];
  dialogInfo: DialogState;
  scheduledReminderEditorPosition: FloatingMenuPosition;
}

export interface DialogState extends DialogProps {
  result?: string;
}

export interface DialogProps {
  title?: string;
  message: string;
  options?: string[];
}

export interface FloatingMenuPosition {
  anchor?: MenuRect;
  yOffset: { topAnchored: number; bottomAnchored: number };
  gap: number;
}

export const primaryMenus = [Menu.AccountMenu, Menu.SettingsMenu];
export const fullscreenMenus = [
  Menu.AccountMenu,
  Menu.SettingsMenu,
  Menu.LinkMenu,
  Menu.BackupDataMenu,
  Menu.RestoreDataMenu,
  Menu.MessageModal,
];
export const floatingMenus = [Menu.HamburgerMenu, Menu.UpdateNotification, Menu.ScheduledReminderEditMenu];
