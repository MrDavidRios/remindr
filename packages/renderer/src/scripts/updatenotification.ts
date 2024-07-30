import { Menu } from 'main/types/menu';
import { UpdateStatus } from 'main/types/updateStatus';
import { AppDispatch } from 'renderer/app/store';
import { showMenu } from 'renderer/features/menu-state/menuSlice';
import { setUpdateState } from 'renderer/features/update-state/updateState';

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
