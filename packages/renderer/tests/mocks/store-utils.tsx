import { configureStore } from '@reduxjs/toolkit';
import { AppMode, createDefaultSettings, Settings } from '@remindr/shared';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { rootReducer } from '../../src/app/rootReducer';
import { AppStore, RootState } from '../../src/app/store';
import { initialUserState } from '../../src/features/user-state/userSlice';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

const setupTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export function renderWithProviders(
  children: ReactNode,
  settingsOverrides?: Partial<Settings>,
  stateOverrides?: Partial<RootState>,
  {
    preloadedState = setupTestingState(stateOverrides, settingsOverrides),
    // Automatically create a store instance if no store was passed in
    store = setupTestStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  render(<Provider store={store}>{children}</Provider>, renderOptions);
}

export const setupTestingState = (stateOverrides?: Partial<RootState>, settingsOverrides?: Partial<Settings>) => {
  return {
    appMode: {
      value: AppMode.Online,
    },
    settings: { value: createDefaultSettings(settingsOverrides), syncOnline: false },
    userState: {
      ...initialUserState,
      authenticated: true,
      emailVerified: true,
    },
    ...stateOverrides,
  };
};
