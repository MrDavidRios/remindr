import { Menu } from '@remindr/shared';
import store from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { updateEmail } from '@renderer/features/user-state/userSlice';
import { useAppDispatch } from '@renderer/hooks';
import { resetEmail, signOut } from '@renderer/scripts/systems/authentication';
import { showMessageBox } from '@renderer/scripts/utils/messagebox';
import type { FC } from 'react';
import { useState } from 'react';
import isEmail from 'validator/lib/isEmail';
import { CloseMenuButton } from '../../close-menu-button/CloseMenuButton';
import { FullScreenMenu } from '../fullscreen-menu/FullScreenMenu';

export const EmailResetMenu: FC = () => {
  const dispatch = useAppDispatch();

  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  function resetDialog() {
    setCurrentEmail('');
    setNewEmail('');
    setPassword('');

    setShowLoadingScreen(false);
  }

  async function showEmailResetDialog() {
    if (currentEmail !== store.getState().userState.user?.email) {
      showMessageBox(
        'Error: Invalid current email',
        'Invalid current email entered: please make sure that you spelled your current email correctly.',
        'error',
        [],
      );
      return;
    }

    if (!isEmail(newEmail)) {
      showMessageBox(
        'Error: Invalid new email',
        'Invalid new email entered: please make sure that you spelled your new email correctly.',
        'error',
        [],
      );
      return;
    }

    if (newEmail === currentEmail) {
      showMessageBox(
        'Duplicate email',
        `You are already using the email ${newEmail} for your account: there is no need to change.`,
        'error',
        [],
      );
      return;
    }

    const { response } = await showMessageBox(
      'Email Reset Confirmation',
      'Are you sure you want to reset your email?',
      'info',
      ['Cancel', 'Reset Email'],
    );

    setShowLoadingScreen(true);

    if (response === 1) {
      const error = await resetEmail(currentEmail, password, newEmail);

      if (error) {
        showMessageBox('Error: Reset Email', `Error resetting email: ${error}`, 'error', []);

        resetDialog();
        return;
      }

      // Update user data email
      dispatch(updateEmail({ email: newEmail }));

      await showMessageBox(
        'Email Reset!',
        `Your account email is now ${newEmail}. Be sure to verify your new email!`,
        'info',
        [],
      );

      resetDialog();
      dispatch(hideMenu({ menu: Menu.AccountMenu }));
      signOut(dispatch);
      return;
    }

    showMessageBox(
      'Invalid email',
      'Invalid email entered: please make sure that you spelled your new email correctly.',
      'error',
      [],
    );

    resetDialog();
  }

  return (
    <FullScreenMenu menuType={Menu.EmailResetMenu} modal className="account-panel">
      <div id="accountPasswordResetMenuHeader">
        <h3 className="account-panel-header">Reset Email</h3>
        <CloseMenuButton id="emailResetMenuCloseButton" />
      </div>
      <input
        type="text"
        placeholder="Current Email"
        id="oldEmailInput"
        className="account-panel-input"
        value={currentEmail}
        onChange={(e) => setCurrentEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        id="currentPasswordInput"
        className="account-panel-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <input
        type="text"
        placeholder="New Email"
        id="newEmailInput"
        className="account-panel-input"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />
      <br />
      <br />
      <button type="button" className="action-button" onClick={showEmailResetDialog}>
        Change Email
      </button>
      {showLoadingScreen && (
        <div id="emailResetLoadingScreenContainer" className="full-window-container">
          <div className="backdrop low-opacity" />
          <div id="emailResetLoadingScreen">
            <h3>Resetting email...</h3>
          </div>
        </div>
      )}
    </FullScreenMenu>
  );
};
