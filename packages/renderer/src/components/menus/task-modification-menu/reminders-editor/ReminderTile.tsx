import calendarIcon from '@assets/icons/calendar-time.svg';
import deleteIcon from '@assets/icons/plus-thin.svg';
import repeatIcon from '@assets/icons/repeat.svg';
import type { DateFormat, MenuRect, ScheduledReminder } from '@remindr/shared';
import { getFormattedReminderTime, getReminderDisplayDate, isOverdue, reminderRepeats, Repeat } from '@remindr/shared';
import { convertDOMRectToMenuRect } from '@renderer/scripts/utils/menuutils';
import { delay } from '@renderer/scripts/utils/timing';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

interface ReminderTileProps {
  reminder: ScheduledReminder;
  dateFormat: DateFormat;
  militaryTime: boolean;
  onEditReminder: (anchor?: MenuRect) => void;
  onDeleteReminder: () => void;
}

export const ReminderTile: FC<ReminderTileProps> = ({
  reminder,
  dateFormat,
  militaryTime,
  onEditReminder,
  onDeleteReminder,
}) => {
  const tileRef = useRef<HTMLLIElement>(null);
  const tileRect = convertDOMRectToMenuRect(tileRef.current?.getBoundingClientRect());

  const displayText = `${getReminderDisplayDate(reminder, dateFormat, false)} at ${getFormattedReminderTime(
    reminder,
    militaryTime,
  )}`;

  const [showActionButtons, setShowActionButtons] = useState(false);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const [actionButtonsWidth, setActionButtonsWidth] = useState(0);

  useEffect(() => {
    setActionButtonsWidth(actionButtonsRef.current?.getBoundingClientRect().width ?? 0);
  }, [showActionButtons]);

  return (
    <li
      ref={tileRef}
      className="reminder-tile"
      onClick={() => onEditReminder(tileRect)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onEditReminder(tileRect);
      }}
      onMouseEnter={() => setShowActionButtons(true)}
      onFocusCapture={() => setShowActionButtons(true)}
      onMouseLeave={() => setShowActionButtons(false)}
      style={{
        gridTemplateColumns: showActionButtons
          ? `calc(100% - ${actionButtonsWidth}px) ${actionButtonsWidth}px`
          : '100%',
      }}
      onBlur={async () => {
        await delay(0);

        if (actionButtonsRef.current?.contains(document.activeElement)) return;
        setShowActionButtons(false);
      }}
      tabIndex={0}
      title={displayText}
    >
      <div>
        <img src={calendarIcon} alt="" draggable={false} />
        <p className={`${isOverdue(reminder) ? 'overdue' : ''}`}>{displayText}</p>
        {/* Repeat indicator */}
        {reminderRepeats(reminder) && (
          <img
            className="repeat-indicator svg-filter"
            src={repeatIcon}
            draggable="false"
            title={`Repeats ${Repeat[reminder.repeat]}`}
            style={{ paddingRight: 6 }}
            alt=""
          />
        )}
      </div>
      {showActionButtons && (
        <div
          ref={actionButtonsRef}
          className="action-buttons"
          // Prevents a flicker when transitioning from invisible to visible action buttons
          style={{ visibility: actionButtonsWidth > 0 ? 'visible' : 'hidden' }}
        >
          <button
            className="action-button accessible-button"
            onKeyDown={(e) => {
              e.stopPropagation();

              if (e.key === 'Enter' || e.key === ' ') onDeleteReminder();
            }}
            onClick={(e) => {
              e.stopPropagation();

              onDeleteReminder();
            }}
            type="button"
          >
            <img
              src={deleteIcon}
              className="action-button svg-filter"
              draggable={false}
              title="Delete Reminder"
              alt="Delete Reminder"
              style={{ transform: 'rotate(45deg)' }}
            />
          </button>
        </div>
      )}
    </li>
  );
};
