import { FC, useState } from 'react';

interface BackgroundOpacitySliderProps {
  initialOpacity: number;
  onChange: (opacity: number) => void;
}

export const BackgroundOpacitySlider: FC<BackgroundOpacitySliderProps> = ({ initialOpacity, onChange }) => {
  const [backgroundOpacity, setBackgroundOpacity] = useState(1 - initialOpacity);
  const backgroundBrightnessPct = (1 - backgroundOpacity) * 100;

  return (
    <div className="slider" id="backgroundOpacitySlider">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={1 - backgroundOpacity}
        onChange={(e) => {
          setBackgroundOpacity(1 - e.currentTarget.valueAsNumber);
        }}
        onMouseUp={(e) => onChange(e.currentTarget.valueAsNumber)}
        onKeyUp={(e) => onChange(e.currentTarget.valueAsNumber)}
      />
      <p id="backgroundOpacitySliderValueLabel">{Math.round(backgroundBrightnessPct)}%</p>
    </div>
  );
};
