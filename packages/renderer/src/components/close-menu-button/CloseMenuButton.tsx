import { HTMLProps } from 'react';
import closeButtonIcon from '../../../../assets/icons/close-button.png';

interface CloseMenuButtonProps extends HTMLProps<HTMLButtonElement> {}

export default function CloseMenuButton(props: CloseMenuButtonProps) {
  const { id, onClick } = props;

  return (
    <button
      type="button"
      id={id}
      className="menu-close-button"
      aria-label="Close Menu"
      title="Close Menu (Esc)"
      onClick={onClick}
    >
      <img src={closeButtonIcon} draggable="false" alt="" />
    </button>
  );
}
