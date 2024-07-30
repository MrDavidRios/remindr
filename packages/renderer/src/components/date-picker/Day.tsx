import { getMonthName } from 'main/utils/datefunctions';
import React from 'react';

interface DayProps extends React.HTMLProps<HTMLButtonElement> {
  day: number;
  viewDate: Date;
  selectedDate: Date;
}

export const Day = React.forwardRef<HTMLButtonElement, DayProps>(
  ({ day = -1, viewDate, selectedDate, onClick, onKeyDown }, ref) => {
    const dateWithDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const isToday = dateWithDay.toDateString() === new Date().toDateString();

    // creates a new Date object representing the current date at midnight to compare
    const dateInPast = dateWithDay < new Date(new Date().setHours(0, 0, 0, 0));
    const selected = selectedDate.toDateString() === dateWithDay.toDateString();
    const uninteractable = day === -1;

    // selected day in different month
    const additionalClasses = `${dateInPast ? 'old' : 'new'} ${selected ? 'selected' : ''} ${isToday ? 'today' : ''}
    `;
    const classes = `day ${uninteractable ? 'uninteractable' : additionalClasses}`;

    const diffMonthSelected = selectedDate.getMonth() !== dateWithDay.getMonth();
    const tabbable = (diffMonthSelected && day === 1) || selected;

    return (
      <button
        ref={ref}
        className={classes}
        aria-label={`${getMonthName(dateWithDay, false)} ${day}, ${dateWithDay.getFullYear()}`}
        onClick={(e) => {
          if (onClick && !uninteractable) onClick(e);
        }}
        onKeyDown={(e) => {
          if (onKeyDown === undefined || uninteractable) return;

          // Enter is used as a key to save scheduled reminder changes.
          // Make sure that here, it's used for the date picker specifically, not to save the scheduled reminder edit changes.
          if (e.key === 'Enter') e.stopPropagation();

          onKeyDown(e);
        }}
        tabIndex={tabbable ? 0 : -1}
        type="button"
      >
        {uninteractable ? '' : day}
      </button>
    );
  },
);
