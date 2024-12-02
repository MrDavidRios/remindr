import { Menu, MENU_TYPES } from '@remindr/shared';
import store, { AppDispatch } from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { useEffect } from 'react';
import { isMenuOpen } from '../menuutils';

/**
 * @param dispatch
 * @param menu the menu we are closing with 'esc' keypress. If being used from a dropdown, this is its parent menu.
 * @param isDropdown
 */
export function useEscToClose(dispatch: AppDispatch, menu: Menu) {
  const onEsc = () => {
    let highestPriority = Infinity;

    const openMenus = store.getState().menuState.openMenus;

    console.log('(useEscToClose) attempting to close menu: ', Menu[menu]);
    console.log(
      'open menus:',
      openMenus.map((openMenu) => Menu[openMenu]),
    );

    openMenus.forEach((openMenu) => {
      const menuType = MENU_TYPES.get(openMenu);

      console.log('open menu: ', Menu[openMenu], ', menu type: ', menuType);

      if (menuType !== undefined) highestPriority = Math.min(menuType, highestPriority);
    });

    console.log('highest priority: ', highestPriority, '; menu: ', Menu[menu], menu, '\n===');

    const menuPriority = MENU_TYPES.get(menu) ?? Infinity;

    const menuDropdownState = store.getState().menuState.openDropdowns[menu] ?? [];
    const menuHasOpenDropdowns = menuDropdownState.length > 0;

    if (highestPriority >= menuPriority && !menuHasOpenDropdowns) {
      dispatch(hideMenu({ menu, fromEscKeypress: true }));
    }
  };

  const handler = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'escape') {
      if (e.defaultPrevented) return;

      if (isMenuOpen(store.getState().menuState, menu)) {
        e.preventDefault();
        onEsc();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
}
