import { Menu } from '@remindr/shared';
import { dynamicMenuHeightAnimationProps } from '@renderer/animation';
import { closeDropdown, openDropdown } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useDetectWheel } from '@renderer/scripts/utils/hooks/usedetectwheel';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import type { FC, FocusEvent, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useState } from 'react';

// https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-links/
interface DropdownMenuProps extends HTMLAttributes<HTMLUListElement> {
  parentMenu: Menu;
  id: string;
  children: ReactNode;
  onClose?: () => void;
  onBlur?: (e: FocusEvent<HTMLUListElement>) => void;
  overrideEscBehavior?: boolean;
  clickOutsideExceptions?: string[];
  ignoreGlobalClickOutsideExceptions?: boolean;
  closeOnScroll?: boolean;
  animate?: boolean;
}

export const DropdownMenu: FC<DropdownMenuProps> = ({
  parentMenu,
  id,
  'aria-label': ariaLabel,
  children,
  className,
  style,
  onClose,
  clickOutsideExceptions,
  ignoreGlobalClickOutsideExceptions,
  closeOnScroll,
  animate,
}) => {
  const dispatch = useAppDispatch();

  const [hideOverflow, setHideOverflow] = useState(true);
  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => {
    dispatch(openDropdown({ menu: parentMenu, dropdownName: id }));
  }, []);

  const onCloseDropdown = () => {
    dispatch(closeDropdown({ menu: parentMenu, dropdownName: id }));

    onClose?.();
  };

  useHotkey(['esc'], () => onCloseDropdown());

  const height = useMotionValue(0);
  let lastFocusedIdx = -1;

  useMotionValueEvent(height, 'animationCancel', () => setHideOverflow(true));
  useMotionValueEvent(height, 'animationStart', () => setHideOverflow(true));
  useMotionValueEvent(height, 'animationComplete', () => {
    if (height.get() === 0) {
      return;
    }

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

  const ref = useClickOutside(() => onCloseDropdown(), clickOutsideExceptions, ignoreGlobalClickOutsideExceptions);
  useDetectWheel({
    element: document.body,
    callback: () => {
      if (!closeOnScroll) return;

      onCloseDropdown();
    },
  });

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
