import { renderWithProviders } from '@mocks/store-utils';
import { AppMode, Menu } from '@remindr/shared';
import { initialMenuState } from '@renderer/features/menu-state/menuSlice';
import { initialUserState } from '@renderer/features/user-state/userSlice';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { HamburgerMenu } from './HamburgerMenu';

describe('Hamburger Menu', () => {
  const renderHamburgerMenu = ({ appMode, authenticated }: { appMode: AppMode; authenticated: boolean }) => {
    renderWithProviders(
      <HamburgerMenu />,
      {},
      {
        userState: Object.assign({ ...initialUserState }, { authenticated }),
        menuState: Object.assign({ ...initialMenuState }, { openMenus: [Menu.HamburgerMenu] }),
        appMode: {
          value: appMode,
        },
      },
    );
  };

  afterEach(() => {
    cleanup();
  });

  it('should show sign out button when online and authenticated', async () => {
    renderHamburgerMenu({ appMode: AppMode.Online, authenticated: true });

    await waitFor(() => expect(screen.getByTestId('hamburger-menu')).toBeVisible());

    const fileDropdown = screen.getByTestId('file-dropdown');
    userEvent.hover(fileDropdown);

    await waitFor(() => expect(screen.getByTitle('Sign Out')).toBeVisible());
  });

  it('should not show sign out button when offline or authenticated', async () => {
    renderHamburgerMenu({ appMode: AppMode.Online, authenticated: false });

    await waitFor(() => expect(screen.getByTestId('hamburger-menu')).toBeVisible());

    const fileDropdown = screen.getByTestId('file-dropdown');
    userEvent.hover(fileDropdown);

    await waitFor(() => expect(screen.getByTitle('Sign Out')).not.toBeVisible());
  });
});
