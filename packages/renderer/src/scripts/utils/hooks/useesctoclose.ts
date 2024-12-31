import { Menu } from '@remindr/shared';
import store, { AppDispatch } from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { isMenuOpen } from '../menuutils';
import { useHotkey } from './usehotkey';

export function useEscToClose(
  dispatch: AppDispatch,
  menu: Menu,
  hideMenuOptions?: { checkForUnsavedWork: boolean },
): void {
  useHotkey(
    ['esc'],
    () => {
      const menuDropdownState = store.getState().menuState.openDropdowns[menu] ?? [];
      const menuHasOpenDropdowns = menuDropdownState.length > 0;

      console.log('useEscToClose', menu, Menu[menu], menuHasOpenDropdowns);

      if (menuHasOpenDropdowns) return false;
      if (!isMenuOpen(store.getState().menuState, menu)) return false;

      dispatch(hideMenu({ menu, fromEscKeypress: true, checkForUnsavedWork: hideMenuOptions?.checkForUnsavedWork }));

      return true;
    },
    menu,
  );
}
