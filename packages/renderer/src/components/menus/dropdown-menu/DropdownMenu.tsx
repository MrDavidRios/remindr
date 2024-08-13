import { dynamicMenuHeightAnimationProps } from '@renderer/animation';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import type { FC, FocusEvent, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useState } from 'react';

// https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-links/
interface DropdownMenuProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  onClickOutside?: () => void;
  onBlur?: (e: FocusEvent<HTMLUListElement>) => void;
  clickOutsideExceptions?: string[];
  ignoreGlobalClickOutsideExceptions?: boolean;
  animate?: boolean;
}

export const DropdownMenu: FC<DropdownMenuProps> = ({
  id,
  'aria-label': ariaLabel,
  children,
  className,
  style,
  onClickOutside,
  clickOutsideExceptions,
  ignoreGlobalClickOutsideExceptions,
  animate,
}) => {
  const [hideOverflow, setHideOverflow] = useState(true);
  const animationsEnabled = useAnimationsEnabled();

  const height = useMotionValue(0);
  let lastFocusedIdx = -1;

  useMotionValueEvent(height, 'animationCancel', () => setHideOverflow(true));
  useMotionValueEvent(height, 'animationStart', () => setHideOverflow(true));
  useMotionValueEvent(height, 'animationComplete', () => {
    if (height.get() === 0) return;

    setHideOverflow(false);
  });

  useEffect(() => {
    if (!ref.current || ref.current.children.length === 0) return;

    // Focus on first element in menu
    setFocusOnMenuItem(0);

    for (let i = 0; i < ref.current.children.length; i++) {
      const menuItem = ref.current.children[i] as HTMLElement;

      menuItem.tabIndex = -1;

      menuItem.addEventListener('keydown', (e) => {
        let idxToFocusOn = 0;
        const lastElementIdx = ref.current!.children.length - 1;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            idxToFocusOn = i === lastElementIdx ? 0 : i + 1;
            setFocusOnMenuItem(idxToFocusOn);
            break;
          case 'ArrowUp':
            e.preventDefault();
            idxToFocusOn = i === 0 ? lastElementIdx : i - 1;
            setFocusOnMenuItem(idxToFocusOn);
            break;
          case ' ':
          case 'Enter':
            e.preventDefault();

            menuItem.click();
            break;
        }
      });
    }
  }, []);

  function setFocusOnMenuItem(idx: number) {
    if (!ref.current || ref.current.children.length === 0) return;

    const menuItem = ref.current.children[idx] as HTMLElement;

    const lastFocusedMenuItem = ref.current.children[lastFocusedIdx] as HTMLElement;
    if (lastFocusedMenuItem) lastFocusedMenuItem.tabIndex = -1;

    lastFocusedIdx = idx;
    menuItem.tabIndex = 0;
    menuItem.focus();
  }

  const ref = useClickOutside(
    () => {
      if (onClickOutside !== undefined) onClickOutside();
    },
    clickOutsideExceptions,
    ignoreGlobalClickOutsideExceptions,
  );

  return (
    <motion.ul
      id={id}
      ref={ref as any}
      role="menu"
      style={{ overflow: hideOverflow ? 'hidden' : 'visible', height, ...style }}
      className={`${className ?? ''} frosted`}
      aria-label={ariaLabel}
      {...dynamicMenuHeightAnimationProps(animate ? animationsEnabled : false)}
    >
      {children}
    </motion.ul>
  );
};
