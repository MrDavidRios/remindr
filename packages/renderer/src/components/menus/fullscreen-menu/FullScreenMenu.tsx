import { AppMode, Menu } from '@remindr/shared';
import { HotkeyScope } from '@renderer-types/hotkeyScope';
import { backdropAnimationProps, menuAnimationProps } from '@renderer/animation';
import { useAppSelector } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { motion } from 'framer-motion';
import { createContext, FC, HTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import ReactFocusLock from 'react-focus-lock';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
interface FullScreenMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  menuType: Menu;
  onClose: () => void;
  modal?: boolean;
}

export const FullScreenMenu: FC<FullScreenMenuProps> = ({
  modal,
  menuType,
  className,
  id,
  children,
  style,
  onClose,
}) => {
  const animationsEnabled = useAnimationsEnabled();
  const appMode = useAppSelector((state) => state.appMode.value);

  const animate = animationsEnabled && appMode !== AppMode.LoginScreen;

  const classes = `fullscreen-menu frosted ${modal ? 'modal-menu' : ''} ${className}`;

  const { enableScope, disableScope, enabledScopes } = useHotkeysContext();
  const hotkeyScope = modal ? HotkeyScope.Modal : HotkeyScope.FullscreenMenu;

  const openedAboveFullscreenMenu = useRef(enabledScopes.includes(HotkeyScope.FullscreenMenu));

  const onCloseMenu = () => {
    disableScope(hotkeyScope);

    if (openedAboveFullscreenMenu) {
      enableScope(HotkeyScope.FullscreenMenu);
    }

    onClose();
  };

  useEffect(() => {
    if (openedAboveFullscreenMenu) {
      disableScope(HotkeyScope.FullscreenMenu);
    }

    enableScope(hotkeyScope);
  }, []);

  useHotkeys('esc', () => onCloseMenu(), { enableOnFormTags: true, scopes: [hotkeyScope] });

  return (
    <FullScreenMenuContext.Provider value={{ onClose: onCloseMenu }}>
      <ReactFocusLock returnFocus>
        <div className="full-window-container" style={style}>
          <motion.div className="backdrop" {...backdropAnimationProps(animationsEnabled)} />
          <motion.div id={id} className={classes} {...menuAnimationProps(animate)}>
            {children}
          </motion.div>
        </div>
      </ReactFocusLock>
    </FullScreenMenuContext.Provider>
  );
};

interface FullScreenMenuContextProps {
  onClose?: () => void;
}

export const FullScreenMenuContext = createContext<FullScreenMenuContextProps>({});
