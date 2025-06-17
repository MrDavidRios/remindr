import {
  FrequencyType,
  frequencyTypeToPluralNoun,
  IntervalFrequencyType,
  Menu,
} from "@remindr/shared";
import { Dropdown } from "@renderer/components/dropdown/Dropdown";
import React from "react";

interface FrequencyTypeDropdownProps {
  value: IntervalFrequencyType;
  onSelect: (value: IntervalFrequencyType) => void;
  disabled: boolean;
  plural: boolean;
}

const options: IntervalFrequencyType[] = Object.values(FrequencyType).filter(
  (type) => type !== FrequencyType.Never && type !== FrequencyType.Weekdays
);

const FrequencyTypeDropdown: React.FC<FrequencyTypeDropdownProps> = ({
  value,
  onSelect,
  disabled,
  plural,
}) => {
  return (
    <Dropdown
      parentMenu={Menu.ReminderRepeatEditMenu}
      name="repeatFrequencyType"
      options={options}
      optionLabels={options.map((intervalFrequencyType) => {
        const noun = frequencyTypeToPluralNoun[intervalFrequencyType];
        return plural ? noun : noun.slice(0, -1);
      })}
      selectedIdx={options.indexOf(value)}
      onSelect={(idx: number) => {
        const selectedFrequencyType = options[idx];
        onSelect(selectedFrequencyType);
      }}
      disabled={disabled}
    />
  );
};

export default FrequencyTypeDropdown;
