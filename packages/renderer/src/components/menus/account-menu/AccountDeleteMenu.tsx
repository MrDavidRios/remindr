import { Menu } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import store from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { resetUserState } from '@renderer/features/user-state/userSlice';
import { useAppDispatch } from '@renderer/hooks';
import { deleteAccount, reauthenticateUser } from '@renderer/scripts/systems/authentication';
import showMessageBox from '@renderer/scripts/utils/messagebox';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import CloseMenuButton from '../../close-menu-button/CloseMenuButton';
import { FullScreenMenu } from '../fullscreen-menu/FullScreenMenu';

interface AccountDeleteMenuProps {
  setShowAccountDeleteMenu: Dispatch<SetStateAction<boolean>>;
}

export const AccountDeleteMenu: FC<AccountDeleteMenuProps> = ({ setShowAccountDeleteMenu }) => {
  const dispatch = useAppDispatch();
  useHotkeys('esc', () => setShowAccountDeleteMenu(false));

  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleAccountDeleteButtonClick() {
    const emailValue = email.trim();
    const passwordValue = password.trim();

    if (emailValue === store.getState().userState.user?.email) {
      await showDeleteAccountPrompt(emailValue, passwordValue, setShowAccountDeleteMenu, dispatch);
    } else {
      await showMessageBox(
        'Login Error - Invalid Email',
        'Your inputted email does not match your account email; please try again.',
        'error',
        [],
      );
    }
  }

  return (
    <FullScreenMenu className="account-panel">
      <div id="accountPasswordResetMenuHeader">
        <h3 className="account-panel-header">Delete Account</h3>
        <CloseMenuButton
          id="accountDeletionAuthenticationWindowCloseButton"
          onClick={() => setShowAccountDeleteMenu(false)}
        />
      </div>
      <input
        type="text"
        placeholder="Email"
        id="accountDeletionAuthEmailInput"
        className="account-panel-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        id="accountDeletionAuthPasswordInput"
        className="account-panel-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <button
        type="button"
        className="action-button"
        onClick={async () => {
          setShowLoadingScreen(true);
          await handleAccountDeleteButtonClick();
          setShowLoadingScreen(false);

          setEmail('');
          setPassword('');
        }}
      >
        Delete Account
      </button>
      {showLoadingScreen && (
        <div id="accountDeletedLoadingScreenContainer" className="full-window-container">
          <div className="backdrop low-opacity" />
          <div id="accountDeletedLoadingScreen">
            <h3>Deleting account...</h3>
          </div>
        </div>
      )}
    </FullScreenMenu>
  );
};

async function showDeleteAccountPrompt(
  emailValue: string,
  passwordValue: string,
  setShowAccountDeleteMenu: Dispatch<SetStateAction<boolean>>,
  dispatch: AppDispatch,
) {
  try {
    const error = await reauthenticateUser(emailValue, passwordValue);

    if (error) {
      showMessageBox('Error: Account Deletion', `Error deleting account: ${error}`, 'error', []);

      return;
    }

    const { response } = await showMessageBox(
      'Account Deletion Confirmation',
      "Are you sure you want to delete your account? It is irreversible and you won't be able to recover any of your data.",
      'info',
      ['Cancel', 'Delete Account'],
    );

    if (response === 1) {
      // Success
      await deleteAccount();

      showMessageBox('Account Deleted', 'Your account has been deleted.', 'info', []);

      setShowAccountDeleteMenu(false);
      dispatch(hideMenu({ menu: Menu.AccountMenu }));
      dispatch(resetUserState());
    }
  } catch (err) {
    await showMessageBox('Login Error', `${err}`, 'error', []);
  }
}
