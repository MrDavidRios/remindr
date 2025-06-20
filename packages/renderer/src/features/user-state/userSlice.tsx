import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import type { Settings, User } from '@remindr/shared';
import { setUserData } from '@renderer/scripts/utils/userData';
import { setSettings, updateSetting } from '../settings/settingsSlice';

interface UserState {
  user?: InstanceType<typeof User>;
  userDataGetStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  initialized: boolean;
  authenticated: boolean;
  emailVerified: boolean;
}

export const initialUserState: UserState = {
  user: undefined,
  userDataGetStatus: 'idle',
  /**
   * Has this user gone through the welcome process? (e.g. set name, ...) - is true if user data document is
   * successfully loaded
   */
  initialized: false,
  authenticated: false,
  emailVerified: false,
};

export const getUserData = createAsyncThunk('userState/getUserData', async () => {
  console.log('attempting to get user data...');

  const userData: User = await window.data.loadUserData();

  // using JSON.stringify makes sure that we're putting the serializable version of the class into state
  return JSON.parse(JSON.stringify(userData));
});

function saveUserData(state: UserState) {
  if (!state.user) return;

  // Save the user data locally
  setUserData(state.user);

  // Save the user data online
  window.data.saveUserData();
}

export const userStateSlice = createSlice({
  name: 'userState',
  initialState: initialUserState,
  reducers: {
    resetUserState: (state) => {
      Object.assign(state, initialUserState);
    },
    updateUserData: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;

      if (!state.user) return;

      saveUserData(state);
    },
    /** Update the auth state of the user (auth, initialized) */
    updateUserState: (state, action: PayloadAction<{ authenticated: boolean; initialized: boolean }>) => {
      // If user signed out, clear their data from global state
      if (state.authenticated && !action.payload.authenticated) state.user = initialUserState.user;

      state.initialized = action.payload.initialized;
      state.authenticated = action.payload.authenticated;
    },
    updateEmailVerifiedState: (state, action: PayloadAction<{ emailVerified: boolean }>) => {
      state.emailVerified = action.payload.emailVerified;
    },
    updateEmail: (state, action: PayloadAction<{ email: string }>) => {
      state.user!.email = action.payload.email;

      saveUserData(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserData.pending, (state) => {
      if (state.userDataGetStatus === 'idle') {
        state.userDataGetStatus = 'pending';
      }
    });
    builder.addCase(getUserData.fulfilled, (state, action) => {
      state.user = action.payload;
      state.userDataGetStatus = 'succeeded';
    });
    builder.addCase(getUserData.rejected, (state) => {
      if (state.userDataGetStatus === 'pending') {
        console.log('user data acquisition attempt failed');

        state.userDataGetStatus = 'failed';
      }
    });
    builder.addCase(updateSetting, (state, action) => {
      if (!state.user) return;

      // If the setting is not changing, don't call firestore
      if (state.user.settings[action.payload.key] === action.payload.value) return;

      const updatedSettings: Settings = current(state.user.settings);
      state.user.settings = { ...updatedSettings, [action.payload.key]: action.payload.value };

      saveUserData(state);
    });
    builder.addCase(setSettings, (state, action) => {
      if (!state.user) return;

      state.user.settings = action.payload;

      saveUserData(state);
    });
  },
});

export default userStateSlice.reducer;
export const { resetUserState, updateUserData, updateUserState, updateEmail, updateEmailVerifiedState } =
  userStateSlice.actions;
