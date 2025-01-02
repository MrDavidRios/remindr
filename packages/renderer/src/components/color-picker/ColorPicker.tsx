import eyedropperIcon from '@assets/icons/eyedropper.svg';
import { escEvent, Menu } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { useDetectWheel } from '@renderer/scripts/utils/hooks/usedetectwheel';
import type { InputHTMLAttributes } from 'react';
import React, { useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';
import { isHexColor } from 'validator';
import { ModalWrapper } from '../ModalWrapper';

interface ColorPickerProps extends InputHTMLAttributes<HTMLInputElement> {
  initialColor: string;
  onUpdate: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ initialColor, onUpdate }) => {
  const background = useAppSelector((state) => state.settings.value.background);
  const isBackgroundColor = isHexColor(background);

  const [color, setColor] = useState(initialColor);
  const [finalColor, setFinalColor] = useState(initialColor);

  const [pickerVisible, setPickerVisible] = useState(false);

  const togglePicker = () => (pickerVisible ? setPickerVisible(false) : openTogglePicker());

  function openTogglePicker() {
    setColor(finalColor);

    setPickerVisible(true);
  }

  useDetectWheel({
    element: document.getElementById('settings') as HTMLElement | undefined,
    callback: () => setPickerVisible(false),
  });

  useEffect(() => {
    // Focus on color picker whenever it's opened (allows 'esc' keypress to work)
    document.getElementById('colorPickerModal')?.querySelector('input')?.focus();
  }, [pickerVisible]);

  return (
    <div id="colorPickerWrapper">
      {isBackgroundColor && (
        <div id="colorBackgroundInfo">
          <div id="colorBackgroundPreview" style={{ backgroundColor: finalColor }} />
          <p>{finalColor}</p>
        </div>
      )}
      <button
        onClick={togglePicker}
        id="colorPickerBtn"
        className="accent-button"
        onKeyDown={(e) => escEvent(e as unknown as KeyboardEvent, () => setPickerVisible(false))}
      >
        <img src={eyedropperIcon} draggable="false" alt="" />
        <p>{`Pick ${isBackgroundColor ? 'new' : ''} background color`}</p>
      </button>
      {pickerVisible && (
        <ModalWrapper
          parentMenu={Menu.SettingsMenu}
          id="colorPickerModal"
          className="frosted"
          onClose={() => setPickerVisible(false)}
          closeOnClickOutside
          ignoreGlobalClickOutsideExceptions
          clickOutsideExceptions={['#colorPickerBtn']}
          style={{ top: -24 - (document.getElementById('settings')?.scrollTop ?? 0) }}
        >
          <ChromePicker color={color} onChange={(e) => setColor(e.hex)} disableAlpha />
          <div className="action-bar">
            <button onClick={() => setPickerVisible(false)}>Cancel</button>
            <button
              onClick={() => {
                setFinalColor(color);

                onUpdate(color);
                setPickerVisible(false);
              }}
            >
              Save
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};
