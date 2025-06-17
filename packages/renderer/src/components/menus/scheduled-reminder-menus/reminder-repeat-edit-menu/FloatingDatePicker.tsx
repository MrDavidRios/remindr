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
  disablePastDays?: boolean;
};

const FloatingDatePicker: React.FC<FloatingDatePickerProps> = ({
  value,
  onChange,
  parentMenu,
  disabled,
  disablePastDays,
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
        aria-label="date picker"
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
            disablePastDays={disablePastDays}
          />
        </ModalWrapper>
      )}
    </div>
  );
};

export default FloatingDatePicker;
