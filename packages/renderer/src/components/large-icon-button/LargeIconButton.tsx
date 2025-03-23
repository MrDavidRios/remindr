import { FC } from 'react';

interface LargeIconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  selected?: boolean;
  gap?: number;
  iconSize?: number;
}

export const LargeIconButton: FC<LargeIconButtonProps> = ({ icon, label, onClick, selected, gap, iconSize }) => {
  return (
    <button
      className={`large-icon-button ${selected ? 'selected' : ''}`}
      style={{ gap }}
      aria-label={label}
      onClick={() => onClick()}
    >
      <img src={icon} alt={label} draggable={false} style={{ width: iconSize, height: iconSize }} />
      <p>{label}</p>
    </button>
  );
};
