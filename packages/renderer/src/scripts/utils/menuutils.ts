import { Menu, MenuRect, MenuState, floatingMenus, fullscreenMenus, primaryMenus } from '@remindr/shared';

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

export function isPrimaryMenuOpen(state: MenuState) {
  for (let i = 0; i < primaryMenus.length; i++) {
    if (state.openMenus.includes(primaryMenus[i])) return true;
  }

  return false;
}

export function isFullscreenMenuOpen(state: MenuState) {
  for (let i = 0; i < fullscreenMenus.length; i++) {
    if (state.openMenus.includes(fullscreenMenus[i])) return true;
  }

  return false;
}

export function isFloatingMenuOpen(state: MenuState) {
  for (let i = 0; i < floatingMenus.length; i++) {
    if (state.openMenus.includes(floatingMenus[i])) return true;
  }

  return false;
}

export const isPrimaryMenu = (menu: Menu) => primaryMenus.includes(menu);

export const convertDOMRectToMenuRect = (rect?: DOMRect): MenuRect | undefined => {
  if (!rect) return undefined;

  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
};
