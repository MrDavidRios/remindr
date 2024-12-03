import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import React, { useContext } from 'react';
import { FullScreenMenuContext } from '../menus/fullscreen-menu/FullScreenMenu';

/**
 * Only to be used within the context of a `FullscreenMenu`
 * @param param0
 * @returns
 */
export const DismissButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const { menuType } = useContext(FullScreenMenuContext);

  return (
    <div className="dismiss-button-wrapper">
      <button className="primary-button" onClick={() => dispatch(hideMenu({ menu: menuType }))} type="button">
        Dismiss
      </button>
    </div>
  );
};
