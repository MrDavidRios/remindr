import { AppMode, Menu } from '@remindr/shared';
import { backdropAnimationProps, menuAnimationProps } from '@renderer/animation';
import { useAppSelector } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { motion } from 'framer-motion';
import { createContext, FC, HTMLAttributes, ReactNode } from 'react';
import ReactFocusLock from 'react-focus-lock';
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

  useHotkey(['esc'], () => onClose());

  return (
    <FullScreenMenuContext.Provider value={{ onClose }}>
      <ReactFocusLock returnFocus>
        <div className="full-window-container" style={style}>
          <motion.div className="backdrop" {...backdropAnimationProps(animate)} />
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
