import { renderWithProviders } from '@mocks/store-utils';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SyncIndicator } from './SyncIndicator';

describe('Sync Indicator', () => {
  const renderSyncIndicator = ({
    ongoingRequests,
    connectionError,
    attemptingToRegainConnection,
  }: {
    ongoingRequests: number;
    connectionError: boolean;
    attemptingToRegainConnection: boolean;
  }) => {
    renderWithProviders(
      <SyncIndicator />,
      {},
      {
        databaseState: { ongoingRequests, connectionError, attemptingToRegainConnection },
      },
    );
  };

  afterEach(() => {
    cleanup();
  });

  it('should show when there are ongoing requests', async () => {
    renderSyncIndicator({ ongoingRequests: 1, connectionError: false, attemptingToRegainConnection: false });

    const savingIndicator = screen.queryByTitle('Saving...');
    await waitFor(() => expect(savingIndicator).toBeVisible());
  });

  it('should be hidden when there are not ongoing requests', async () => {
    renderSyncIndicator({ ongoingRequests: 0, connectionError: false, attemptingToRegainConnection: false });

    const savingIndicator = screen.queryByTitle('Saving...');
    await waitFor(() => expect(savingIndicator).not.toBeInTheDocument());
  });

  it('should show reconnect attempt button if there is a connection error', async () => {
    renderSyncIndicator({ ongoingRequests: 0, connectionError: true, attemptingToRegainConnection: false });

    const reconnectButton = screen.queryByLabelText('Attempt to reconnect');
    await waitFor(() => expect(reconnectButton).toBeVisible());
  });
});
