import { AppMode, Menu, formatDateAndTime } from '@remindr/shared';
import { CloseMenuButton } from '@renderer/components/close-menu-button/CloseMenuButton';
import { hideMenu, showDialog } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { backupSettingsData, backupTaskData, getLastBackupDate } from '@renderer/scripts/systems/backup';
import { FC, useEffect, useState } from 'react';
import { FullScreenMenu } from '../../fullscreen-menu/FullScreenMenu';

export const BackupDataMenu: FC = () => {
  const dispatch = useAppDispatch();

  const appMode = useAppSelector((state) => state.appMode.value);
  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);

  const [backupTasks, setBackupTasks] = useState(true);
  const [backupSettings, setBackupSettings] = useState(true);

  const [dataBackedUp, setDataBackedUp] = useState(false);

  const lastTaskBackupDate = getLastBackupDate('tasks');
  const lastSettingsBackupDate = getLastBackupDate('settings');

  const disableButton = !backupTasks && (appMode !== AppMode.Online || !backupSettings);

  function handleBackupClick() {
    if (backupTasks) backupTaskData();
    if (backupSettings) backupSettingsData();

    setDataBackedUp(true);

    dispatch(hideMenu({ menu: Menu.BackupDataMenu }));
    dispatch(showDialog({ message: 'Data backed up successfully!' }));
  }

  // Helps to trigger a re-render when the 'backup' button is pressed
  useEffect(() => {
    if (dataBackedUp) setDataBackedUp(false);
  }, [dataBackedUp]);

  return (
    <FullScreenMenu modal menuType={Menu.BackupDataMenu} className="menu" id="backupDataMenu">
      <div className="titlebar">
        <div>
          <h3>Backup Data</h3>
        </div>
        <CloseMenuButton />
      </div>
      <div id="checkboxContainer">
        <div>
          <div className="settings-checkbox">
            <input
              type="checkbox"
              checked={backupTasks}
              onChange={(e) => {
                setBackupTasks(e.currentTarget.checked);
              }}
            />
            <p>Tasks</p>
          </div>
          <p className="last-updated-text">
            {!lastTaskBackupDate
              ? 'No backup found'
              : `Updated on ${formatDateAndTime(lastTaskBackupDate, dateFormat)}`}
          </p>
        </div>
        <div>
          <div className="settings-checkbox">
            <input
              type="checkbox"
              checked={backupSettings}
              onChange={(e) => {
                setBackupSettings(e.currentTarget.checked);
              }}
            />
            <p>Settings</p>
          </div>
          <p className="last-updated-text">
            {!lastSettingsBackupDate
              ? 'No backup found'
              : `Updated on ${formatDateAndTime(lastSettingsBackupDate, dateFormat)}`}
          </p>
        </div>
      </div>
      <button className={`primary-button ${disableButton ? 'disabled' : ''}`} onClick={handleBackupClick} type="button">
        Backup
      </button>
    </FullScreenMenu>
  );
};
