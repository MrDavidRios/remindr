import { AppMode, appModeLabels, DateFormat, dateFormatDisplayNames, getDayNameFromIdx } from '@remindr/shared';
import { Dropdown } from '/@/components/dropdown/Dropdown';
import { updateSetting } from '/@/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '/@/hooks';

export function GeneralSettingsPage() {
  const dispatch = useAppDispatch();

  const settings = useAppSelector((state) => state.settings.value);

  const appVersion = window.appState.getVersion();

  const openReleasePage = () => {
    window.electron.shell.openExternal(`https://github.com/MrDavidRios/remindr_releases/releases/tag/v${appVersion}`);
  };

  return (
    <div id="generalSettings">
      <h3 className="settings-menu-header">General</h3>
      {/* There is currently no Linux support from Electron for auto startup. */}
      {window.electron.process.isWindowsOrMac() && (
        <>
          <div className="settings-checkbox parent">
            <input
              type="checkbox"
              tabIndex={0}
              id="autoStartup"
              name="auto-startup"
              checked={settings.autoStartup}
              onChange={(e) => {
                dispatch(
                  updateSetting({
                    key: 'autoStartup',
                    value: e.currentTarget.checked,
                  }),
                );

                window.electron.ipcRenderer.sendMessage('startup-setting-updated');
              }}
            />
            <p className="input-label">Open Remindr on startup</p>
          </div>
          <div className="settings-checkbox child">
            <input
              type="checkbox"
              tabIndex={0}
              id="hideOnStartup"
              name="hide-on-startup"
              checked={settings.hideOnStartup}
              onChange={(e) => {
                dispatch(
                  updateSetting({
                    key: 'hideOnStartup',
                    value: e.currentTarget.checked,
                  }),
                );
              }}
            />
            <p className="input-label">Hide window when launched on startup</p>
          </div>
        </>
      )}
      <div className="settings-checkbox">
        <input
          type="checkbox"
          tabIndex={0}
          id="militaryTime"
          name="military-time"
          checked={settings.militaryTime}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'militaryTime',
                value: e.currentTarget.checked,
              }),
            );
          }}
        />
        <p className="input-label">Use 24-hour time format</p>
      </div>
      <div id="startupModeSettingDropdownWrapper">
        <p className="dropdown-label">Startup mode:</p>
        <Dropdown
          name="appMode"
          options={Object.keys(AppMode)}
          optionLabels={appModeLabels}
          selectedIdx={Object.values(AppMode).indexOf(settings.startupMode)}
          onSelect={(idx: number) => {
            const selectedAppMode = Object.values(AppMode)[idx];
            dispatch(
              updateSetting({
                key: 'startupMode',
                value: selectedAppMode,
              }),
            );
          }}
        />
      </div>
      <p className="subheading" style={{ marginTop: 16 }}>
        Date & Time
      </p>
      <div id="weekStartSettingDropdownWrapper">
        <p className="dropdown-label">First day of week:</p>
        <Dropdown
          name="weekStartDay"
          options={Array.from({ length: 7 }, (_, dayIdx) => dayIdx)}
          optionLabels={Array.from({ length: 7 }, (_, dayIdx) => getDayNameFromIdx(dayIdx, 0, false))}
          selectedIdx={settings.weekStartDay}
          onSelect={(idx: number) => {
            dispatch(
              updateSetting({
                key: 'weekStartDay',
                value: idx,
              }),
            );
          }}
        />
      </div>
      <div id="dateFormatSettingDropdownWrapper">
        <p className="dropdown-label">Date format:</p>
        <Dropdown
          name="dateFormat"
          options={Object.keys(DateFormat).filter((key) => !Number.isNaN(Number(key)))}
          optionLabels={dateFormatDisplayNames}
          selectedIdx={settings.dateFormat ?? DateFormat.MDYText}
          onSelect={(idx: number) => {
            dispatch(
              updateSetting({
                key: 'dateFormat',
                value: idx,
              }),
            );
          }}
        />
      </div>
      <p className="subheading" style={{ marginTop: 16 }}>
        Version & Updates
      </p>
      <p style={{ marginBottom: 8 }}>
        Current version:{' '}
        <button
          onClick={openReleasePage}
          type="button"
          id="versionLabel"
          title={`View release notes for v${appVersion}`}
        >{`v${appVersion}`}</button>
      </p>
      {/* There is currently no Linux support from Electron for auto updates. */}
      {window.electron.process.isWindowsOrMac() && (
        <div className="settings-checkbox parent">
          <input
            type="checkbox"
            tabIndex={0}
            id="autoUpdate"
            name="auto-update"
            checked={settings.autoUpdate}
            onChange={(e) => {
              dispatch(
                updateSetting({
                  key: 'autoUpdate',
                  value: e.currentTarget.checked,
                }),
              );

              window.electron.ipcRenderer.sendMessage('startup-setting-updated');
            }}
          />
          <p className="input-label">Download and install updates automatically</p>
        </div>
      )}
    </div>
  );
}
