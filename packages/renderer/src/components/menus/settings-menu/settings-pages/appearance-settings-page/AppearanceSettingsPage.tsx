import eyedropperIcon from '@assets/icons/eyedropper.svg';
import imageIcon from '@assets/icons/image.svg';
import uploadIcon from '@assets/icons/upload.svg';
import { Menu, Theme, themeLabels } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import { ColorPicker } from '@renderer/components/color-picker/ColorPicker';
import { Dropdown } from '@renderer/components/dropdown/Dropdown';
import { LargeIconButton } from '@renderer/components/large-icon-button/LargeIconButton';
import { updateSetting } from '@renderer/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { applyTheme } from '@renderer/scripts/systems/stylemanager';
import { getImgUrlFromData } from '@renderer/scripts/utils/imgutils';
import { useEffect, useState } from 'react';
import isHexColor from 'validator/lib/isHexColor';
import { BackgroundOpacitySlider } from './BackgroundOpacitySlider';

export function AppearanceSettingsPage() {
  const dispatch = useAppDispatch();

  const settings = useAppSelector((state) => state.settings.value);
  const isBackgroundColor = isHexColor(settings.background);

  const [selectedBackgroundOption, setSelectedBackgroundOption] = useState<'color' | 'image'>(
    isBackgroundColor ? 'color' : 'image',
  );

  const [backgroundImg, setBackgroundImg] = useState<string | undefined>(undefined);

  const updateBackgroundImgPreview = async () => {
    const imgUrl = getImgUrlFromData(await window.data.getBackgroundImage());
    setBackgroundImg(imgUrl);
  };

  useEffect(() => {
    if (isBackgroundColor) return;

    updateBackgroundImgPreview();
  }, [settings.background]);

  return (
    <div id="appearanceSettings">
      <h3 className="settings-menu-header">Appearance</h3>
      <p className="subheading">Background</p>
      <div id="backgroundSettingWrapper">
        <div id="backgroundTypeSelector">
          <LargeIconButton
            label={'Color'}
            icon={eyedropperIcon}
            onClick={() => setSelectedBackgroundOption('color')}
            selected={selectedBackgroundOption === 'color'}
            gap={6}
          />
          <LargeIconButton
            label={'Image'}
            icon={imageIcon}
            onClick={() => setSelectedBackgroundOption('image')}
            selected={selectedBackgroundOption === 'image'}
            gap={6}
          />
        </div>
        {selectedBackgroundOption === 'color' && (
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
        )}
        {selectedBackgroundOption === 'image' && (
          <div>
            {!isBackgroundColor && (
              <div className="settings-checkbox child" style={{ margin: '12px 0' }}>
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
            <div id="currentBackgroundImagePreview">
              {!isBackgroundColor && backgroundImg && <img src={backgroundImg} alt="Background" />}
              <button
                type="button"
                id="customImageSelectButton"
                className="accent-button"
                title="Pick a background image"
                onClick={async () => {
                  await openCustomImageDialog(settings.background, dispatch);
                  updateBackgroundImgPreview();
                }}
              >
                <img src={uploadIcon} draggable="false" alt="" />
                <p>{`Upload ${!isBackgroundColor ? 'new' : ''} background image`}</p>
              </button>
            </div>
          </div>
        )}
      </div>
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
