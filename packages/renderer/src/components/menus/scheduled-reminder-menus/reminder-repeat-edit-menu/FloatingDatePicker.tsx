import React from "react";

type FloatingDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

const FloatingDatePicker: React.FC<FloatingDatePickerProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onChange(newDate);
    }
  };

  // Format date to yyyy-MM-dd for input value
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return (
    <input type="date" value={formatDate(value)} onChange={handleChange} />
  );
};

export default FloatingDatePicker;
