import errorIcon from '@assets/icons/error.svg';
import syncIcon from '@assets/icons/sync.svg';
import { useAppSelector } from '@renderer/hooks';
import React from 'react';

export const SyncIndicator: React.FC = () => {
  const ongoingRequests = useAppSelector((state) => state.databaseState.ongoingRequests);
  const connectionError = useAppSelector((state) => state.databaseState.connectionError);
  const attemptingToRegainConnection = useAppSelector((state) => state.databaseState.attemptingToRegainConnection);
  const saving = ongoingRequests > 0;

  if (connectionError)
    return (
      <button
        id="reconnectButton"
        className={`toolbar-button ${attemptingToRegainConnection ? 'reconnecting' : ''}`}
        type="button"
        aria-label="Attempt to reconnect"
        title={
          attemptingToRegainConnection ? 'Attempting to connect...' : 'Connection Error. Click to attempt to reconnect.'
        }
        onClick={() => {
          if (attemptingToRegainConnection) return;

          window.mainWindow.webContents.sendMessage('restart-firestore');
        }}
      >
        <img
          id="syncImage"
          className={attemptingToRegainConnection ? 'animate' : ''}
          src={syncIcon}
          draggable="false"
          alt=""
        />
        <img id="errorImage" src={errorIcon} draggable="false" alt="" />
      </button>
    );

  return (
    saving && <img id="syncImage" className="animate" src={syncIcon} draggable="false" title="Saving..." alt="Saving" />
  );
};
