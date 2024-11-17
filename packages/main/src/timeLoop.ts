import { getDaysBetweenDates, msUntilNextMinute } from '@remindr/shared';
import { ipcMain } from 'electron';
import Store from 'electron-store';
import { getMainWindow } from './utils/getMainWindow.js';

const store = new Store();

/**
 * Checks if the day has changed since app was last opened and emits an event to the main window if it has.
 */
export function checkForOpenOnNewDay() {
  const lastOpenedTimestamp = new Date(store.get('last-opened-timestamp') as string);
  if (lastOpenedTimestamp !== undefined) {
    // If the day has changed between the last check time and now, calculate how many days and call onDayChange
    const daysSinceLastCheck = getDaysBetweenDates(lastOpenedTimestamp, new Date());
    if (daysSinceLastCheck > 0) {
      ipcMain.emit('day-changed', daysSinceLastCheck);
    }
  }

  store.set('last-opened-timestamp', new Date());
}

let timeLoopInterval: NodeJS.Timeout;
export function initializeTimeLoop() {
  if (timeLoopInterval) return;

  const delay = msUntilNextMinute();

  timeLoopInterval = setTimeout(() => {
    // Check for reminders at the end of this current minute, and then every minute after that
    checkForDayChange();
    setInterval(checkForDayChange, 60000);
  }, delay);
}

/**
 * Check if the day has changed only while the app has been opened, since we already check if the day has changed when
 * the app is opened.
 */
let lastDayCheckTimestamp: Date;
function checkForDayChange() {
  if (lastDayCheckTimestamp) {
    const daysSinceLastCheck = getDaysBetweenDates(lastDayCheckTimestamp, new Date());
    if (daysSinceLastCheck > 0) {
      ipcMain.emit('day-changed', daysSinceLastCheck);
    }
  }

  lastDayCheckTimestamp = new Date();
}

// Catch all day change events and forward to renderer
ipcMain.on('day-changed', (daysSinceUpdate) => {
  getMainWindow()?.webContents.send('day-changed', daysSinceUpdate);
});
