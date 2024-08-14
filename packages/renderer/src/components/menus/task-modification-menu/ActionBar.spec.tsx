import { renderWithProviders } from '@mocks/store-utils';
import { testTask } from '@mocks/testObjs';
import { Task } from '@remindr/shared';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActionBar } from './ActionBar';

interface RenderActionBarProps {
  showActionButtons: boolean;
  onSave: () => void;
  taskOverrides?: Partial<Task>;
}

describe('Action Bar', () => {
  const renderActionBar = ({ showActionButtons, onSave, taskOverrides }: RenderActionBarProps) => {
    renderWithProviders(
      <ActionBar task={{ ...testTask, ...taskOverrides }} showActionButtons={showActionButtons} onSave={onSave} />,
      {},
    );
  };

  afterEach(() => {
    cleanup();
  });

  it('should show action buttons wrapper when showActionButtons is enabled', async () => {
    renderActionBar({ showActionButtons: true, onSave: vi.fn() });

    const actionButtonsWrapper = screen.getByTestId('action-buttons-wrapper');
    await waitFor(() => expect(actionButtonsWrapper).toBeVisible());
  });

  it('should only show save button when showActionButtons is disabled', async () => {
    renderActionBar({ showActionButtons: false, onSave: vi.fn() });

    const actionButtonsWrapper = screen.queryByTestId('action-buttons-wrapper');
    await waitFor(() => expect(actionButtonsWrapper).not.toBeInTheDocument());
  });

  it('should call onSave when save button is clicked', async () => {
    const onSave = vi.fn();
    renderActionBar({ showActionButtons: true, onSave });

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    await waitFor(() => expect(saveButton).toBeVisible());

    saveButton.click();
    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });

  it('should show unpin button if task is pinned', async () => {
    renderActionBar({ showActionButtons: true, onSave: vi.fn(), taskOverrides: { pinned: true } });

    const unpinButton = screen.getByRole('button', { name: 'Unpin Task' });
    await waitFor(() => expect(unpinButton).toBeVisible());

    const pinButton = screen.queryByRole('button', { name: 'Pin Task' });
    await waitFor(() => expect(pinButton).not.toBeInTheDocument());
  });

  it('should show pin button if task is not pinned', async () => {
    renderActionBar({ showActionButtons: true, onSave: vi.fn(), taskOverrides: { pinned: false } });

    const pinButton = screen.getByRole('button', { name: 'Pin Task' });
    await waitFor(() => expect(pinButton).toBeVisible());

    const unpinButton = screen.queryByRole('button', { name: 'Unpin Task' });
    await waitFor(() => expect(unpinButton).not.toBeInTheDocument());
  });
});
