import { escEvent } from '@remindr/shared';
import type { InputHTMLAttributes } from 'react';
import { useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';
import useClickOutside from '/@/scripts/utils/hooks/useoutsideclick';

interface ColorPickerProps extends InputHTMLAttributes<HTMLInputElement> {
  // Add any additional props or overrides here
  initialColor: string;
  onUpdate: (color: string) => void;
}

export default function ColorPicker(props: ColorPickerProps) {
  const { initialColor, onUpdate } = props;

  const [color, setColor] = useState(initialColor);
  const [finalColor, setFinalColor] = useState(initialColor);

  const [isPickerVisible, setPickerVisible] = useState(false);

  const togglePicker = () => (isPickerVisible ? setPickerVisible(false) : openTogglePicker());
  const ref = useClickOutside(() => setPickerVisible(false), ['#colorPickerBtn']);

  function openTogglePicker() {
    setColor(finalColor);

    setPickerVisible(true);
  }

  useEffect(() => {
    // Focus on color picker whenever it's opened (allows 'esc' keypress to work)
    document.getElementById('colorPickerWrapper')?.querySelector('input')?.focus();
  }, [isPickerVisible]);

  return (
    <>
      <button
        onClick={togglePicker}
        id="colorPickerBtn"
        style={{ backgroundColor: finalColor }}
        onKeyDown={e => escEvent(e as unknown as KeyboardEvent, () => setPickerVisible(false))}
      />
      {isPickerVisible && (
        <div
          ref={ref as unknown as React.RefObject<HTMLDivElement>}
          id="colorPickerWrapper"
          onKeyDown={e => escEvent(e as unknown as KeyboardEvent, () => setPickerVisible(false))}
          className="frosted"
        >
          <ChromePicker
            color={color}
            onChange={e => setColor(e.hex)}
            disableAlpha
          />
          {color !== initialColor && (
            <div className="action-bar">
              <button onClick={() => setPickerVisible(false)}>Cancel</button>
              <button
                onClick={() => {
                  setFinalColor(color);

                  setColor(color);

                  onUpdate(color);
                  setPickerVisible(false);
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

ColorPicker.defaultProps = {
  setting: '',
};
