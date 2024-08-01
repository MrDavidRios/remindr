import { AppMode, Menu, formatDateAndTime } from '@remindr/shared';
import { FC, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { FullScreenMenu } from '../../fullscreen-menu/FullScreenMenu';
import CloseMenuButton from '/@/components/close-menu-button/CloseMenuButton';
import { hideMenu, showDialog } from '/@/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '/@/hooks';
import { backupSettingsData, backupTaskData, getLastBackupDate } from '/@/scripts/systems/backup';

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

  useHotkeys('esc', () => dispatch(hideMenu({ menu: Menu.BackupDataMenu, fromEscKeypress: true })), {
    enableOnFormTags: true,
  });

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
    <FullScreenMenu className="menu modal-menu" id="backupDataMenu">
      <div className="titlebar">
        <div>
          <h3>Backup Data</h3>
        </div>
        <CloseMenuButton onClick={() => dispatch(hideMenu({ menu: Menu.BackupDataMenu }))} />
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
