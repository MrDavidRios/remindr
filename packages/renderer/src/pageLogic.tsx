import { AppMode } from '@remindr/shared';
import { useEffect } from 'react';
import { LoadingScreen } from './components/loading-screen/LoadingScreen';
import { AuthPage } from './components/login-page/AuthPage';
import { IntroPage } from './components/login-page/IntroPage';
import { OfflinePage } from './components/offline-page/OfflinePage';
import { TaskManagementPage } from './components/task-management-page/TaskManagementPage';
import { getConnectionStatus } from './features/connection-state/connectionState';
import { useAppDispatch, useAppSelector } from './hooks';

// eslint-disable-next-line consistent-return
export const ChosenPage = () => {
  const dispatch = useAppDispatch();

  const appMode = useAppSelector((state) => state.appMode.value);

  const initialized = useAppSelector((state) => state.userState.initialized);
  const authenticated = useAppSelector((state) => state.userState.authenticated);
  const userDataGetStatus = useAppSelector((state) => state.userState.userDataGetStatus);

  const { connected, connCheckStatus } = useAppSelector((state) => state.connectionState);

  useEffect(() => {
    dispatch(getConnectionStatus());
  }, []);

  // correction: if the computer isn't connected to the internet (connCheckStatus is successful and connected = false), proceed as normal. The following logic should handle this case correctly.
  // If the computer has internet access and user data is still pending, wait for 15 seconds. If it's still pending after, suggest offline mode.

  if (isLoading(connected, connCheckStatus, userDataGetStatus)) return <LoadingScreen />;

  // Startup complete
  switch (appMode) {
    case AppMode.LoginScreen:
      return <AuthPage />;
    case AppMode.Offline:
      return <TaskManagementPage />;
    case AppMode.Online:
      // If not connected to internet, show connection screen
      if (!connected) return <OfflinePage />;

      // If not logged in, show login page
      if (!authenticated) return <AuthPage />;

      // If user is logged in but hasn't been initialized, show intro page
      if (authenticated && !initialized) return <IntroPage />;

      return <TaskManagementPage />;
  }
};

function isLoading(connected: boolean, connCheckStatus: string, userDataGetStatus: string) {
  if (connCheckStatus === 'succeeded' && !connected) return false;

  if (connCheckStatus === 'pending' || userDataGetStatus === 'pending') return true;

  return false;
}
