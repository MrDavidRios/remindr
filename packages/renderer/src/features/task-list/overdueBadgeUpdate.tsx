import store from '/@/app/store';
import { updateOverlayIcons } from '/@/scripts/systems/badges';
import { delay, waitUntil } from '/@/scripts/utils/timing';

let initialized = false;
let updateOverdueBadgeInterval: NodeJS.Timeout | null = null;

export const useOverdueBadgeUpdate = async () => {
  // Prevents duplicate calls
  if (initialized) return;
  initialized = true;

  // Wait until next minute to set interval
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000;

  // Wait until task list is loaded
  await waitUntil(() => store.getState().taskList.taskListGetStatus === 'succeeded', 1000);
  updateOverlayIcons();

  await delay(msToNextMinute);

  if (updateOverdueBadgeInterval) clearInterval(updateOverdueBadgeInterval);
  updateOverdueBadgeInterval = setInterval(() => {
    updateOverlayIcons();
  }, 60000); // Check every minute
};
