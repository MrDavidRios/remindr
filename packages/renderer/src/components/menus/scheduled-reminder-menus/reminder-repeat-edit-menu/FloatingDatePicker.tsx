import calendar from "@assets/icons/calendar-date-picker.svg";
import { formatDate, Menu } from "@remindr/shared";
import { DatePicker } from "@renderer/components/date-picker/DatePicker";
import { ModalWrapper } from "@renderer/components/ModalWrapper";
import { useAppSelector } from "@renderer/hooks";
import React, { useState } from "react";

type FloatingDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  parentMenu: Menu;
  disabled: boolean;
};

const FloatingDatePicker: React.FC<FloatingDatePickerProps> = ({
  value,
  onChange,
  parentMenu,
  disabled,
}) => {
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);

  const toggleDatePicker = () =>
    datePickerVisible
      ? setDatePickerVisible(false)
      : setDatePickerVisible(true);

  return (
    <div id="floatingDatePickerWrapper">
      <button
        id="floatingDatePickerBtn"
        onClick={toggleDatePicker}
        disabled={disabled}
      >
        <img src={calendar} alt="date picker icon" />
        {formatDate(value, dateFormat)}
      </button>
      {datePickerVisible && (
        <ModalWrapper
          parentMenu={parentMenu}
          id="floatingDatePickerModal"
          className="frosted"
          onClose={() => setDatePickerVisible(false)}
          closeOnClickOutside
          ignoreGlobalClickOutsideExceptions
          clickOutsideExceptions={["#floatingDatePickerBtn"]}
        >
          <DatePicker
            date={value}
            onChange={(date) => {
              onChange(date);
              setDatePickerVisible(false);
            }}
          />
        </ModalWrapper>
      )}
    </div>
  );
};

export default FloatingDatePicker;
