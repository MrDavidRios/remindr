import { useClickOutside } from '@hooks/useoutsideclick';
import type { MenuRect } from '@remindr/shared';
import type { FC, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface FloatingMenuProps extends HTMLAttributes<HTMLDivElement> {
  anchor?: MenuRect;
  yOffset: { bottomAnchored: number; topAnchored: number };
  children: ReactNode;
  gap: number;
  clickOutsideExceptions?: string[];
  onClickOutside?: () => void;
}

export const FloatingMenu: FC<FloatingMenuProps> = ({
  anchor,
  yOffset,
  gap,
  clickOutsideExceptions,
  className,
  id,
  children,
  style,
  onClickOutside,
  onKeyDown,
}) => {
  const [position, setPosition] = useState({ x: -1, y: -1 });

  const ref = useClickOutside(() => onClickOutside?.(), clickOutsideExceptions);

  useEffect(() => {
    const menu = ref.current;
    if (!anchor) {
      console.error('[FloatingMenu (useEffect)]: anchor is undefined');
      return;
    }

    if (!menu) return;

    const { innerWidth, innerHeight } = window;
    const rect = menu.getBoundingClientRect();

    const posYTopAnchored = anchor.y + anchor.height + gap + yOffset.topAnchored;
    const posYBottomAnchored = anchor.y - rect.height - gap - yOffset.bottomAnchored;

    // If y position will be going off the right edge of the screen, make sure it's positioned 20 pixels left of the right edge
    const borderAdjustedXPos = anchor.x + rect.width > innerWidth ? anchor.x - 20 : anchor.x;
    const borderAdjustedYPos = posYTopAnchored + rect.height > innerHeight ? posYBottomAnchored : posYTopAnchored;

    setPosition({ x: borderAdjustedXPos, y: borderAdjustedYPos });
  }, [anchor, yOffset, gap, ref]);

  return (
    <div
      id={id}
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        visibility: position.x === -1 ? 'hidden' : 'visible',
        left: position.x,
        top: position.y,
        ...style,
      }}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
};
