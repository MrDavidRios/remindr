import { BadgeInfo, type Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { getOverdueAmount } from '../utils/tasklistutils';

export function updateOverlayIcons(taskList?: Task[]): void {
  const overdueTaskAmount = getOverdueAmount(taskList ?? store.getState().taskList.value);

  if (overdueTaskAmount === 0) {
    window.electron.ipcRenderer.sendMessage('update-badge', null);
    window.electron.ipcRenderer.sendMessage('update-tray-icon', 0);
    return;
  }

  let badgeInfo = null;

  const settings = store.getState().settings.value;
  const enableTrayBadge = settings.overdueTrayBadge ?? false;
  const enableTaskbarBadge = settings.overdueBadge ?? false;

  const accessibilityDescription =
    overdueTaskAmount > 1 && overdueTaskAmount !== 0
      ? `${overdueTaskAmount} overdue tasks`
      : `${overdueTaskAmount} overdue task`;

  if (overdueTaskAmount < 10)
    badgeInfo = new BadgeInfo(`/alert-overlays/alert-${overdueTaskAmount}.png`, accessibilityDescription);
  else {
    badgeInfo = new BadgeInfo('/alert-overlays/alert-9+.png', accessibilityDescription);

    window.electron.ipcRenderer.sendMessage('update-tray-icon', '9+');
  }

  const formattedMissedReminderAmount = overdueTaskAmount > 9 ? '9+' : `${overdueTaskAmount}`;

  window.electron.ipcRenderer.sendMessage('update-tray-icon', enableTrayBadge ? formattedMissedReminderAmount : 0);

  if (window.electron.process.isMac() || window.electron.process.isLinux()) {
    window.electron.ipcRenderer.sendMessage('update-badge', enableTaskbarBadge ? overdueTaskAmount : 0);
    return;
  }

  window.electron.ipcRenderer.sendMessage('update-badge', enableTaskbarBadge ? badgeInfo : null);
}
