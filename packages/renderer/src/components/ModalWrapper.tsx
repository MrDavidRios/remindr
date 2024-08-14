import { HotkeyScope } from '@renderer-types/hotkeyScope';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import React, { HTMLAttributes, useEffect, useRef } from 'react';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';

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
  const { enableScope, disableScope, enabledScopes } = useHotkeysContext();
  const openedAboveFullscreenMenu = useRef(enabledScopes.includes(HotkeyScope.FullscreenMenu));

  const onCloseMenu = () => {
    disableScope(HotkeyScope.Modal);

    if (openedAboveFullscreenMenu) {
      enableScope(HotkeyScope.FullscreenMenu);
    }

    onClose();
  };

  useEffect(() => {
    if (openedAboveFullscreenMenu) {
      disableScope(HotkeyScope.FullscreenMenu);
    }

    enableScope(HotkeyScope.Modal);
  }, []);

  useHotkeys('esc', () => onCloseMenu(), { enableOnFormTags: true, scopes: [HotkeyScope.Modal] });

  const ref = useClickOutside(
    () => {
      if (!closeOnClickOutside) return;

      onCloseMenu();
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
