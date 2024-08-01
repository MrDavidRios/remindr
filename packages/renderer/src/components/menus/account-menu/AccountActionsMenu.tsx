import { Menu } from '@remindr/shared';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { hideMenu } from '/@/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '/@/hooks';
import { showResetPasswordPrompt } from '/@/scripts/systems/authentication';

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

  useHotkeys('esc', () => setShowAccountActionsMenu(false));

  function handleSignOutButtonClick() {
    dispatch(hideMenu({ menu: Menu.AccountMenu }));
    window.electron.ipcRenderer.sendMessage('action-on-save', 'sign-out');
  }

  return (
    <DropdownMenu
      id="accountActionsMenu"
      onClickOutside={() => setShowAccountActionsMenu(false)}
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
