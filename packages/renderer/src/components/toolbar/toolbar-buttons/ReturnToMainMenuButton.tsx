import exitIcon from '@assets/icons/exit.svg';
import { AppMode } from '@remindr/shared';
import type { FC } from 'react';
import { setAppMode } from '/@/features/app-mode/appModeSlice';
import { useAppDispatch } from '/@/hooks';

export const ReturnToMainMenuButton: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      id="returnToMenuButton"
      className="toolbar-button"
      style={{ gridRow: 5 }}
      title="Return to Main Menu"
      onClick={() => dispatch(setAppMode(AppMode.LoginScreen))}
      aria-label="Return to Main Menu"
    >
      <div
        className="toolbar-button-img-container"
        style={{ transform: 'scaleX(-1)' }}
      >
        <img
          src={exitIcon}
          className="small"
          draggable="false"
          alt=""
        />
      </div>
    </button>
  );
};
