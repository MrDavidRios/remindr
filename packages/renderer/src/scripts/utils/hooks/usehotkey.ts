import { Menu, MENU_TYPES } from '@remindr/shared';
import store from '@renderer/app/store';
import { useEffect } from 'react';
import { isMenuOpen } from '../menuutils';

const keyAbbreviations = new Map([
  ['escape', 'esc'],
  [',', 'comma'],
]);

function compareKeyCodeToEvent(keyCode: string, e: KeyboardEvent): boolean {
  const keywords = keyCode.split('+');
  const eventKey = keyAbbreviations.get(e.key.toLowerCase()) ?? e.key.toLowerCase();

  let hasShift = false;
  let hasMod = false;
  let key = '';

  if (keywords.length === 0) {
    throw new Error(`parseKeyCode: No arguments in key code; key code: ${keyCode}`);
  }

  if (keywords.length > 3) {
    throw new Error(`parseKeyCode: Too many arguments in key code, expected a maximum of three; key code: ${keyCode}`);
  }

  for (const keyword of keywords) {
    if (keyword === 'shift') {
      hasShift = true;
    } else if (keyword === 'mod') {
      hasMod = true;
    } else {
      key = keyword;
    }
  }

  if (key === '') {
    throw new Error(`parseKeyCode: No key provided; key code: ${keyCode}`);
  }

  if (hasShift != e.shiftKey) return false;

  const modKeyPressed = window.electron.process.isMac() ? e.metaKey : e.ctrlKey;

  if (hasMod != modKeyPressed) return false;

  return key === eventKey;
}

const hotkeyMenuMap: Map<string, Set<Menu>> = new Map();
const addKeyCodesToMap = (keycodes: string[], menu: Menu) => {
  for (const keyCode of keycodes) {
    const menus = hotkeyMenuMap.get(keyCode) ?? new Set();
    menus.add(menu);
    hotkeyMenuMap.set(keyCode, menus);
  }
};

const menuWithHigherPriorityOpen = (menu: Menu, targetMenus: Menu[]): boolean => {
  if (targetMenus.length === 0) return false;

  const menuType = MENU_TYPES.get(menu) ?? Infinity;

  for (const targetMenu of targetMenus) {
    const targetMenuType = MENU_TYPES.get(targetMenu) ?? Infinity;
    if (targetMenuType < menuType && isMenuOpen(store.getState().menuState, targetMenu)) return true;
  }

  return false;
};

/**
 *
 * @param keycodes
 * @param callback can return boolean or void -- this allows us to allow the hotkey event to propagate if the callback
 * returns false. Otherwise, the event will never propagate.
 * @param menu the menu that the hotkey is associated with. This will be used to determine hotkey priority
 */
export function useHotkey(
  keycodes: string[],
  callback: (e: KeyboardEvent) => boolean | void,
  menu: Menu,
  options?: { prioritize: boolean },
): void {
  const handler = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return;

    for (const keycode of keycodes) {
      if (compareKeyCodeToEvent(keycode, e)) {
        const menusWithKeycode = Array.from<Menu>(hotkeyMenuMap.get(keycode) ?? new Set());
        const higherPriorityOpen = menuWithHigherPriorityOpen(menu, menusWithKeycode);

        if (higherPriorityOpen && !options?.prioritize) {
          continue;
        }

        const callbackComplete = callback(e);
        if (callbackComplete) {
          e.preventDefault();
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handler);

    addKeyCodesToMap(keycodes, menu);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
}
