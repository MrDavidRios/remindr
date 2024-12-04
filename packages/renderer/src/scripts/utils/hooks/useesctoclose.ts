import { Menu } from '@remindr/shared';
import store, { AppDispatch } from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { isMenuOpen } from '../menuutils';
import { useHotkey } from './usehotkey';

export function useEscToClose(dispatch: AppDispatch, menu: Menu): void {
  useHotkey(
    ['esc'],
    () => {
      const menuDropdownState = store.getState().menuState.openDropdowns[menu] ?? [];
      const menuHasOpenDropdowns = menuDropdownState.length > 0;

      if (menuHasOpenDropdowns) return false;
      if (!isMenuOpen(store.getState().menuState, menu)) return false;

      dispatch(hideMenu({ menu, fromEscKeypress: true }));

      return true;
    },
    menu,
  );
}
