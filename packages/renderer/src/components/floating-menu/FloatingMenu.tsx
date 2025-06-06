import { useClickOutside } from '@hooks/useoutsideclick';
import type { MenuRect } from '@remindr/shared';
import type { FC, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface FloatingMenuProps extends HTMLAttributes<HTMLDivElement> {
  anchor?: MenuRect;
  yOffset: { bottomAnchored: number; topAnchored: number };
  children: ReactNode;
  gap: number;
  rightAlign?: boolean;
  clickOutsideExceptions?: string[];
  onClickOutside?: () => void;
}

export const FloatingMenu: FC<FloatingMenuProps> = ({
  anchor,
  yOffset,
  gap,
  rightAlign,
  clickOutsideExceptions,
  className,
  id,
  children,
  style,
  onClickOutside,
  onKeyDown,
}) => {
  const [basis, setBasis] = useState<'left' | 'right'>(rightAlign ? 'right' : 'left');
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

    const menuXPos = rightAlign ? innerWidth - (anchor.x + anchor.width) : anchor.x;
    let borderAdjustedXPos = menuXPos;

    // Overflowing off right edge of screen
    if (!rightAlign && menuXPos + rect.width > innerWidth) {
      setBasis('right');
      borderAdjustedXPos = 20;
    }

    // Overflowing off left edge of screen
    if (rightAlign && menuXPos < 0) {
      setBasis('left');
      borderAdjustedXPos = 20;
    }

    const borderAdjustedYPos = posYTopAnchored + rect.height > innerHeight ? posYBottomAnchored : posYTopAnchored;

    setPosition({ x: borderAdjustedXPos, y: borderAdjustedYPos });
  }, [anchor, yOffset, gap, ref]);

  const horizontalPosProps = basis === 'right' ? { right: position.x } : { left: position.x };

  return (
    <div
      id={id}
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        visibility: position.x === -1 ? 'hidden' : 'visible',
        top: position.y,
        ...horizontalPosProps,
        ...style,
      }}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
};
