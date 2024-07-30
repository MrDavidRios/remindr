import { configureStore } from '@reduxjs/toolkit';
import { AppMode } from 'main/types/classes/appMode';
import { unsavedTaskDialogMiddleware } from 'renderer/features/menu-state/middleware/unsavedTaskDialogMiddleware';
import { taskListStoreMiddleware } from 'renderer/features/task-list/middleware/taskListStoreMiddleware';
import { initialSettingsState } from '../features/settings/settingsSlice';
import { notificationEventMiddleware } from '../features/task-list/middleware/notificationEventMiddleware';
import { overdueBadgeMiddleware } from '../features/task-list/middleware/overdueBadgeMiddleware';
import { initialUserState } from '../features/user-state/userSlice';
import { getEmailVerifiedValue } from '../scripts/systems/authentication';
import { rootReducer } from './rootReducer';

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(unsavedTaskDialogMiddleware.middleware)
        .concat(taskListStoreMiddleware)
        .concat(overdueBadgeMiddleware)
        .concat(notificationEventMiddleware),
  });
};

const preloadedState = {
  appMode: {
    value: initialSettingsState.value.startupMode ?? AppMode.Online,
  },
  settings: initialSettingsState,
  userState: {
    ...initialUserState,
    authenticated: window.firebase.auth.authCredentialExists(),
    emailVerified: getEmailVerifiedValue(window.firebase.auth.emailVerified()),
  },
};
const store = setupStore(preloadedState);

// Make sure main has the correct app mode on startup - this makes sure that dataFunctions.ts works when starting offline, for example
window.appState.syncAppMode(store.getState().appMode.value);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
