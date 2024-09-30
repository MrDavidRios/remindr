import { ipcMain } from 'electron';
import { getMainWindow } from './getMainWindow.js';

let mainMsgBoxId = 0;
export default function showMessageBox(
  title: string,
  message: string,
  type = 'info',
  buttons: string[] = [],
): Promise<{ response: number; checkboxChecked: boolean }> {
  const msgBoxId = mainMsgBoxId;

  getMainWindow()?.webContents.send(
    'show-message-box',
    JSON.stringify({
      title,
      message,
      type,
      buttons,
    }),
    mainMsgBoxId++,
  );

  return new Promise((resolve, reject) => {
    const listener = (_e: any, stringifiedResponse: string, id: number) => {
      if (id !== msgBoxId) return;

      const response = JSON.parse(stringifiedResponse);

      ipcMain.removeListener('show-message-box-response', listener);
      resolve(response);
    };
    setTimeout(() => {
      ipcMain.removeListener('show-message-box-response', listener);
      reject(new Error('Timeout reached waiting for message'));
    }, 60000);
    ipcMain.on('show-message-box-response', listener);
  });
}
