import { motion } from 'framer-motion';
import { Menu } from 'main/types/menu';
import { UpdateStatus } from 'main/types/updateStatus';
import { FC } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { hideMenu } from 'renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from 'renderer/hooks';

export const UpdateNotification: FC = () => {
  const dispatch = useAppDispatch();

  const updateStatus = useAppSelector((state) => state.updateState.status);
  const downloadedReleaseName = useAppSelector((state) => state.updateState.downloadedReleaseName);
  const enableAnimations = useAppSelector((state) => state.settings.value.enableAnimations);

  useHotkeys('esc', () => dispatch(hideMenu({ menu: Menu.UpdateNotification, fromEscKeypress: true })), {
    enableOnFormTags: true,
  });

  let message = 'Checking for updates...';
  let showRestartButton = false;

  switch (updateStatus) {
    case UpdateStatus.CheckingForUpdates:
      message = 'Checking for updates...';
      break;
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