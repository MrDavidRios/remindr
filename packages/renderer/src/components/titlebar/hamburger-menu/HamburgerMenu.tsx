import expandArrow from '@assets/icons/expand-arrow.png';
import hamburgerIcon from '@assets/icons/hamburger.svg';
import { useClickOutside } from '@hooks/useoutsideclick';
import { AppMode, Menu } from '@remindr/shared';
import { menuHeightAnimationProps } from '@renderer/animation';
import { hideMenu, showMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { rgbaToHex } from '@renderer/scripts/utils/colorutils';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { delay } from '@renderer/scripts/utils/timing';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';

export function HamburgerMenu() {
  const dispatch = useAppDispatch();
  const displayMenu = useAppSelector((state) => state.menuState.openMenus.includes(Menu.HamburgerMenu));

  const appMode = useAppSelector((state) => state.appMode.value);
  const { authenticated } = useAppSelector((state) => state.userState);
  const animationsEnabled = useAnimationsEnabled();

  const [showFileSubmenu, setShowFileSubmenu] = useState(false);
  const [showHelpSubmenu, setShowHelpSubmenu] = useState(false);

  const ref = useClickOutside(() => dispatch(hideMenu({ menu: Menu.HamburgerMenu })), undefined, true);
  useHotkeys('esc', () => dispatch(hideMenu({ menu: Menu.HamburgerMenu })), {
    enableOnFormTags: true,
  });

  const maxFileDropdownHeight = authenticated ? '85px' : '60px';

  const showSignOutButton = appMode !== AppMode.Offline && authenticated;

  // Get CSS variable
  const backgroundColor = rgbaToHex(getComputedStyle(document.documentElement).getPropertyValue('--surface-primary'));

  const ulRef = useRef<HTMLElement>();
  const [focusInSubmenu, setFocusInSubmenu] = useState(false);

  const fileSubmenuRef = useRef<HTMLElement>();
  const helpSubmenuRef = useRef<HTMLElement>();

  const closeMenu = () => {
    setShowFileSubmenu(false);
    setShowHelpSubmenu(false);

    dispatch(hideMenu({ menu: Menu.HamburgerMenu }));
  };

  const toggleMenu = () => {
    setShowFileSubmenu(false);
    setShowHelpSubmenu(false);

    // If menu is open, close it
    if (displayMenu) {
      dispatch(hideMenu({ menu: Menu.HamburgerMenu }));
      return;
    }

    dispatch(showMenu(Menu.HamburgerMenu));
  };

  return (
    <div id="hamburger-menu" ref={ref as unknown as React.RefObject<HTMLDivElement>}>
      <button type="button" id="hamburger-button" title="Menu" onClick={toggleMenu}>
        <img src={hamburgerIcon} alt="Open general menu" draggable="false" />
      </button>
      <AnimatePresence>
        {displayMenu && (
          <div id="titlebarMenu">
            <motion.ul
              {...menuHeightAnimationProps(animationsEnabled)}
              style={{ backgroundColor }}
              animate={{ height: '50px' }}
              ref={ulRef as unknown as React.RefObject<HTMLUListElement>}
              onFocus={() => setFocusInSubmenu(false)}
              onBlur={async () => {
                await delay(0);
                if (!ulRef.current?.contains(document.activeElement)) {
                  closeMenu();
                  return;
                }

                if (
                  fileSubmenuRef.current?.contains(document.activeElement) ||
                  helpSubmenuRef.current?.contains(document.activeElement)
                )
                  setFocusInSubmenu(true);
              }}
            >
              <ArrowNavigable waitForChildAnimation disableNavigation={focusInSubmenu}>
                <li
                  id="fileDropdown"
                  style={{ backgroundColor }}
                  onFocus={() => {
                    setShowFileSubmenu(true);
                    setShowHelpSubmenu(false);
                  }}
                  onMouseEnter={() => setShowFileSubmenu(true)}
                  onMouseLeave={() => setShowFileSubmenu(false)}
                >
                  File <img src={expandArrow} alt="Open file submenu" draggable="false" />
                  {showFileSubmenu && (
                    <ul
                      ref={fileSubmenuRef as unknown as React.RefObject<HTMLUListElement>}
                      className="sub-menu"
                      style={{ top: '32px', maxHeight: maxFileDropdownHeight }}
                    >
                      <ArrowNavigable>
                        <li
                          id="restartButton"
                          title="Restart (Ctrl + R)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === '') sendAction('restart', () => closeMenu());
                          }}
                          onClick={() => sendAction('restart', () => closeMenu())}
                        >
                          Restart
                        </li>
                        <li
                          id="signOutButton"
                          title="Sign Out"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === '') sendAction('sign-out', () => closeMenu());
                          }}
                          style={{
                            display: showSignOutButton ? '' : 'none',
                          }}
                          onClick={() => sendAction('sign-out', () => closeMenu())}
                        >
                          Sign Out
                        </li>
                        <li
                          id="quitButton"
                          title="Quit (Ctrl + Q)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === '') sendAction('quit', () => closeMenu());
                          }}
                          onClick={() => sendAction('quit', () => closeMenu())}
                        >
                          Quit
                        </li>
                      </ArrowNavigable>
                    </ul>
                  )}
                </li>
                <li
                  id="helpDropdown"
                  style={{ backgroundColor }}
                  onFocus={() => {
                    setShowHelpSubmenu(true);
                    setShowFileSubmenu(false);
                  }}
                  onMouseEnter={() => setShowHelpSubmenu(true)}
                  onMouseLeave={() => setShowHelpSubmenu(false)}
                >
                  Help <img src={expandArrow} alt="Open help submenu" draggable="false" />
                  {showHelpSubmenu && (
                    <ul
                      ref={helpSubmenuRef as unknown as React.RefObject<HTMLUListElement>}
                      className="sub-menu"
                      style={{ top: '57px', width: '150px' }}
                    >
                      <ArrowNavigable>
                        <li
                          id="checkForUpdatesButton"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === '') handleUpdateCheckButton(() => closeMenu());
                          }}
                          onClick={() => handleUpdateCheckButton(() => closeMenu())}
                        >
                          Check For Updates
                        </li>
                        <li
                          id="reportBugButton"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === '') handleReportBugButton(() => closeMenu());
                          }}
                          onClick={() => handleReportBugButton(() => closeMenu())}
                        >
                          Report a Bug
                        </li>
                      </ArrowNavigable>
                    </ul>
                  )}
                </li>
              </ArrowNavigable>
            </motion.ul>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function sendAction(action: string, _hideMenu: () => void) {
  window.electron.ipcRenderer.sendMessage('action-on-save', action);
  _hideMenu();
}

function handleReportBugButton(_hideMenu: () => void) {
  window.electron.shell.openExternal('https://github.com/MrDavidRios/remindr_releases/issues');

  _hideMenu();
}

function handleUpdateCheckButton(_hideMenu: () => void) {
  window.electron.ipcRenderer.sendMessage('check-for-updates');

  // main doesn't send check-for-updates event, so this is specifically for the update notification to show
  window.mainWindow.webContents.sendMessage('check-for-updates');

  _hideMenu();
}
