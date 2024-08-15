import { Dropdown } from '@renderer/components/dropdown/Dropdown';
import { updateSetting } from '@renderer/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { updateOverlayIcons } from '@renderer/scripts/systems/badges';

export function NotificationsSettingsPage() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings.value);

  return (
    <div id="notificationsSettings">
      <h3 className="settings-menu-header">Notifications</h3>
      <p style={{ paddingBottom: 5 }}>Show overdue task badge in:</p>
      <div className="settings-checkbox">
        <input
          type="checkbox"
          tabIndex={0}
          checked={settings.overdueBadge}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'overdueBadge',
                value: e.currentTarget.checked,
              }),
            );

            updateOverlayIcons();
          }}
        />
        <p className="input-label">Taskbar icon</p>
      </div>
      <div className="settings-checkbox">
        <input
          type="checkbox"
          tabIndex={0}
          checked={settings.overdueTrayBadge}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'overdueTrayBadge',
                value: e.currentTarget.checked,
              }),
            );

            updateOverlayIcons();
          }}
        />
        <p className="input-label">System tray icon</p>
      </div>
      <p style={{ padding: '10px 0' }}>Send notifications through:</p>
      <Dropdown
        name="notificationSystem"
        options={[0, 1]}
        optionLabels={["Remindr's notification system", 'Native notification system']}
        selectedIdx={settings.nativeNotifications ? 1 : 0}
        onSelect={(idx: number) => {
          dispatch(
            updateSetting({
              key: 'nativeNotifications',
              value: idx === 1,
            }),
          );
        }}
        scrollParentId="settings"
      />
    </div>
  );
}
