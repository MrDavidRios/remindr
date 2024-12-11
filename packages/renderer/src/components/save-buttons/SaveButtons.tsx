import { FC } from 'react';

interface SaveButtonsProps {
  onSave: () => void;
  onCancel: () => void;
}

export const SaveButtons: FC<SaveButtonsProps> = ({ onSave, onCancel }) => {
  return (
    <div className="save-buttons">
      <button className="accent-button" onClick={onSave}>
        Save
      </button>
      <button className="secondary-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};
