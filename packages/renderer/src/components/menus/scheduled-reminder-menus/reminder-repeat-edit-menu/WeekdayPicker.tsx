import { weekdays } from "@remindr/shared";
import { ArrowNavigable } from "@renderer/components/accessibility/ArrowNavigable";
import React from "react";

interface WeekdayPickerProps {
  selected: boolean[];
  onChange: (selected: boolean[]) => void;
  disabled: boolean;
}

export const WeekdayPicker: React.FC<WeekdayPickerProps> = ({
  selected,
  onChange,
  disabled,
}) => {
  const handleClick = (idx: number) => {
    const updated = [...selected];
    updated[idx] = !updated[idx];
    onChange(updated);
  };

  return (
    <ArrowNavigable
      className="weekday-picker"
      aria-label="Pick weekdays"
      role="group"
      leftRightNavigation
    >
      {weekdays.map((dayName, idx) => (
        <button
          key={dayName}
          title={dayName}
          aria-label={dayName}
          type="button"
          className={`weekday-btn${selected[idx] ? " selected" : ""}`}
          disabled={disabled}
          aria-pressed={selected[idx]}
          tabIndex={0}
          onClick={() => handleClick(idx)}
        >
          {dayName.slice(0, 2)}
        </button>
      ))}
    </ArrowNavigable>
  );
};
