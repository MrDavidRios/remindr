/**
 * Shows a dialog box (error or information).
 * @param title string (required)
 * @param message string (required)
 * @param type error or info (string) (optional, defaults to 'info')
 * @param buttons array of buttons (optional)
 */
export default function showMessageBox(title: string, message: string, type = 'info', buttons: string[] = []) {
  switch (type) {
    case 'info':
      return window.dialog.showMessageDialog({
        type,
        buttons,
        title,
        message,
      }) as unknown as Promise<{ response: number; checkboxChecked: boolean }>; // bug with electron message box type
    case 'error':
      return window.dialog.showMessageDialog({
        type,
        buttons,
        title: 'Error',
        message: title,
        detail: message,
      }) as unknown as Promise<{ response: number; checkboxChecked: boolean }>;
    default:
      throw new Error(`Unhandled message type: ${type}`);
  }
}

window.electron.ipcRenderer.on('show-message-box', async (stringifiedOptions, id) => {
  const { title, message, type, buttons } = JSON.parse(stringifiedOptions as string);

  const response = await showMessageBox(title, message, type, buttons);

  window.electron.ipcRenderer.sendMessage('show-message-box-response', JSON.stringify(response), id);
});
