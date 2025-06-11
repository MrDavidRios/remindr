import { Menu, UpdateStatus } from "@remindr/shared";
import { AppDispatch } from "../app/store";
import { showMenu } from "../features/menu-state/menuSlice";
import { setUpdateState } from "../features/update-state/updateState";

export function useUpdateNotificationListeners(dispatch: AppDispatch) {
  window.electron.ipcRenderer.on("update-available", () => {
    dispatch(setUpdateState({ status: UpdateStatus.UpdateAvailable }));
    dispatch(showMenu(Menu.UpdateNotification));
  });

  window.electron.ipcRenderer.on("update-not-available", () => {
    dispatch(setUpdateState({ status: UpdateStatus.NoUpdates }));
  });

  window.electron.ipcRenderer.on("update-downloaded", (releaseName: string) => {
    dispatch(
      setUpdateState({
        status: UpdateStatus.UpdateDownloaded,
        downloadedReleaseName: releaseName,
      })
    );
    dispatch(showMenu(Menu.UpdateNotification));
  });
}
