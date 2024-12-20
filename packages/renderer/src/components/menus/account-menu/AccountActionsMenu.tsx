import { Menu } from '@remindr/shared';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { showResetPasswordPrompt } from '@renderer/scripts/systems/authentication';
import type { Dispatch, FC, SetStateAction } from 'react';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';

interface AccountActionsMenuProps {
  setShowAccountActionsMenu: Dispatch<SetStateAction<boolean>>;
  setShowEmailResetMenu: Dispatch<SetStateAction<boolean>>;
  setShowAccountDeleteMenu: Dispatch<SetStateAction<boolean>>;
}

export const AccountActionsMenu: FC<AccountActionsMenuProps> = ({
  setShowAccountActionsMenu,
  setShowEmailResetMenu,
  setShowAccountDeleteMenu,
}) => {
  const dispatch = useAppDispatch();

  const email = useAppSelector((state) => state.userState.user?.email);

  function handleSignOutButtonClick() {
    dispatch(hideMenu({ menu: Menu.AccountMenu }));
    window.electron.ipcRenderer.sendMessage('action-on-save', 'sign-out');
  }

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
            setShowAccountActionsMenu(false);
          }}
        >
          Reset Password
        </li>
      )}
      <li
        id="resetEmailMenuButton"
        className="account-action-choice"
        onClick={() => {
          setShowEmailResetMenu(true);
          setShowAccountActionsMenu(false);
        }}
      >
        Reset Email
      </li>
      <li
        id="deleteAccountMenuButton"
        className="account-action-choice menu-top-border"
        onClick={() => {
          setShowAccountDeleteMenu(true);
          setShowAccountActionsMenu(false);
        }}
      >
        Delete Account
      </li>
    </DropdownMenu>
  );
};
