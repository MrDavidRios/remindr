import closeButtonIcon from '@assets/icons/close-button.png';
import React, { useContext, type HTMLProps } from 'react';
import { FullScreenMenuContext } from '../menus/fullscreen-menu/FullScreenMenu';

interface CloseMenuButtonProps extends HTMLProps<HTMLButtonElement> {}

export const CloseMenuButton: React.FC<CloseMenuButtonProps> = ({ id }) => {
  const { onClose } = useContext(FullScreenMenuContext);

  return (
    <button
      type="button"
      id={id}
      className="menu-close-button"
      aria-label="Close Menu"
      title="Close Menu (Esc)"
      onClick={onClose}
    >
      <img src={closeButtonIcon} draggable="false" alt="" />
    </button>
  );
};
