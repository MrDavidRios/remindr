import { Menu } from '@remindr/shared';
import { closeDropdown, openDropdown } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import React, { HTMLAttributes, useEffect } from 'react';
import ReactFocusLock from 'react-focus-lock';

export interface ModalWrapperProps extends HTMLAttributes<HTMLDivElement> {
  parentMenu: Menu;
  id: string;
  children: React.ReactNode;
  onClose: () => void;
  closeOnClickOutside?: boolean;
  clickOutsideExceptions?: string[];
  ignoreGlobalClickOutsideExceptions?: boolean;
}

/**
 * Modal Wrapper for children of another menu.
 * @param param0
 * @returns
 */
export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  parentMenu,
  children,
  onClose,
  id,
  className,
  closeOnClickOutside,
  clickOutsideExceptions,
  ignoreGlobalClickOutsideExceptions,
  style,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(openDropdown({ menu: parentMenu, dropdownName: id }));
  }, []);

  const onCloseModal = () => {
    dispatch(closeDropdown({ menu: parentMenu, dropdownName: id }));
    onClose?.();
  };

  useHotkey(['esc'], () => onCloseModal(), Menu.None, { prioritize: true });

  const ref = useClickOutside(
    () => {
      if (!closeOnClickOutside) return;

      onClose();
    },
    clickOutsideExceptions,
    ignoreGlobalClickOutsideExceptions,
  );

  return (
    <ReactFocusLock returnFocus>
      <div id={id} className={className} ref={ref as unknown as React.RefObject<HTMLDivElement>} style={style}>
        {children}
      </div>
    </ReactFocusLock>
  );
};
