import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ContextMenuType,
  DEPENDENT_MENUS,
  DialogProps,
  FloatingMenuPosition,
  Menu,
  MENU_TYPES,
  MenuState,
  MenuType,
  StreamTask,
  Task,
} from "@remindr/shared";
import { isModalOpen, isPrimaryMenu } from "@renderer/scripts/utils/menuutils";
import _ from "lodash";

export const initialMenuState: MenuState = {
  openMenus: [],
  openContextMenus: [],
  contextMenuPositions: {
    [ContextMenuType.TaskContextMenu]: { x: 0, y: 0 },
    [ContextMenuType.TaskGroupContextMenu]: { x: 0, y: 0 },
    [ContextMenuType.StreamTaskContextMenu]: { x: 0, y: 0 },
  },
  openDropdowns: {},
  dialogInfo: { title: undefined, message: "", options: [], result: undefined },
  scheduledReminderEditorPosition: {
    anchor: undefined,
    yOffset: { bottomAnchored: 0, topAnchored: 0 },
    gap: 0,
  },
  addExistingReminderMenuPosition: {
    anchor: undefined,
    yOffset: { bottomAnchored: 0, topAnchored: 0 },
    gap: 0,
  },
};

export const menuStateSlice = createSlice({
  name: "menuState",
  initialState: initialMenuState,
  reducers: {
    showMenu: (state, action: PayloadAction<Menu>) => {
      const menu = action.payload;

      // If the menu is lower priority than a modal, and there is an open modal, don't open it
      const menuType = MENU_TYPES.get(menu) ?? MenuType.None;

      // TaskCreateMenu is a special case given that the unsaved task dialog modal logic conflicts with this check
      // (we strictly want to keep the task creation menu open while the unsaved task dialog modal is open)
      if (
        menu !== Menu.TaskCreateMenu &&
        menuType > MenuType.Modal &&
        isModalOpen(state)
      )
        return;

      if (state.openMenus.includes(menu)) return;

      if (isPrimaryMenu(menu)) {
        state.openMenus = closePrimaryMenus(state.openMenus);
      }

      state.openMenus.push(menu);
    },
    /**
     *
     * @param state
     * @param action checkForUnsavedWork is listened to by unsavedTaskDialogMiddleware
     */
    hideMenu: (
      state,
      action: PayloadAction<{
        menu: Menu;
        checkForUnsavedWork?: boolean;
        fromEscKeypress?: boolean;
      }>
    ) => {
      // Close all menus dependent on the menu that will be closed
      state.openMenus = closeDependents(action.payload.menu, state.openMenus);

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
      action: PayloadAction<{
        contextMenu: ContextMenuType;
        task?: Task;
        streamTask?: StreamTask;
        x: number;
        y: number;
      }>
    ) => {
      if (state.openContextMenus.includes(action.payload.contextMenu)) return;

      if (action.payload.task && action.payload.streamTask) {
        throw new Error(
          "Cannot show both a task and stream task context menu at the same time"
        );
      }

      state.contextMenuTask = action.payload.task;
      state.contextMenuStreamTask = action.payload.streamTask;

      state.contextMenuPositions[action.payload.contextMenu] = {
        x: action.payload.x,
        y: action.payload.y,
      };
      state.openContextMenus.push(action.payload.contextMenu);
    },
    hideContextMenu: (state, action: PayloadAction<ContextMenuType>) => {
      // Clear context menu task when closing a context menu
      if (state.contextMenuTask !== undefined)
        state.contextMenuTask = undefined;

      _.remove(state.openContextMenus, (menu) => menu === action.payload);
    },
    showDialog: (state, action: PayloadAction<DialogProps>) => {
      state.openMenus.push(Menu.MessageModal);
      state.dialogInfo = action.payload;
    },
    setDialogResult: (state, action: PayloadAction<string>) => {
      state.dialogInfo.result = action.payload;
    },
    setFloatingMenuPosition: (
      state,
      action: PayloadAction<{ menu: Menu; positionInfo: FloatingMenuPosition }>
    ) => {
      if (action.payload.menu === Menu.ScheduledReminderEditMenu)
        state.scheduledReminderEditorPosition = action.payload.positionInfo;

      if (action.payload.menu === Menu.AddExistingReminderMenu)
        state.addExistingReminderMenuPosition = action.payload.positionInfo;
    },
    openDropdown: (
      state,
      action: PayloadAction<{ menu: Menu; dropdownName: string }>
    ) => {
      const openDropdownsInMenu =
        state.openDropdowns[action.payload.menu] ?? [];

      if (openDropdownsInMenu.includes(action.payload.dropdownName)) return;
      openDropdownsInMenu.push(action.payload.dropdownName);

      state.openDropdowns[action.payload.menu] = openDropdownsInMenu;
    },
    closeDropdown: (
      state,
      action: PayloadAction<{ menu: Menu; dropdownName: string }>
    ) => {
      const updatedDropdownState =
        state.openDropdowns[action.payload.menu] ?? [];
      _.remove(
        updatedDropdownState,
        (dropdown) => dropdown === action.payload.dropdownName
      );

      state.openDropdowns[action.payload.menu] = updatedDropdownState;
    },
  },
});

const closePrimaryMenus = (openMenus: Menu[]): Menu[] => {
  let updatedOpenMenus = [...openMenus];

  for (const menu of openMenus) {
    if (!isPrimaryMenu(menu)) continue;

    updatedOpenMenus = closeDependents(menu, updatedOpenMenus);
    _.remove(updatedOpenMenus, (openMenu) => isPrimaryMenu(openMenu));
  }

  return updatedOpenMenus;
};

const closeDependents = (menu: Menu, openMenus: Menu[]): Menu[] => {
  const dependentMenus = DEPENDENT_MENUS.get(menu) ?? [];

  for (const dependentMenu of dependentMenus) {
    _.remove(openMenus, (openMenu) => openMenu === dependentMenu);
  }

  return openMenus;
};

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
