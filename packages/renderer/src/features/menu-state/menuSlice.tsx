import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ContextMenuType, DialogProps, FloatingMenuPosition, Menu, MenuState, Task } from '@remindr/shared';
import { isPrimaryMenu } from '@renderer/scripts/utils/menuutils';
import _ from 'lodash';

export const initialMenuState: MenuState = {
  openMenus: [],
  openContextMenus: [],
  contextMenuPositions: {
    [ContextMenuType.TaskContextMenu]: { x: 0, y: 0 },
    [ContextMenuType.GeneralContextMenu]: { x: 0, y: 0 },
  },
  openDropdowns: {},
  dialogInfo: { title: undefined, message: '', options: [], result: undefined },
  scheduledReminderEditorPosition: { anchor: undefined, yOffset: { bottomAnchored: 0, topAnchored: 0 }, gap: 0 },
  addExistingReminderMenuPosition: { anchor: undefined, yOffset: { bottomAnchored: 0, topAnchored: 0 }, gap: 0 },
};

export const menuStateSlice = createSlice({
  name: 'menuState',
  initialState: initialMenuState,
  reducers: {
    showMenu: (state, action: PayloadAction<Menu>) => {
      const menu = action.payload;

      if (state.openMenus.includes(menu)) return;

      if (isPrimaryMenu(menu)) state.openMenus = state.openMenus.filter((openMenu) => !isPrimaryMenu(openMenu));

      state.openMenus.push(menu);
    },
    hideMenu: (state, action: PayloadAction<{ menu: Menu; fromEscKeypress?: boolean }>) => {
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

      if (action.payload.menu === Menu.AddExistingReminderMenu)
        state.addExistingReminderMenuPosition = action.payload.positionInfo;
    },
    openDropdown: (state, action: PayloadAction<{ menu: Menu; dropdownName: string }>) => {
      const openDropdownsInMenu = state.openDropdowns[action.payload.menu] ?? [];

      if (openDropdownsInMenu.includes(action.payload.dropdownName)) return;
      openDropdownsInMenu.push(action.payload.dropdownName);

      state.openDropdowns[action.payload.menu] = openDropdownsInMenu;
    },
    closeDropdown: (state, action: PayloadAction<{ menu: Menu; dropdownName: string }>) => {
      const updatedDropdownState = state.openDropdowns[action.payload.menu] ?? [];
      _.remove(updatedDropdownState, (dropdown) => dropdown === action.payload.dropdownName);

      state.openDropdowns[action.payload.menu] = updatedDropdownState;
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
  openDropdown,
  closeDropdown,
} = menuStateSlice.actions;
