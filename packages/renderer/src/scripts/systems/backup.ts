import { Settings } from 'main/types/classes/settings';
import Task from 'main/types/classes/task/task';
import store, { AppDispatch } from 'renderer/app/store';
import { setSettings } from 'renderer/features/settings/settingsSlice';
import { setTaskList } from 'renderer/features/task-list/taskListSlice';

export function backupTaskData() {
  const taskList = store.getState().taskList.value;

  window.store.set('backup.tasks', taskList);

  window.store.set('last-backup-date.tasks', new Date());
}

export function restoreTaskData(dispatch: AppDispatch) {
  // look in 'backup'. If not there, check 'reminders' (for pre v2.1.0 compatibility).
  let backupTaskList = window.store.get('backup.tasks') as Task[] | undefined;

  if (!backupTaskList) {
    // pre v2.1.0
    const oldBackupFormatTaskList = window.store.get('reminders') as Task[] | undefined;
    if (oldBackupFormatTaskList) backupTaskList = oldBackupFormatTaskList;
  }

  dispatch(setTaskList(backupTaskList ?? []));
}

export function backupSettingsData() {
  const settings = store.getState().settings.value;
  if (!settings) throw new Error('backupSettingsData: settings is undefined');

  window.store.set('backup.settings', settings);
  window.store.set('last-backup-date.settings', new Date());
}

export function restoreSettingsData(dispatch: AppDispatch) {
  const settings = window.store.get('backup.settings') as Settings | undefined;
  if (!settings) throw new Error('restoreSettingsData: settings is undefined');

  dispatch(setSettings(settings));
}

export function getLastBackupDate(dataType: 'tasks' | 'settings' = 'tasks'): Date | undefined {
  const lastBackupDate = window.store.get('last-backup-date') as Date | { tasks: Date; settings: Date } | undefined;

  if (!lastBackupDate) return undefined;

  // Settings format change (v2.1.3+) -> both online and local settings are under backup settings
  if (dataType === 'settings' && window.store.get('backup.settings') === undefined) return undefined;

  // If there is a task backup date but no actual tasks backed up, return undefined (very unlikely case, but better to be safe than sorry)
  if (dataType === 'tasks' && window.store.get('backup.tasks') === undefined) return undefined;

  // If using old date format (e.g. migrating from pre-v2.1.0), return task date. Otherwise, return undefined
  const lastBackupDateObj = lastBackupDate as { tasks: Date; settings: Date };
  if (dataType === 'tasks' && lastBackupDateObj.tasks === undefined) {
    // transitionary state between pre v2.1.0 and v2.1.0+ -> settings were backed up but tasks were not, so backup date for tasks was erased
    if (typeof lastBackupDate !== 'string') return undefined;
    // pre v2.1.0
    return new Date(lastBackupDate as any);
  }

  // v2.1.0+
  return new Date(lastBackupDateObj[dataType] as any);
}
