import { BrowserWindow } from "electron";

export const getMainWindow = () =>
  BrowserWindow.getAllWindows().find(
    (w) => !w.isDestroyed() && w.getParentWindow() === null
  );
