import angelRightIcon from '@assets/icons/angel-right.svg';
import { TaskCollection, User } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import { updateUserData, updateUserState } from '@renderer/features/user-state/userSlice';
import { useAppDispatch } from '@renderer/hooks';
import { signOut } from '@renderer/scripts/systems/authentication';
import showMessageBox from '@renderer/scripts/utils/messagebox';
import { setUserData } from '@renderer/scripts/utils/userData';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

export function IntroPage() {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Check if the input only contains letters
    if (/^[a-zA-Z]*$/.test(value)) {
      setName(value);
    }
  };

  return (
    <section id="login" className="frosted">
      <div id="introScreen">
        <button id="introScreenBackButton" onClick={() => signOut(dispatch)} type="button">
          <img src={angelRightIcon} className="svg-filter" draggable="false" alt="" />
          <p>Sign Out</p>
        </button>
        <h1 style={{ fontSize: '32px' }}>Let&apos;s get you set up.</h1>
        <div id="welcomeScreenUIContainer">
          <br />
          <div id="accountInfoFields">
            <p id="promptText">What would you like us to call you?</p>
            <input
              type="text"
              placeholder="Name"
              id="nameInput"
              className="large-input"
              onChange={handleChange}
              value={name}
            />
            <button
              type="button"
              id="introScreenContinueButton"
              className="gradient-button"
              onClick={() => continueButtonHandler(name, dispatch)}
            >
              Continue
            </button>
          </div>
          <br />
        </div>
      </div>
    </section>
  );
}

async function continueButtonHandler(name: string, dispatch: AppDispatch) {
  // Check if input is okay. If so, add input to userData. If not, then fire an alert.
  if (name.trim().length < 2) {
    showMessageBox('Name too short', 'Your inputted name cannot be less than two characters.', 'error');
    return;
  }

  // Initialize user with their proper values
  const user = new User();
  user.name = name.trim();
  user.lastLogin = new Date();
  user.email = window.firebase.auth.getEmail() ?? '';

  // Save user data to disk
  setUserData(user);

  // Save user data to firebase
  await window.data.saveUserData();
  await window.data.saveTaskData(JSON.stringify(new TaskCollection()));

  // Update global state
  dispatch(updateUserData({ user: JSON.parse(JSON.stringify(user)) }));
  dispatch(updateUserState({ authenticated: true, initialized: true }));
}
