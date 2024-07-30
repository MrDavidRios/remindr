import { AnimatePresence } from 'framer-motion';
import { Menu } from 'main/types/menu';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import CloseMenuButton from 'renderer/components/close-menu-button/CloseMenuButton';
import { FullScreenMenu } from 'renderer/components/menus/fullscreen-menu/FullScreenMenu';
import { hideMenu } from 'renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from 'renderer/hooks';
import extraMenuIcon from '../../../../../assets/icons/extra-menu.png';
import { AccountActionsMenu } from './AccountActionsMenu';
import { AccountDeleteMenu } from './AccountDeleteMenu';
import { AccountDetails } from './AccountDetails';
import { EmailResetMenu } from './EmailResetMenu';

export const AccountMenu = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.userState.user);

  const [showAccountActionsMenu, setShowAccountActionsMenu] = useState(false);

  const [showEmailResetMenu, setShowEmailResetMenu] = useState(false);
  const [showAccountDeleteMenu, setShowAccountDeleteMenu] = useState(false);

  useHotkeys(
    'esc',
    () => {
      const submenuOpen = showAccountActionsMenu || showEmailResetMenu || showAccountDeleteMenu;

      if (!submenuOpen) dispatch(hideMenu({ menu: Menu.AccountMenu, fromEscKeypress: true }));
    },
    { enableOnFormTags: true },
  );

  return (
    <FullScreenMenu id="accountMenu">
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
        <CloseMenuButton id="accountMenuCloseButton" onClick={() => dispatch(hideMenu({ menu: Menu.AccountMenu }))} />
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
