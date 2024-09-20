import { createDefaultSettings } from '@remindr/shared';
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import { vi } from 'vitest';

// Configuration to disable pretty print DOM on error (https://stackoverflow.com/a/64155473/5750490)
configure({
  getElementError: (message: string | null) => {
    const error = new Error(message ?? 'Unknown error');
    error.name = 'TestingLibraryElementError';
    error.stack = undefined;
    return error;
  },
});

vi.mock('@renderer/scripts/utils/userData', () => {
  return {};
});

vi.mock('@renderer/scripts/systems/authentication', () => {
  return {
    getEmailVerifiedValue: vi.fn(() => true),
  };
});

vi.mock('@renderer/app/store', () => {
  return {
    default: {
      getState: vi.fn(),
    },
  };
});

vi.mock('@renderer/features/task-list/taskListSync', () => {
  return {
    initializeTaskListSyncListener: vi.fn(() => {}),
  };
});

vi.mock('@renderer/scripts/utils/taskfunctions', () => {
  return {
    saveTaskData: vi.fn(),
  };
});

vi.mock('@renderer/scripts/utils/hooks/usedetectwheel', () => {
  return {
    useDetectWheel: vi.fn(),
  };
});

// https://stackoverflow.com/questions/57311971/error-not-implemented-window-scrollto-how-do-we-remove-this-error-from-jest-t
window.scrollTo = vi.fn();

(window as any).userState = {
  setUserProfile: vi.fn(),
  loadSettings: vi.fn(() => createDefaultSettings()),
};

(window as any).appState = {
  syncAppMode: vi.fn(() => {}),
};

(window as any).firebase = {
  auth: {
    authCredentialExists: vi.fn(() => {}),
    emailVerified: vi.fn(() => {}),
  },
};

(window as any).electron = {
  ipcRenderer: {
    on: vi.fn(() => vi.fn()),
    once: vi.fn(),
    sendMessage: vi.fn(),
  },
  remote: {
    isPackaged: vi.fn(),
    isDebug: vi.fn(),
    openDevTools: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
    showInFolder: vi.fn(),
    getPageTitle: vi.fn(),
  },
  theme: {
    getSystemTheme: vi.fn(),
  },
  process: {
    isWindowsOrMac: vi.fn(),
    isWindows: vi.fn(),
    isMac: vi.fn(),
    isLinux: vi.fn(),
  },
  path: {
    basename: vi.fn(),
  },
  // if new functions are added and not yet tested, the spread operator can be used to save time (until they actually need to be mocked)
};
