import { AppMode } from 'main/types/classes/appMode';
import { Menu } from 'main/types/menu';
import { useAppSelector } from 'renderer/hooks';
import { SyncIndicator } from './SyncIndicator';
import { AccountMenuButton } from './toolbar-buttons/AccountMenuButton';
import { ReturnToMainMenuButton } from './toolbar-buttons/ReturnToMainMenuButton';
import { SettingsButton } from './toolbar-buttons/SettingsButton';
import { TaskCreateButton } from './toolbar-buttons/TaskCreateButton';
import { TimeframeMenuButton } from './toolbar-buttons/TimeframeMenuButton';

export function Toolbar() {
  const appMode = useAppSelector((state) => state.appMode.value);
  const scheduledReminderEditMenuOpen = useAppSelector((state) =>
    state.menuState.openMenus.includes(Menu.ScheduledReminderEditMenu),
  );

  return (
    <div id="mainToolbar" className={`frosted ${scheduledReminderEditMenuOpen ? 'submenu-open' : ''}`}>
      <div>
        <TaskCreateButton />
        <TimeframeMenuButton />
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
