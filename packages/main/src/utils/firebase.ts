import { app } from 'electron';
import { initializeApp } from 'firebase/app';
import type { Auth, User, UserCredential } from 'firebase/auth';
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateEmail,
} from 'firebase/auth';

const fs = require('fs');

export function initFirebase() {
  // TODO: Put apiKey in a .env file
  initializeApp({
    apiKey: 'AIzaSyAZZXrkrjYALTXCfdv6xybrtkg-mkTB28M',
    authDomain: 'remindr-8d249.firebaseapp.com',
    databaseURL: 'https://remindr-8d249.firebaseio.com',
    projectId: 'remindr-8d249',
    storageBucket: 'remindr-8d249.appspot.com',
    messagingSenderId: '287336375680',
    appId: '1:287336375680:web:dfc310a200a08cf754cd65',
    measurementId: 'G-VLSKBQE62S',
  });
}

// If this returns a string, it's an error
export function createUser(auth: Auth, email: string, password: string): Promise<string> {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential: UserCredential) => {
      // User successfully created
      return JSON.stringify(userCredential);
    })
    .catch(err => err.code);
}

// If this returns a string, it's an error. If it's a boolean, it's successful.
export function reauthenticateUser(
  user: User,
  email: string,
  password: string,
): Promise<boolean | string> {
  const credential = EmailAuthProvider.credential(email, password);

  return reauthenticateWithCredential(user, credential)
    .then(() => {
      // User re-authenticated
      return true;
    })
    .catch(err => err);
}

// If this returns a string, it's an error. If it's a boolean, it's successful.
export function sendVerificationEmail(user: User): Promise<boolean | string> {
  return sendEmailVerification(user)
    .then(() => {
      return true;
    })
    .catch(err => err);
}

export function sendPassResetEmail(auth: Auth, email: string): Promise<boolean | string> {
  return sendPasswordResetEmail(auth, email)
    .then(() => {
      return true;
    })
    .catch(err => err);
}

export function signInUser(auth: Auth, email: string, password: string): Promise<boolean | string> {
  return signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // automatically save user credential to local storage
      storeAuthCredential(email, password);
      return true;
    })
    .catch(err => err);
}

// https://firebase.google.com/docs/reference/node/firebase.auth.EmailAuthProvider
function storeAuthCredential(email: string, password: string) {
  const authCredential = EmailAuthProvider.credential(email, password);
  const authCredentialJSON = authCredential.toJSON();

  fs.writeFileSync(getAuthCredentialPath(), JSON.stringify(authCredentialJSON));
}

export function getAuthCredential(): string | undefined {
  // If the userObj.json file is still on the user's computer, autommatically remove it (strictly for migration purposes).
  if (fs.existsSync(getUserObjPath())) fs.unlinkSync(getUserObjPath());

  if (!fs.existsSync(getAuthCredentialPath())) return undefined;

  return fs.readFileSync(getAuthCredentialPath(), 'utf8');
}

// If this returns a string, it's an error. If it's a boolean, it's successful.
export function updateUserEmail(user: User, newEmail: string): Promise<boolean | string> {
  return updateEmail(user, newEmail)
    .then(() => {
      // User re-authenticated
      return true;
    })
    .catch(err => err);
}

export function getUserObjPath(): string {
  const userObjPath = `${app.getPath('userData')}\\userObj.json`;
  return userObjPath;
}

export function getAuthCredentialPath(): string {
  const authCredentialPath = `${app.getPath('userData')}\\authCredential.json`;
  return authCredentialPath;
}

export function getUserObj(): string | undefined {
  if (!fs.existsSync(getUserObjPath())) return undefined;

  return fs.readFileSync(getUserObjPath(), 'utf8');
}

export function getCurrentUser(auth: Auth): string | undefined {
  if (!auth.currentUser) return undefined;

  return JSON.stringify(auth.currentUser);
}
