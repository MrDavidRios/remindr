import { useClickOutside } from '@hooks/useoutsideclick';
import { Menu } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { useDetectWheel } from '@renderer/scripts/utils/hooks/usedetectwheel';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import type { FC, HTMLAttributes } from 'react';
import { useEffect, useState } from 'react';

interface ContextMenuProps extends HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  hideMenu: (fromEscKeypress: boolean) => void;
}

export const ContextMenu: FC<ContextMenuProps> = ({ x, y, id, className, children, hideMenu }) => {
  const openMenus = useAppSelector((state) => state.menuState.openMenus);

  const [position, setPosition] = useState({ x, y });
  const [isVisible, setIsVisible] = useState(false);

  const ref = useClickOutside(() => hideMenu(false));

  useHotkey(['esc'], () => hideMenu(true), Menu.None, { prioritize: true });

  // Hide menu when scrolling on task list container
  useDetectWheel({
    element: document.getElementById('mainContainer') as HTMLElement | undefined,
    callback: () => hideMenu(false),
  });

  useEffect(() => {
    if (isVisible) hideMenu(false);
  }, [openMenus]);

  useEffect(() => {
    const menu = ref.current;
    if (menu) {
      const { innerWidth, innerHeight } = window;
      const rect = menu.getBoundingClientRect();
      const posX = x + rect.width > innerWidth ? innerWidth - rect.width - 20 : x;
      const posY = y + rect.height > innerHeight ? innerHeight - rect.height - 20 : y;
      setPosition({ x: posX, y: posY });
      setIsVisible(true); // Show the menu after the position has been calculated
    }
  }, [x, y, ref]);

  return (
    <div
      id={id}
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      className={`context-menu menu frosted ${className}`}
      style={{ left: position.x, top: position.y, visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {children}
    </div>
  );
};
