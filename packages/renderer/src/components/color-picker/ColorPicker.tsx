import { escEvent, Menu } from '@remindr/shared';
import type { InputHTMLAttributes } from 'react';
import React, { useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';
import { ModalWrapper } from '../ModalWrapper';

interface ColorPickerProps extends InputHTMLAttributes<HTMLInputElement> {
  initialColor: string;
  onUpdate: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ initialColor, onUpdate }) => {
  const [color, setColor] = useState(initialColor);
  const [finalColor, setFinalColor] = useState(initialColor);

  const [pickerVisible, setPickerVisible] = useState(false);

  const togglePicker = () => (pickerVisible ? setPickerVisible(false) : openTogglePicker());

  function openTogglePicker() {
    setColor(finalColor);

    setPickerVisible(true);
  }

  useEffect(() => {
    // Focus on color picker whenever it's opened (allows 'esc' keypress to work)
    document.getElementById('colorPickerWrapper')?.querySelector('input')?.focus();
  }, [pickerVisible]);

  return (
    <>
      <button
        onClick={togglePicker}
        id="colorPickerBtn"
        style={{ backgroundColor: finalColor }}
        onKeyDown={(e) => escEvent(e as unknown as KeyboardEvent, () => setPickerVisible(false))}
      />
      {pickerVisible && (
        <ModalWrapper
          parentMenu={Menu.SettingsMenu}
          id="colorPickerWrapper"
          className="frosted"
          onClose={() => setPickerVisible(false)}
          closeOnClickOutside
          ignoreGlobalClickOutsideExceptions
          clickOutsideExceptions={['#colorPickerBtn']}
        >
          <ChromePicker color={color} onChange={(e) => setColor(e.hex)} disableAlpha />
          {color !== initialColor && (
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
          )}
        </ModalWrapper>
      )}
    </>
  );
};
