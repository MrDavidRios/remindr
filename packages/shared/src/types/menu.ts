import { Task } from './classes/index.js';
import { MenuDropdownMap } from './index.js';

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
  AddExistingReminderMenu,
  /** Used in cases where a `Menu` type needs to be specified but no `Menu` values qualify. */
  None,
}

export enum MenuType {
  Modal,
  Floating,
  Secondary,
  Primary,
}

export interface MenuPosition {
  x: number;
  y: number;
}

export interface MenuRect extends MenuPosition {
  width: number;
  height: number;
}

export interface MenuState {
  openMenus: Menu[];
  openContextMenus: ContextMenuType[];
  contextMenuPositions: Record<ContextMenuType, MenuPosition>;
  contextMenuTask?: Task;
  openDropdowns: MenuDropdownMap;
  dialogInfo: DialogState;
  scheduledReminderEditorPosition: FloatingMenuPosition;
  addExistingReminderMenuPosition: FloatingMenuPosition;
}

export enum ContextMenuType {
  TaskContextMenu = 'taskContextMenu',
  GeneralContextMenu = 'generalContextMenu',
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
