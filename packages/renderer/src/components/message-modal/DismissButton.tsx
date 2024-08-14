import React, { useContext } from 'react';
import { FullScreenMenuContext } from '../menus/fullscreen-menu/FullScreenMenu';

/**
 * Only to be used within the context of a `FullscreenMenu`
 * @param param0
 * @returns
 */
export const DismissButton: React.FC = () => {
  const { onClose } = useContext(FullScreenMenuContext);

  return (
    <div className="dismiss-button-wrapper">
      <button className="primary-button" onClick={onClose} type="button">
        Dismiss
      </button>
    </div>
  );
};
