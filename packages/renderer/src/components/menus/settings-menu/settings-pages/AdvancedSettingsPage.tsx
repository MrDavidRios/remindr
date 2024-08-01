import { updateSetting } from '/@/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '/@/hooks';

export function AdvancedSettingsPage() {
  const dispatch = useAppDispatch();

  const settings = useAppSelector((state) => state.settings.value);

  return (
    <div id="advancedSettings">
      <h3 className="settings-menu-header">Advanced</h3>
      <div className="settings-checkbox parent">
        <input
          type="checkbox"
          tabIndex={0}
          id="unsavedTaskWarning"
          name="unsaved-task-warning"
          checked={settings.unsavedTaskWarning ?? true}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'unsavedTaskWarning',
                value: e.currentTarget.checked,
              }),
            );
          }}
        />
        <p className="input-label">Warn me about unsaved changes when creating a task</p>
      </div>
      <p className="subheading" style={{ marginTop: 16 }}>
        Input
      </p>
      <div className="settings-checkbox parent">
        <input
          type="checkbox"
          tabIndex={0}
          id="spellcheck"
          name="spellcheck"
          checked={settings.spellcheck ?? true}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'spellcheck',
                value: e.currentTarget.checked,
              }),
            );
          }}
        />
        <p className="input-label">Enable spellcheck</p>
      </div>
      <p className="subheading" style={{ marginTop: 16 }}>
        Experimental
      </p>
      <p style={{ fontSize: 14, paddingBottom: 8 }}>
        These features may be potentially buggy/unstable, but pose no risk of data loss.
      </p>
      <div className="settings-checkbox parent">
        <input
          type="checkbox"
          tabIndex={0}
          id="reorderableTodo"
          name="reorderable-todo"
          checked={settings.reorderableTodo ?? false}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'reorderableTodo',
                value: e.currentTarget.checked,
              }),
            );
          }}
        />
        <p className="input-label">Enable re-orderable &quot;To-do&quot; tasks</p>
      </div>
    </div>
  );
}
