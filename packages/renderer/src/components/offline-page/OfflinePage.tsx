import remindrLoadingIcon from "@assets/icons/logo-full-size.png";
import { AppMode, delay } from "@remindr/shared";
import { setAppMode } from "@renderer/features/app-mode/appModeSlice";
import { updateConnectionState } from "@renderer/features/connection-state/connectionState";
import { useAppDispatch } from "@renderer/hooks";
import { initializeUser } from "@renderer/scripts/systems/authentication";
import { useEffect, useState } from "react";

export function OfflinePage() {
  const dispatch = useAppDispatch();

  const [attemptingConnection, setAttemptingConnection] = useState(false);
  const [headerContent, setHeaderContent] = useState("Try again?");

  const runAttemptConnection = async () => {
    if (attemptingConnection) return;
    setAttemptingConnection(true);

    const online = await attemptConnection(setHeaderContent);

    if (online) {
      // Log in, then set connection status to true
      await initializeUser(dispatch);
      dispatch(updateConnectionState({ connectionStatus: true }));
      return;
    }

    setHeaderContent("Try again?");
    setAttemptingConnection(false);
  };

  // Empty array means that this useEffect hook will only run once (on mount)
  useEffect(() => {
    runAttemptConnection();
  }, []);

  return (
    <div id="loadingScreenContainer" className="frosted">
      <img
        id="loadingScreenImg"
        src={remindrLoadingIcon}
        draggable="false"
        alt="Loading"
      />
      <h1 id="loadingHeader">{`Failed to connect. ${headerContent}`}</h1>
      <div id="offlinePageButtonWrapper">
        {!attemptingConnection && (
          <button
            type="button"
            id="retryConnectBtn"
            className="large-button"
            onClick={runAttemptConnection}
          >
            Retry
          </button>
        )}
        <button
          type="button"
          id="offlineBtn"
          className="large-button"
          onClick={() => {
            dispatch(setAppMode(AppMode.Offline));
          }}
        >
          Go Offline
        </button>
      </div>
    </div>
  );
}

async function attemptConnection(
  setHeaderCallback: (content: string) => void
): Promise<boolean> {
  let attempts = 0;

  while (attempts < 3) {
    for (let i = 5; i > 0; i--) {
      setHeaderCallback(`Trying again in ${i}...`);

      await delay(1000);
    }

    if (await window.appState.hasNetworkConnection()) return true;

    attempts++;
  }

  return false;
}
