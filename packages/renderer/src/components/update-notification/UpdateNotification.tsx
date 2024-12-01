import { Menu, UpdateStatus } from '@remindr/shared';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { motion } from 'framer-motion';
import { FC } from 'react';

export const UpdateNotification: FC = () => {
  const dispatch = useAppDispatch();

  const updateStatus = useAppSelector((state) => state.updateState.status);
  const downloadedReleaseName = useAppSelector((state) => state.updateState.downloadedReleaseName);
  const enableAnimations = useAppSelector((state) => state.settings.value.enableAnimations);

  useHotkey(['esc'], () => dispatch(hideMenu({ menu: Menu.UpdateNotification, fromEscKeypress: true })));

  let message;
  let showRestartButton = false;

  switch (updateStatus) {
    case UpdateStatus.UpdateAvailable:
      message = 'A new update is available. Downloading now...';
      break;
    case UpdateStatus.UpdateDownloaded:
      if (downloadedReleaseName)
        message = `Version ${downloadedReleaseName} downloaded! It will be installed when Remindr restarts. Restart now?`;
      else message = 'Update Downloaded! It will be installed when Remindr restarts. Restart now?';

      showRestartButton = true;
      break;
    case UpdateStatus.NoUpdates:
      message = 'There are currently no new updates.';
      break;
    case UpdateStatus.CheckingForUpdates:
    default:
      message = 'Checking for updates...';
      break;
  }

  const animationProps = enableAnimations
    ? {
        initial: { right: -200 },
        animate: { right: 20 },
        exit: { right: -200 },
      }
    : {};

  return (
    <motion.div id="update-notification" className="frosted" layout="position" {...animationProps}>
      <p id="message">{message}</p>
      <div id="notification-buttons">
        <button
          type="button"
          className="notification-button"
          id="close-button"
          onClick={() => dispatch(hideMenu({ menu: Menu.UpdateNotification }))}
        >
          Close
        </button>
        <div id="small-space" />
        {showRestartButton && (
          <button
            type="button"
            className="notification-button"
            id="restart-button"
            onClick={() => window.electron.ipcRenderer.sendMessage('action-on-save', 'restart-and-update')}
          >
            Restart
          </button>
        )}
      </div>
    </motion.div>
  );
};
