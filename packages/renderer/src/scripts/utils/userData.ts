import { User } from '@remindr/shared';

window.userState.setUserProfile(JSON.stringify(new User().getDefault()));

export function setUserData(user: User): void {
  const defaultUserObj = new User().getDefault();
  const stringifiedCurrentUser = window.firebase.auth.getCurrentUser();

  if (stringifiedCurrentUser) {
    const currentUser = JSON.parse(stringifiedCurrentUser);

    if (user.email === defaultUserObj.email) user.email = currentUser.email;
    if (user.name === defaultUserObj.name) user.name = currentUser.displayName;
  }

  window.userState.setUserProfile(JSON.stringify(user));
}
