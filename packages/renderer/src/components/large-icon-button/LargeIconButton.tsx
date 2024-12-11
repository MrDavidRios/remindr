import { FC } from 'react';

interface LargeIconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  selected?: boolean;
}

export const LargeIconButton: FC<LargeIconButtonProps> = ({ icon, label, onClick, selected }) => {
  return (
    <button className={`large-icon-button ${selected ? 'selected' : ''}`} aria-label={label} onClick={() => onClick()}>
      <img src={icon}></img>
      <p>{label}</p>
    </button>
  );
};
