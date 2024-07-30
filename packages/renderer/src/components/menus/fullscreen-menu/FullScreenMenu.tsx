import { motion } from 'framer-motion';
import { AppMode } from 'main/types/classes/appMode';
import { FC, HTMLAttributes, ReactNode } from 'react';
import ReactFocusLock from 'react-focus-lock';
import { backdropAnimationProps, menuAnimationProps } from 'renderer/animation';
import { useAppSelector } from 'renderer/hooks';
import { useAnimationsEnabled } from 'renderer/scripts/utils/hooks/useanimationsenabled';

interface FullScreenMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const FullScreenMenu: FC<FullScreenMenuProps> = ({ className, id, children, style }) => {
  const animationsEnabled = useAnimationsEnabled();
  const appMode = useAppSelector((state) => state.appMode.value);

  const animate = animationsEnabled && appMode !== AppMode.LoginScreen;

  return (
    <ReactFocusLock returnFocus>
      <div className="full-window-container" style={style}>
        <motion.div className="backdrop" {...backdropAnimationProps(animationsEnabled)} />
        <motion.div id={id} className={`fullscreen-menu frosted ${className}`} {...menuAnimationProps(animate)}>
          {children}
        </motion.div>
      </div>
    </ReactFocusLock>
  );
};
