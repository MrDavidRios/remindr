import type { AuthPageType } from '@remindr/shared';
import { AppMode } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import { setAppMode } from '@renderer/features/app-mode/appModeSlice';
import { useAppDispatch } from '@renderer/hooks';
import { showResetPasswordPrompt, signOut } from '@renderer/scripts/systems/authentication';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { AuthInput } from './AuthInput';

interface LoginPageProps {
  setPage: Dispatch<SetStateAction<AuthPageType>>;
}

export function LoginPage(props: LoginPageProps) {
  const { setPage } = props;

  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');

  return (
    <div id="loginPage">
      <h1 id="loginPageHeader">Sign In</h1>
      <AuthInput
        buttonText="Sign In"
        onComplete={(_email, _password) => attemptSignIn(dispatch, _email, _password)}
        onEmailChange={setEmail}
      />
      <button
        type="button"
        id="offlineBtnLogin"
        className="large-button"
        onClick={() => dispatch(setAppMode(AppMode.Offline))}
      >
        Go Offline
      </button>
      <div id="noAccountPrompt">
        <p>Don&apos;t have an account? </p>
        <button id="createAccountBtn" onClick={() => setPage('register')} type="button">
          Create Account
        </button>
      </div>
      <br />
      <button
        id="forgotPasswordButton"
        onClick={() => showResetPasswordPrompt(email)}
        title="Click here to reset your password."
        type="button"
      >
        Forgot Password?
      </button>
    </div>
  );
}

async function attemptSignIn(dispatch: AppDispatch, email: string, password: string): Promise<string | undefined> {
  if (window.firebase.auth.currentlySignedIn()) await window.firebase.auth.signOutUser();

  const signinResult = await window.firebase.auth.signInWithEmailAndPassword(email, password);

  // Automatically fires log in event that is caught by the auth listener. (onAuthStateChanged)
  if (typeof signinResult !== 'boolean') {
    if (window.firebase.auth.currentlySignedIn()) signOut(dispatch);

    return signinResult.message;
  }

  return undefined;
}
