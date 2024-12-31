import { ContextMenuType, MENU_TYPES, Menu, MenuRect, MenuState, MenuType } from '@remindr/shared';

/**
 * Carries out the given callback only if both the task creation and edit menus are closed.
 * @param callback
 */
export function doIfTaskMenusAreClosed(callback: () => void) {
  // Using state was unreliable for this specific case, as this function was sometimes called at the same time as the
  // state was being updated (e.g. a menu was simultaneously closed while this function was called).
  const taskMenuOpen = document.getElementById('taskEditWindow') || document.getElementById('taskCreationWindow');

  if (taskMenuOpen) return;
  callback();
}

export function isMenuOpen(state: MenuState, menu: Menu) {
  return state.openMenus.includes(menu);
}

export function isContextMenuOpen(state: MenuState, contextMenu: ContextMenuType) {
  return state.openContextMenus.includes(contextMenu);
}

export function isModalOpen(state: MenuState) {
  return state.openMenus.some((menu) => MENU_TYPES.get(menu) === MenuType.Modal);
}

export const isPrimaryMenu = (menu: Menu) => MENU_TYPES.get(menu) === MenuType.Primary;

export const convertDOMRectToMenuRect = (rect?: DOMRect): MenuRect | undefined => {
  if (!rect) return undefined;

  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
};
