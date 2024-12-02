import imageIcon from '@assets/icons/image.svg';
import { Menu, Theme, themeLabels } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import { ColorPicker } from '@renderer/components/color-picker/ColorPicker';
import { Dropdown } from '@renderer/components/dropdown/Dropdown';
import { updateSetting } from '@renderer/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { applyTheme } from '@renderer/scripts/systems/stylemanager';
import isHexColor from 'validator/lib/isHexColor';
import { BackgroundOpacitySlider } from './BackgroundOpacitySlider';

export function AppearanceSettingsPage() {
  const dispatch = useAppDispatch();

  const settings = useAppSelector((state) => state.settings.value);
  const isBackgroundColor = isHexColor(settings.background);

  return (
    <div id="appearanceSettings">
      <h3 className="settings-menu-header">Appearance</h3>
      <p className="subheading">Background</p>
      <div id="reminderPageThemeSettingWrapper">
        <div id="reminderPageThemeSettings">
          <ColorPicker
            initialColor={isBackgroundColor ? settings.background : '#00BD97'}
            onUpdate={(color) => {
              dispatch(
                updateSetting({
                  key: 'background',
                  value: color,
                }),
              );
            }}
            title="Pick a background color"
          />
          <button
            type="button"
            id="customImageSelectButton"
            className="after-first"
            title="Pick a background image"
            onClick={() => openCustomImageDialog(settings.background, dispatch)}
          >
            <img src={imageIcon} draggable="false" alt="" />
          </button>
        </div>
      </div>
      {!isBackgroundColor && (
        <div className="settings-checkbox child">
          <input
            type="checkbox"
            tabIndex={0}
            className="settings-checkbox"
            checked={settings.stretchBackground}
            onChange={(e) => {
              dispatch(
                updateSetting({
                  key: 'stretchBackground',
                  value: e.currentTarget.checked,
                }),
              );
            }}
          />
          <p className="input-label">Stretch background image to fit window</p>
        </div>
      )}
      <p style={{ marginTop: '10px' }}>Background brightness:</p>
      <BackgroundOpacitySlider
        initialOpacity={1 - settings.backgroundOpacity}
        onChange={(opacity) => {
          dispatch(
            updateSetting({
              key: 'backgroundOpacity',
              value: 1 - opacity,
            }),
          );
        }}
      />
      <p className="subheading">Effects</p>
      <div className="settings-checkbox">
        <input
          type="checkbox"
          tabIndex={0}
          id="enableAnimationsCheckbox"
          checked={settings.enableAnimations}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'enableAnimations',
                value: e.currentTarget.checked,
              }),
            );
          }}
        />
        <p className="input-label">Enable animations</p>
      </div>
      <div className="settings-checkbox">
        <input
          type="checkbox"
          tabIndex={0}
          id="enableTransparencyCheckbox"
          checked={settings.enableTransparency}
          onChange={(e) => {
            dispatch(
              updateSetting({
                key: 'enableTransparency',
                value: e.currentTarget.checked,
              }),
            );

            applyTheme();
          }}
        />
        <p className="input-label">Enable transparency</p>
      </div>
      <div id="themeSettingDropdownWrapper">
        <p className="subheading" style={{ marginBottom: 10 }}>
          Theme
        </p>
        <Dropdown
          parentMenu={Menu.SettingsMenu}
          name="theme"
          options={Object.keys(Theme)}
          optionLabels={themeLabels}
          selectedIdx={Object.values(Theme).indexOf(settings.theme)}
          onSelect={(idx: number) => {
            dispatch(
              updateSetting({
                key: 'theme',
                value: Object.values(Theme)[idx],
              }),
            );

            applyTheme();
          }}
          scrollParentId="settings"
        />
      </div>
    </div>
  );
}

async function openCustomImageDialog(backgroundType: string, dispatch: AppDispatch) {
  const imageInfo = await window.dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
  });
  if (imageInfo.canceled) return;

  const buffer = window.fs.readFileSync(imageInfo.filePaths[0]);

  const backgroundPath = `${window.data.getUserPath()}\\background.jpg`;
  window.fs.writeFileSync(backgroundPath, buffer);

  if (backgroundType === 'image') {
    // If background type was already image, send out image update event.
    window.mainWindow.webContents.sendMessage('background-image-update');
  }

  dispatch(
    updateSetting({
      key: 'background',
      value: 'image',
    }),
  );
}
