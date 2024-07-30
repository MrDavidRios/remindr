import { Menu } from 'main/types/menu';
import { formatDateAndTime } from 'main/utils/datefunctions';
import { FC, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import CloseMenuButton from 'renderer/components/close-menu-button/CloseMenuButton';
import { hideMenu, showDialog } from 'renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from 'renderer/hooks';
import { getLastBackupDate, restoreSettingsData, restoreTaskData } from 'renderer/scripts/systems/backup';
import { applyTheme } from 'renderer/scripts/systems/stylemanager';
import { FullScreenMenu } from '../../fullscreen-menu/FullScreenMenu';

export const RestoreDataMenu: FC = () => {
  const dispatch = useAppDispatch();
  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);

  const [restoreTasks, setRestoreTasks] = useState(true);
  const [restoreSettings, setRestoreSettings] = useState(true);

  const lastTaskBackupDate = getLastBackupDate('tasks');
  const lastSettingsBackupDate = getLastBackupDate('settings');

  const restoringTasks = restoreTasks && lastTaskBackupDate !== undefined;
  const restoringSettings = restoreSettings && lastSettingsBackupDate !== undefined;
  const disableRestore = !restoringTasks && !restoringSettings;

  useHotkeys('esc', () => dispatch(hideMenu({ menu: Menu.RestoreDataMenu, fromEscKeypress: true })), {
    enableOnFormTags: true,
  });

  return (
    <FullScreenMenu className="menu modal-menu" id="restoreDataMenu">
      <div className="titlebar">
        <div>
          <h3>Restore Data</h3>
        </div>
        <CloseMenuButton onClick={() => dispatch(hideMenu({ menu: Menu.RestoreDataMenu }))} />
      </div>
      <div id="checkboxContainer">
        <div>
          <div className="settings-checkbox">
            <input
              type="checkbox"
              checked={lastTaskBackupDate !== undefined ? restoreTasks : false}
              disabled={lastTaskBackupDate === undefined}
              onChange={(e) => {
                setRestoreTasks(e.currentTarget.checked);
              }}
            />
            <p>Tasks</p>
          </div>
          <p className="last-updated-text">
            {!lastTaskBackupDate
              ? 'No backup found.'
              : `Updated on ${formatDateAndTime(lastTaskBackupDate, dateFormat)}`}
          </p>
        </div>
        <div>
          <div className="settings-checkbox">
            <input
              type="checkbox"
              checked={lastSettingsBackupDate !== undefined ? restoreSettings : false}
              disabled={lastSettingsBackupDate === undefined}
              onChange={(e) => {
                setRestoreSettings(e.currentTarget.checked);
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
      <button
        className={`primary-button ${disableRestore ? 'disabled' : ''}`}
        onClick={() => {
          if (restoringTasks) restoreTaskData(dispatch);
          if (restoringSettings) {
            restoreSettingsData(dispatch);

            // Update theming in case if there were any theme settings updated
            applyTheme();

            dispatch(hideMenu({ menu: Menu.RestoreDataMenu }));
            dispatch(showDialog({ message: 'Data restored successfully!' }));
          }
        }}
        type="button"
      >
        Restore
      </button>
    </FullScreenMenu>
  );
};
