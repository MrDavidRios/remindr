import { Menu } from '@remindr/shared';
import { closeDropdown, hideMenu, showMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { showResetPasswordPrompt } from '@renderer/scripts/systems/authentication';
import type { Dispatch, FC, SetStateAction } from 'react';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';

interface AccountActionsMenuProps {
  setShowAccountActionsMenu: Dispatch<SetStateAction<boolean>>;
}

export const AccountActionsMenu: FC<AccountActionsMenuProps> = ({ setShowAccountActionsMenu }) => {
  const dispatch = useAppDispatch();

  const email = useAppSelector((state) => state.userState.user?.email);

  function handleSignOutButtonClick() {
    dispatch(hideMenu({ menu: Menu.AccountMenu }));
    window.electron.ipcRenderer.sendMessage('action-on-save', 'sign-out');
  }

  const closeFromOutsideDropdown = () => {
    dispatch(closeDropdown({ menu: Menu.AccountMenu, dropdownName: 'accountActionsMenu' }));
    setShowAccountActionsMenu(false);
  };

  return (
    <DropdownMenu
      parentMenu={Menu.AccountMenu}
      id="accountActionsMenu"
      onClose={() => setShowAccountActionsMenu(false)}
      clickOutsideExceptions={['#accountMenuSettingsButton']}
      ignoreGlobalClickOutsideExceptions
    >
      <div id="signOutButton" className="account-action-choice menu-bottom-border" onClick={handleSignOutButtonClick}>
        Sign Out
      </div>
      {email !== undefined && (
        <li
          id="resetPasswordMenuButton"
          className="account-action-choice"
          onClick={() => {
            showResetPasswordPrompt(email);
            closeFromOutsideDropdown();
          }}
        >
          Reset Password
        </li>
      )}
      <li
        id="resetEmailMenuButton"
        className="account-action-choice"
        onClick={() => {
          dispatch(showMenu(Menu.EmailResetMenu));
          closeFromOutsideDropdown();
        }}
      >
        Reset Email
      </li>
      <li
        id="deleteAccountMenuButton"
        className="account-action-choice menu-top-border"
        onClick={() => {
          dispatch(showMenu(Menu.AccountDeleteMenu));
          closeFromOutsideDropdown();
        }}
      >
        Delete Account
      </li>
    </DropdownMenu>
  );
};
