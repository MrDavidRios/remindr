import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  ContextMenuType,
  DialogProps,
  FloatingMenuPosition,
  Menu,
  MenuState,
  Task,
  floatingMenus,
} from '@remindr/shared';
import { isPrimaryMenu } from '@renderer/scripts/utils/menuutils';
import _ from 'lodash';

export const initialMenuState: MenuState = {
  openMenus: [],
  openContextMenus: [],
  contextMenuPositions: {
    [ContextMenuType.TaskContextMenu]: { x: 0, y: 0 },
    [ContextMenuType.GeneralContextMenu]: { x: 0, y: 0 },
  },
  dialogInfo: { title: undefined, message: '', options: [], result: undefined },
  scheduledReminderEditorPosition: { anchor: undefined, yOffset: { bottomAnchored: 0, topAnchored: 0 }, gap: 0 },
};

export const menuStateSlice = createSlice({
  name: 'menuState',
  initialState: initialMenuState,
  reducers: {
    showMenu: (state, action: PayloadAction<Menu>) => {
      const menu = action.payload;

      if (state.openMenus.includes(menu)) return;

      // When opening a primary menu, close all other primary menus
      if (isPrimaryMenu(menu)) state.openMenus = state.openMenus.filter((openMenu) => !isPrimaryMenu(openMenu));

      state.openMenus.push(menu);
    },
    hideMenu: (
      state,
      action: PayloadAction<{ menu: Menu; checkForUnsavedWork?: boolean; fromEscKeypress?: boolean }>,
    ) => {
      // If message modal is open, it should close first. Return
      if (state.openMenus.includes(Menu.MessageModal) && action.payload.menu !== Menu.MessageModal) return;

      // If a floating menu is open, it should close first. Return
      const isFloatingMenu = floatingMenus.includes(action.payload.menu);

      // Fixes bug where fullscreen menus (account, settings, etc.) would not close with 'esc' keypress if the scheduled reminder editor was open
      const floatingMenuExceptions = [Menu.ScheduledReminderEditMenu];
      const filteredFloatingMenus = floatingMenus.filter((menu) => !floatingMenuExceptions.includes(menu));

      const floatingMenuOpen = state.openMenus.some((menu) => filteredFloatingMenus.includes(menu));
      if (action.payload.fromEscKeypress && floatingMenuOpen && !isFloatingMenu) return;

      // If the task creation or edit menus are being closed, close the scheduled reminder edit menu as well.
      if (action.payload.menu === Menu.TaskCreateMenu || action.payload.menu === Menu.TaskEditMenu) {
        _.remove(state.openMenus, (menu) => menu === Menu.ScheduledReminderEditMenu);
      }

      _.remove(state.openMenus, (menu) => menu === action.payload.menu);
    },
    toggleMenu: (state, action: PayloadAction<Menu>) => {
      if (state.openMenus.includes(action.payload)) {
        _.remove(state.openMenus, (menu) => menu === action.payload);
        return;
      }

      state.openMenus.push(action.payload);
    },
    showContextMenu: (
      state,
      action: PayloadAction<{ contextMenu: ContextMenuType; task?: Task; x: number; y: number }>,
    ) => {
      if (state.openContextMenus.includes(action.payload.contextMenu)) return;

      state.contextMenuTask = action.payload.task;
      state.contextMenuPositions[action.payload.contextMenu] = { x: action.payload.x, y: action.payload.y };
      state.openContextMenus.push(action.payload.contextMenu);
    },
    hideContextMenu: (state, action: PayloadAction<ContextMenuType>) => {
      // Clear context menu task when closing a context menu
      if (state.contextMenuTask !== undefined) state.contextMenuTask = undefined;

      _.remove(state.openContextMenus, (menu) => menu === action.payload);
    },
    showDialog: (state, action: PayloadAction<DialogProps>) => {
      state.openMenus.push(Menu.MessageModal);
      state.dialogInfo = action.payload;
    },
    setDialogResult: (state, action: PayloadAction<string>) => {
      state.dialogInfo.result = action.payload;
    },
    setFloatingMenuPosition: (state, action: PayloadAction<{ menu: Menu; positionInfo: FloatingMenuPosition }>) => {
      if (action.payload.menu === Menu.ScheduledReminderEditMenu)
        state.scheduledReminderEditorPosition = action.payload.positionInfo;
    },
  },
});

export default menuStateSlice.reducer;
export const {
  showMenu,
  hideMenu,
  toggleMenu,
  showContextMenu,
  hideContextMenu,
  showDialog,
  setDialogResult,
  setFloatingMenuPosition,
} = menuStateSlice.actions;
