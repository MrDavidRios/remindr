import { Settings, Stream, Task } from '@remindr/shared';
import store, { AppDispatch } from '@renderer/app/store';
import { setSettings } from '@renderer/features/settings/settingsSlice';
import { setStreamList } from '@renderer/features/stream-list/streamListSlice';
import { setTaskList } from '@renderer/features/task-list/taskListSlice';

export function backupTaskData() {
  const taskList = store.getState().taskList.value;

  window.store.set('backup.tasks', taskList);
  window.store.set('last-backup-date.tasks', new Date());
}

export function restoreTaskData(dispatch: AppDispatch) {
  // look in 'backup'. If not there, check 'reminders' (for pre v2.1.0 compatibility).
  let backupTaskList = window.store.get('backup.tasks') as Task[] | undefined;

  if (backupTaskList === undefined) {
    // pre v2.1.0
    const oldBackupFormatTaskList = window.store.get('reminders') as Task[] | undefined;
    if (oldBackupFormatTaskList) backupTaskList = oldBackupFormatTaskList;
  }

  dispatch(setTaskList(backupTaskList ?? []));
}

export function backupSettingsData() {
  const settings = store.getState().settings.value;

  window.store.set('backup.settings', settings);
  window.store.set('last-backup-date.settings', new Date());
}

export function restoreSettingsData(dispatch: AppDispatch) {
  const settings = window.store.get('backup.settings') as Settings | undefined;
  if (settings === undefined) throw new Error('(restoreSettingsData) settings is undefined');

  dispatch(setSettings(settings));
}

export function backupStreamsData() {
  const streamList = store.getState().streamList.value;

  window.store.set('backup.streams', streamList);
  window.store.set('last-backup-date.streams', new Date());
}

export function restoreStreamsData(dispatch: AppDispatch) {
  const backupStreamList = window.store.get('backup.streams') as Stream[] | undefined;
  if (backupStreamList === undefined) throw new Error('(restoreStreamsData) stream list is undefined');

  dispatch(setStreamList(backupStreamList));
}

export function getLastBackupDate(dataType: 'tasks' | 'streams' | 'settings'): Date | undefined {
  const lastBackupDate = window.store.get('last-backup-date') as
    | { tasks?: Date; streams?: Date; settings?: Date }
    | undefined;

  if (lastBackupDate === undefined) return undefined;

  const backupDate = lastBackupDate[dataType];
  return backupDate !== undefined ? new Date(backupDate) : undefined;
}
