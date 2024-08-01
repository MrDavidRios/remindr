import { Menu, UpdateStatus } from '@remindr/shared';
import { AppDispatch } from '../app/store';
import { showMenu } from '../features/menu-state/menuSlice';
import { setUpdateState } from '../features/update-state/updateState';

export function useUpdateNotificationListeners(dispatch: AppDispatch) {
  // Update available
  const onUpdateAvailable = () => {
    dispatch(setUpdateState({ status: UpdateStatus.UpdateAvailable }));
    dispatch(showMenu(Menu.UpdateNotification));
  };

  window.electron.ipcRenderer.on('update-available', onUpdateAvailable);

  // Update not available
  const onNoUpdateAvailable = () => {
    dispatch(setUpdateState({ status: UpdateStatus.NoUpdates }));
  };

  window.electron.ipcRenderer.on('update-not-available', onNoUpdateAvailable);

  // Check for updates
  const onCheckForUpdates = () => {
    dispatch(setUpdateState({ status: UpdateStatus.CheckingForUpdates }));
    dispatch(showMenu(Menu.UpdateNotification));
  };

  window.electron.ipcRenderer.on('check-for-updates', onCheckForUpdates);

  // Update downloaded
  const onUpdateDownloaded = (releaseName: string) => {
    dispatch(setUpdateState({ status: UpdateStatus.UpdateDownloaded, downloadedReleaseName: releaseName }));
    dispatch(showMenu(Menu.UpdateNotification));
  };

  window.electron.ipcRenderer.on('update-downloaded', (releaseName: any) => onUpdateDownloaded(releaseName as string));
}
