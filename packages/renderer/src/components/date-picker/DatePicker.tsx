import doubleExpandArrowIcon from '@assets/icons/double-expand-arrow.png';
import expandArrowIcon from '@assets/icons/expand-arrow.png';
import { addMonths, getDayNameFromIdx, getDaysInMonth, getMonthName, subtractMonths } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import React, { useEffect, useState } from 'react';
import { Day } from './Day';

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ date, onChange }) => {
  const [dateView, setDateView] = useState(date);
  const firstDayOfWeek = useAppSelector((state) => state.settings.value.weekStartDay ?? 0);

  const daysArray = getDaysArray(dateView, firstDayOfWeek);
  const cols = 7;
  const rows = Math.ceil(daysArray.length / cols);

  const dayRefs = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => React.createRef<HTMLButtonElement>()),
  );

  const changeMonthAndFocus = (newDate: Date, firstDay: boolean): void => {
    const newDaysArray = getDaysArray(newDate, firstDayOfWeek);
    const dayIdx = firstDay ? getFirstValidDayIdx(newDaysArray) : getLastValidDayIdx(newDaysArray);

    setDateView(newDate);
    setFocusedDayIdx(dayIdx);
  };

  const getLastValidDayIdx = (customDaysArray?: number[]) => {
    const days = customDaysArray ?? daysArray;
    return days.length - 1;
  };

  const getFirstValidDayIdx = (customDaysArray?: number[]) => {
    const days = customDaysArray ?? daysArray;
    return days.findIndex((day) => day !== -1);
  };

  const [focusedDayIdx, setFocusedDayIdx] = useState<number>(-1);

  useEffect(() => {
    if (focusedDayIdx === -1) return;

    const i = Math.floor(focusedDayIdx / cols);
    const j = focusedDayIdx % cols;

    dayRefs[i][j].current?.focus();
  }, [focusedDayIdx]);

  return (
    <div id="datePicker" className="dates">
      <div className="calendar-controls">
        <button
          className="arrows prev-yr left"
          title="Previous year"
          onClick={() => setDateView(new Date(dateView.getFullYear() - 1, dateView.getMonth(), 1))}
          type="button"
          aria-label="Previous year"
        >
          <img src={doubleExpandArrowIcon} draggable="false" alt="" />
        </button>
        <button
          className="arrows prev-mth left"
          title="Previous month"
          onClick={() => setDateView(subtractMonths(dateView, 1))}
          type="button"
          aria-label="Previous month"
        >
          <img src={expandArrowIcon} draggable="false" alt="" />
        </button>
        <button
          className="month-year"
          title="Reset to current month"
          onClick={() => setDateView(new Date())}
          type="button"
          aria-label="Reset to current month"
        >
          {`${getMonthName(dateView, false)} ${dateView.getFullYear()}`}
        </button>
        <button
          className="arrows next-mth right"
          title="Next month"
          onClick={() => setDateView(addMonths(dateView, 1))}
          type="button"
          aria-label="Next month"
        >
          <img src={expandArrowIcon} draggable="false" alt="" />
        </button>
        <button
          className="arrows next-yr right"
          title="Next year"
          onClick={() => setDateView(new Date(dateView.getFullYear() + 1, dateView.getMonth(), 1))}
          type="button"
          aria-label="Next year"
        >
          <img src={doubleExpandArrowIcon} draggable="false" alt="" />
        </button>
      </div>
      <div className="weekdays">
        {Array.from({ length: 7 }, (_, i) => i).map((day) => {
          const dayName = getDayNameFromIdx(day, firstDayOfWeek);

          return (
            <div className="day" key={dayName}>
              {dayName}
            </div>
          );
        })}
      </div>
      <div className="days">
        {dayRefs.map((row, i) =>
          row.map((ref, j) => {
            const dayIdx = i * cols + j;
            const day = daysArray[dayIdx];
            const dayName = getDayNameFromIdx(dayIdx, firstDayOfWeek);

            return (
              <Day
                key={`${dayName}-${day ?? -1}`}
                viewDate={dateView}
                selectedDate={date}
                day={day}
                ref={ref}
                onClick={() => {
                  const newDate = new Date(dateView.getFullYear(), dateView.getMonth(), day);

                  onChange(newDate);
                }}
                onKeyDown={(e) => {
                  let newI = i;
                  let newJ = j;

                  const atTopBorder = i === 0;
                  const atRightBorder = j === cols - 1;
                  const atBottomBorder = i === rows - 1;
                  const atLeftBorder = j === 0;

                  const onFirstDay = dayIdx === getFirstValidDayIdx();
                  const onLastDay = dayIdx === getLastValidDayIdx();

                  if (e.key === 'ArrowUp' || e.key === 'w') {
                    newI = i > 0 ? i - 1 : i;
                  } else if (e.key === 'ArrowDown' || e.key === 's') {
                    newI = i < rows - 1 ? i + 1 : i;
                  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
                    // Going left
                    newJ = j > 0 ? j - 1 : j;

                    if (onFirstDay) {
                      const newDate = subtractMonths(dateView, 1);
                      changeMonthAndFocus(newDate, false);
                      return;
                    }

                    if (atLeftBorder) {
                      newJ = cols - 1;
                      newI = i - 1;

                      if (atTopBorder) {
                        newI = rows - 1;
                      }
                    }
                  } else if (e.key === 'ArrowRight' || e.key === 'd') {
                    // Going right
                    newJ = j < cols - 1 ? j + 1 : j;

                    if (onLastDay) {
                      const newDate = addMonths(dateView, 1);
                      changeMonthAndFocus(newDate, true);
                      return;
                    }

                    if (atRightBorder) {
                      newJ = 0;
                      newI = i + 1;

                      if (atBottomBorder) {
                        newI = 0;
                      }
                    }
                  }

                  const newDayIdx = newI * cols + newJ;
                  const newDayValue = daysArray[newDayIdx];
                  if (newDayValue === -1 || newDayValue === undefined) return;

                  setFocusedDayIdx(newDayIdx);
                }}
              />
            );
          }),
        )}
      </div>
    </div>
  );
};

function getDaysArray(date: Date, firstDayOfWeek: number) {
  const daysInMonth = getDaysInMonth(date);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  // prepend empty days
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  if (firstDayOfMonth === firstDayOfWeek) return daysArray;

  let steps = 0;
  for (let i = 0; i < 7; i++) {
    const correspondingDayIdx = (i + firstDayOfWeek) % 7;
    if (correspondingDayIdx === firstDayOfMonth) {
      break;
    }
    steps++;
  }

  // offset first day by diff. between the day idx and the first day of the week
  for (let i = 0; i < steps; i++) {
    daysArray.unshift(-1);
  }

  return daysArray;
}
