import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppMode } from '@remindr/shared';

interface AppModeState {
  value: AppMode;
}

const initialState: AppModeState = {
  value: AppMode.LoginScreen,
};

export const appModeSlice = createSlice({
  name: 'appMode',
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<AppMode>) => {
      window.appState.syncAppMode(action.payload);

      return {
        ...state,
        value: action.payload,
      };
    },
  },
});

export default appModeSlice.reducer;
export const { setAppMode } = appModeSlice.actions;
