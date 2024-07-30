import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppSelector } from 'renderer/hooks';
import { useDetectWheel } from 'renderer/scripts/utils/hooks/usedetectwheel';
import useClickOutside from 'renderer/scripts/utils/hooks/useoutsideclick';

interface ContextMenuProps extends HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  hideMenu: () => void;
}

export const ContextMenu: FC<ContextMenuProps> = ({ x, y, id, children, hideMenu }) => {
  const openMenus = useAppSelector((state) => state.menuState.openMenus);

  const [position, setPosition] = useState({ x, y });
  const [isVisible, setIsVisible] = useState(false);

  const ref = useClickOutside(() => hideMenu());

  useHotkeys('esc', () => hideMenu());

  // Hide menu when scrolling on task list container
  useDetectWheel({
    element: document.getElementById('taskListContainer') as HTMLElement | undefined,
    callback: hideMenu,
  });

  useEffect(() => {
    if (isVisible) hideMenu();
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
      ref={ref as any}
      className="context-menu menu frosted"
      style={{ left: position.x, top: position.y, visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {children}
    </div>
  );
};
