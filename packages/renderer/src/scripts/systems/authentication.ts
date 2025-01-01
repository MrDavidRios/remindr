import { AppMode, ErrorCodes } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import { setAppMode } from '@renderer/features/app-mode/appModeSlice';
import { getUserData, updateEmailVerifiedState, updateUserState } from '@renderer/features/user-state/userSlice';
import isEmail from 'validator/lib/isEmail';
import { showMessageBox } from '../utils/messagebox';

// Auth hook (sets up auth-state-changed listener)
let authInitialized = false;
export const useAuth = (dispatch: AppDispatch, startupMode: AppMode) => {
  if (authInitialized) return;
  authInitialized = true;

  if (window.firebase.auth.authCredentialExists() && startupMode === AppMode.Online) {
    // Startup mode is online
    window.firebase.auth.updateUserFromStorage();
    console.log('User signed in from storage');
    initUserState(dispatch); // sometimes auth-state-changed isn't triggered fsr, so add this to ensure that auth state changes
  }

  if (window.firebase.auth.authCredentialExists() && startupMode === AppMode.LoginScreen) {
    // Sign user out
    signOut(dispatch);
  }

  window.electron.ipcRenderer.on('auth-state-changed', async () => {
    const signedIn = window.firebase.auth.currentlySignedIn();

    if (!signedIn) {
      if (!window.firebase.auth.authCredentialExists()) {
        console.log('No user signed in.');

        window.store.delete('last-uid');

        dispatch(updateUserState({ authenticated: false, initialized: false }));
      }
      return;
    }

    await initializeUser(dispatch);
  });
};

export async function initializeUser(dispatch: AppDispatch) {
  // User has logged in
  const successfulLogin = await logIn(dispatch);

  if (successfulLogin) {
    await initUserState(dispatch);
    return;
  }

  dispatch(updateUserState({ authenticated: false, initialized: false }));
}

async function initUserState(dispatch: AppDispatch) {
  // get user data! here is where we send the user to intro page by updating app state if there is no doc

  dispatch(setAppMode(AppMode.Online));

  console.trace('(initUserState): trying to get user data...');

  const dispatchInfo = await dispatch(getUserData());

  if (dispatchInfo.type.includes('fulfilled')) {
    // User data successfully loaded
    dispatch(updateUserState({ authenticated: true, initialized: true }));
    return;
  }

  if (dispatchInfo.type.includes('rejected')) {
    const errCode = (dispatchInfo as any).error.message.match(/ERR\d+/)?.[0];
    if (errCode === `ERR${ErrorCodes.MISSING_USER_DATA_FIRESTORE}`) {
      // User data doc doesn't exist. Go to intro page
      console.log('going to intro page');

      dispatch(updateUserState({ authenticated: true, initialized: false }));
    }
  }
}

// #region Login & Sign Out
async function logIn(dispatch: AppDispatch): Promise<boolean> {
  const hasNetworkConnection = await window.appState.hasNetworkConnection();
  if (!hasNetworkConnection) return false;

  const emailVerified = window.firebase.auth.emailVerified();
  const userEmail = window.firebase.auth.getEmail();

  if (!userEmail) {
    throw new Error('getEmail(): user not found');
  }

  if (typeof emailVerified === 'string') {
    throw new Error('emailVerified(): user not found');
  }

  dispatch(updateEmailVerifiedState({ emailVerified }));

  if (emailVerified) {
    // Fire logged-in event
    console.log(`%cLogged into ${userEmail}; email verified`, 'color: green; font-style: italic');
    window.electron.ipcRenderer.sendMessage('logged-in');
    return true;
  }

  // Verify email
  const { response } = await showMessageBox(
    `Verify Email: ${userEmail}`,
    'Almost there! Verify your e-mail to continue.',
    'info',
    ['Cancel', 'Send Email'],
  );

  if (response === 0) {
    // Cancel
    window.firebase.auth.deleteFirebaseUser();

    console.log('Email verification cancelled');

    return false;
  }

  // Send verification e-mail
  const emailVerificationResult = await window.firebase.auth.sendEmailVerification();

  if (typeof emailVerificationResult === 'string') {
    showMessageBox(`Email Verification Error: ${userEmail}`, emailVerificationResult, 'error');

    throw new Error(`Email Verification Error: ${userEmail}`);
  }

  await showMessageBox(
    'Verification Email Sent',
    `You're one step closer to getting reminders! Check your email (${userEmail}) and your spam folder (just in case) to verify your account.`,
  );

  await window.firebase.auth.signOutUser();

  return false;
}

export async function signOut(dispatch: AppDispatch) {
  if (!window.firebase.auth.currentlySignedIn()) {
    const dialogMessage = 'There are currently no users signed in on this client.';

    showMessageBox('Sign Out - Error', dialogMessage, 'error');
    return;
  }

  // Remove user object from disk
  await window.firebase.auth.deleteAuthCredential();

  try {
    await window.firebase.auth.signOutUser();

    console.log('Sign out successful!');

    // update signout state globally
    dispatch(updateUserState({ authenticated: false, initialized: false }));
  } catch (err) {
    throw new Error(err as string);
  }
}
// #endregion

// #region Account Reset Actions
export async function reauthenticateUser(email: string, password: string): Promise<string | void> {
  const reauthenticationResult = await window.firebase.auth.reauthenticateWithCredential(email, password);

  if (typeof reauthenticationResult === 'string') throw new Error(`Reauthentication Error: ${reauthenticationResult}`);
}

export async function resetEmail(
  oldEmail: string,
  password: string,
  newEmail: string,
): Promise<string | boolean | void> {
  // Update email
  try {
    const authResult = await window.firebase.auth.reauthenticateWithCredential(oldEmail, password);

    if (typeof authResult !== 'boolean') return parseAuthError(authResult as string);

    await window.firebase.auth.updateEmail(newEmail);
  } catch (err) {
    throw new Error(`Reset email error: ${err}`);
  }

  return window.firebase.auth.sendEmailVerification();
}

function resetPassword(email: string): void {
  window.firebase.auth.sendPasswordResetEmail(email);
}

// #region Event Listeners
async function accountExists(email: string): Promise<boolean> {
  const createUserResult = await window.firebase.auth.createUserWithEmailAndPassword(
    email,
    'test_password*for&auth%checking',
  );

  switch (createUserResult) {
    case 'auth/email-already-in-use':
      return true;

    case 'auth/invalid-email':
      console.log(`Email address ${email} is invalid.`);
      break;

    case 'auth/operation-not-allowed':
      console.log('Error during sign up.');
      break;

    case 'auth/weak-password':
      console.log('Password is not strong enough. Add additional characters including special characters and numbers.');
      break;

    default:
      console.log(createUserResult);
      break;
  }

  return false;
}

// #region Password reset prompts
/**
 * Are we currently checking if this account exists?
 */
/**
 * Opens a prompt for the user to reset their password.
 */
export async function showResetPasswordPrompt(email: string): Promise<void> {
  if (!isEmail(email)) {
    showMessageBox(
      'Provide account email',
      "Please put a correctly typed account email in the 'Email' field so that we can send you a password reset email.",
      'error',
    );
    return;
  }

  const doesAccountExist = await accountExists(email);

  if (doesAccountExist) {
    showConfirmResetPasswordPrompt(email);
    return;
  }

  showMessageBox(
    'Account does not exist',
    `No Remindr account exists with the email ${email}. Please make sure you spelled it correctly.`,
    'error',
  );
}

async function showConfirmResetPasswordPrompt(email?: string) {
  const { response } = await showMessageBox(
    'Reset Password Confirmation',
    'Are you sure you want to reset your password?',
    'info',
    ['Cancel', 'Reset Password'],
  );

  // A response of 1 corresponds to selecting 'Reset Password'
  if (response !== 1) return;

  const destinationEmail = email ?? window.firebase.auth.getEmail();

  if (!destinationEmail) throw new Error('confirmResetPasswordPrompt: No email provided for password reset.');

  resetPassword(destinationEmail);

  showMessageBox(
    'Password Reset Email Sent',
    `Check your email, ${destinationEmail}, to reset your password. Next time Remindr is opened, you will need to log in with your new password.`,
    'info',
  );
}
// #endregion

export async function deleteAccount(): Promise<void> {
  // Remove user object from disk
  await window.firebase.auth.deleteAuthCredential();
  await window.data.deleteAccountData();
}

export function getEmailVerifiedValue(authVal: string | boolean) {
  if (typeof authVal === 'string') return false;

  return authVal;
}

function parseAuthError(err: any) {
  const errCode = err.toString().match(/\(([^)]+)\)/)?.[1];

  switch (errCode) {
    case 'auth/wrong-password':
      return 'The password you entered is incorrect.';
    default:
      return errCode;
  }
}
