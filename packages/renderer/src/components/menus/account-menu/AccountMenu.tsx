import extraMenuIcon from '@assets/icons/extra-menu.png';
import { Menu } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CloseMenuButton } from '../../close-menu-button/CloseMenuButton';
import { FullScreenMenu } from '../fullscreen-menu/FullScreenMenu';
import { AccountActionsMenu } from './AccountActionsMenu';
import { AccountDeleteMenu } from './AccountDeleteMenu';
import { AccountDetails } from './AccountDetails';
import { EmailResetMenu } from './EmailResetMenu';

export const AccountMenu = () => {
  const userData = useAppSelector((state) => state.userState.user);

  const [showAccountActionsMenu, setShowAccountActionsMenu] = useState(false);
  const [showEmailResetMenu, setShowEmailResetMenu] = useState(false);
  const [showAccountDeleteMenu, setShowAccountDeleteMenu] = useState(false);

  return (
    <FullScreenMenu menuType={Menu.AccountMenu} id="accountMenu">
      <div id="accountMenuHeaderWrapper">
        <h2 id="accountMenuHeader">Account</h2>
        <button
          type="button"
          id="accountMenuSettingsButton"
          className="menu-close-button"
          title="Account Options"
          onClick={() => setShowAccountActionsMenu(!showAccountActionsMenu)}
          aria-label="Account Options"
        >
          <img src={extraMenuIcon} className="ignore-cursor" draggable="false" alt="" />
        </button>
        <CloseMenuButton id="accountMenuCloseButton" />
      </div>
      <AccountDetails userData={userData} />
      <AnimatePresence>
        {showAccountActionsMenu && (
          <AccountActionsMenu
            setShowAccountActionsMenu={setShowAccountActionsMenu}
            setShowEmailResetMenu={setShowEmailResetMenu}
            setShowAccountDeleteMenu={setShowAccountDeleteMenu}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEmailResetMenu && <EmailResetMenu setShowEmailResetMenu={setShowEmailResetMenu} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAccountDeleteMenu && <AccountDeleteMenu setShowAccountDeleteMenu={setShowAccountDeleteMenu} />}
      </AnimatePresence>
    </FullScreenMenu>
  );
};
