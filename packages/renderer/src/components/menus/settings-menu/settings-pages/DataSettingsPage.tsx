import { Menu } from '@remindr/shared';
import { showMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';

export function DataSettingsPage() {
  const dispatch = useAppDispatch();

  return (
    <div id="dataSettings">
      <h3 className="settings-menu-header">Data</h3>
      <p>Storage & Recovery</p>
      <div id="dataTransferButtonWrapper">
        <button type="button" className="data-transfer-button" onClick={() => dispatch(showMenu(Menu.BackupDataMenu))}>
          Backup
        </button>
        <button type="button" className="data-transfer-button" onClick={() => dispatch(showMenu(Menu.RestoreDataMenu))}>
          Restore
        </button>
      </div>
    </div>
  );
}
