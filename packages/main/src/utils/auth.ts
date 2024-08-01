import { ipcMain, type BrowserWindow } from 'electron';
import type { Auth } from 'firebase/auth';
import { EmailAuthCredential, getAuth, onAuthStateChanged, signInWithCredential } from 'firebase/auth';
import { existsSync, unlinkSync } from 'fs';
import {
  createUser,
  getAuthCredential,
  getAuthCredentialPath,
  getCurrentUser,
  reauthenticateUser,
  sendPassResetEmail,
  sendVerificationEmail,
  signInUser,
  updateUserEmail,
} from './firebase.js';

let auth: Auth | undefined;
/**
 * Sets up authentication event listeners (e.g. sign in, sign out, create user, etc.) — Dependent on Firebase already being set up!
 * @param mainWindow
 */
export default function initAuthEventListeners(mainWindow: BrowserWindow | null) {
  auth = getAuth();

  onAuthStateChanged(auth, (/* user */) => {
    mainWindow?.webContents.send('auth-state-changed');
  });

  ipcMain.handle('create-user', (_event, email: string, password: string) => {
    return createUser(auth!, email, password);
  });

  ipcMain.handle('delete-firebase-user', () => {
    return deleteFirebaseUser();
  });

  ipcMain.handle('reauthenticate-user', (_event, email: string, password: string) => {
    const user = auth!.currentUser;

    if (!user) return 'No user found';

    return reauthenticateUser(user, email, password);
  });

  ipcMain.handle('send-email-verification', () => {
    // sends email verification email to current user
    const user = auth!.currentUser;

    if (!user) return 'No user found';

    return sendVerificationEmail(user);
  });

  ipcMain.handle('send-password-reset-email', (_event, email: string) => {
    return sendPassResetEmail(auth!, email);
  });

  ipcMain.handle('sign-in-user', (_event, email: string, password: string) => {
    return signInUser(auth!, email, password);
  });

  ipcMain.handle('sign-out-user', () => {
    return signOutUser();
  });

  ipcMain.handle('update-user-from-storage', () => {
    const authCredentialAsJSON = getAuthCredential();

    if (!authCredentialAsJSON) return;

    const authCredential = EmailAuthCredential.fromJSON(authCredentialAsJSON);

    if (!authCredential) return;

    signInWithCredential(auth!, authCredential);
  });

  ipcMain.handle('update-user-email', (_event, newEmail: string) => {
    const user = auth!.currentUser;

    if (!user) return 'No user found';

    return updateUserEmail(user, newEmail);
  });

  ipcMain.on('auth-credential-exists', (event) => {
    event.returnValue = existsSync(getAuthCredentialPath());
  });

  ipcMain.handle('delete-auth-credential', () => {
    deleteAuthCredential();
  });

  ipcMain.on('check-if-user-signed-in', (event) => {
    event.returnValue = auth!.currentUser !== null;
  });

  ipcMain.on('check-if-user-email-verified', (event) => {
    event.returnValue = auth!.currentUser?.emailVerified ?? 'User not found.';
  });

  ipcMain.on('get-user-email', (event) => {
    event.returnValue = auth!.currentUser?.email ?? undefined;
  });

  ipcMain.on('get-user-uid', (event) => {
    event.returnValue = getUserUID();
  });

  ipcMain.on('get-current-user', (event) => {
    if (!auth) {
      event.returnValue = undefined;
      return;
    }

    event.returnValue = getCurrentUser(auth);
  });
}

export function getUserUID(): string | undefined {
  return auth?.currentUser?.uid ?? undefined;
}

export async function deleteFirebaseUser() {
  await auth?.currentUser?.delete();
}

function deleteAuthCredential() {
  const authCredentialPath = getAuthCredentialPath();

  if (existsSync(authCredentialPath)) unlinkSync(authCredentialPath);
}

export async function signOutUser() {
  deleteAuthCredential();

  return auth?.signOut();
}
