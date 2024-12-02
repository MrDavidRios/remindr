import { Menu, Timeframe, timeframeDisplayNames } from '@remindr/shared';
import { Dropdown } from '@renderer/components/dropdown/Dropdown';
import { updateSetting } from '@renderer/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';

export function TasksSettingsPage() {
  const dispatch = useAppDispatch();

  const settings = useAppSelector((state) => state.settings.value);

  return (
    <div id="tasksSettings">
      <h3 className="settings-menu-header">Tasks</h3>
      <div id="timeframeSettingDropdownWrapper">
        <p className="dropdown-label">When Remindr opens, load tasks for</p>
        <Dropdown
          parentMenu={Menu.SettingsMenu}
          name="timeframe"
          options={Object.keys(Timeframe)}
          optionLabels={timeframeDisplayNames}
          selectedIdx={Object.values(Timeframe).indexOf(settings.defaultTimeframe)}
          onSelect={(idx) => {
            dispatch(
              updateSetting({
                key: 'defaultTimeframe',
                value: Object.values(Timeframe)[idx],
              }),
            );
          }}
          scrollParentId="settings"
        />
      </div>
      <div className="settings-checkbox" style={{ marginTop: 10 }}>
        <input
          type="checkbox"
          tabIndex={0}
          checked={settings.overdueShownAsToday}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'overdueShownAsToday',
                value: e.currentTarget.checked,
              }),
            );
          }}
        />
        <p className="input-label">Include overdue tasks in the list of tasks to do today</p>
      </div>
    </div>
  );
}
