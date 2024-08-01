import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppMode, createDefaultSettings, Settings, User } from '@remindr/shared';
import { setAppMode } from '../app-mode/appModeSlice';
import { getUserData } from '../user-state/userSlice';

interface SettingsState {
  value: Settings;
  syncOnline: boolean;
}

export const initialSettingsState: SettingsState = {
  // window.userState is treated as optional to make testing easier
  value: window.userState?.loadSettings() ?? createDefaultSettings(),
  syncOnline: false,
};

export const settingsSlice = createSlice({
  name: 'localSettings',
  initialState: initialSettingsState,
  reducers: {
    updateSetting: (state, action: PayloadAction<{ key: keyof Settings; value: any }>) => {
      (state.value[action.payload.key] as any) = action.payload.value;
      state.value.timestamp = Date.now();

      const settingsClone = { ...state.value };
      window.userState.saveSettings(settingsClone);
    },
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.value = action.payload;

      const settingsClone = { ...state.value };
      window.userState.saveSettings(settingsClone);
    },
  },
  extraReducers: (builder) => {
    // When the user data is loaded, load the user's settings (only if the timestamp is newer)
    builder.addCase(getUserData.fulfilled, (state, action) => {
      // Settings loaded from Firestore
      const userSettings = (action.payload as InstanceType<typeof User>).settings;

      // If the settings loaded from Firestore have been updated more recently than the local settings,
      // set the current setting state to the settings loaded from Firestore and save them locally as well
      if (userSettings.timestamp > state.value.timestamp) {
        state.value = userSettings;

        const settingsClone = { ...state.value };
        window.userState.saveSettings(settingsClone);
      }
    });
    builder.addCase(setAppMode, (state, action) => {
      state.syncOnline = action.payload === AppMode.Online;
    });
  },
});

export default settingsSlice.reducer;
export const { updateSetting, setSettings } = settingsSlice.actions;
