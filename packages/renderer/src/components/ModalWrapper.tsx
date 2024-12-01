import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import React, { HTMLAttributes } from 'react';

export interface ModalWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClose: () => void;
  closeOnClickOutside?: boolean;
  clickOutsideExceptions?: string[];
  ignoreGlobalClickOutsideExceptions?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  onClose,
  id,
  className,
  closeOnClickOutside,
  clickOutsideExceptions,
  ignoreGlobalClickOutsideExceptions,
}) => {
  useHotkey(['esc'], () => onClose());

  const ref = useClickOutside(
    () => {
      if (!closeOnClickOutside) return;

      onClose();
    },
    clickOutsideExceptions,
    ignoreGlobalClickOutsideExceptions,
  );

  return (
    <div id={id} className={className} ref={ref as unknown as React.RefObject<HTMLDivElement>}>
      {children}
    </div>
  );
};
