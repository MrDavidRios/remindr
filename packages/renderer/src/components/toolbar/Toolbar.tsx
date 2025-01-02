import { AppMode, Menu } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { SyncIndicator } from './SyncIndicator';
import { AccountMenuButton } from './toolbar-buttons/AccountMenuButton';
import { ColumnsViewButton } from './toolbar-buttons/ColumnsViewButton';
import { ListViewButton } from './toolbar-buttons/ListViewButton';
import { ReturnToMainMenuButton } from './toolbar-buttons/ReturnToMainMenuButton';
import { SettingsButton } from './toolbar-buttons/SettingsButton';
import { StreamEditorButton } from './toolbar-buttons/StreamEditorButton';
import { TaskCreateButton } from './toolbar-buttons/TaskCreateButton';

export function Toolbar() {
  const appMode = useAppSelector((state) => state.appMode.value);
  const scheduledReminderEditMenuOpen = useAppSelector((state) =>
    state.menuState.openMenus.includes(Menu.ScheduledReminderEditMenu),
  );

  return (
    <div id="mainToolbar" className={`frosted ${scheduledReminderEditMenuOpen ? 'submenu-open' : ''}`}>
      <div>
        <TaskCreateButton />
        <ListViewButton />
        <ColumnsViewButton />
        <StreamEditorButton />
      </div>
      <div>
        <SyncIndicator />
        {appMode === AppMode.Offline ? (
          <>
            <SettingsButton />
            <ReturnToMainMenuButton />
          </>
        ) : (
          <>
            <AccountMenuButton />
            <SettingsButton />
          </>
        )}
      </div>
    </div>
  );
}
