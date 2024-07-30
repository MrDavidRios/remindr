import { AnimatePresence } from 'framer-motion';
import { Repeat, ScheduledReminder } from 'main/types/classes/task/scheduledReminder';
import { FC, useRef, useState } from 'react';
import { getScheduledReminderClone } from 'renderer/scripts/utils/scheduledreminderfunctions';
import repeatIcon from '../../../../../../assets/icons/repeat.svg';
import { RepeatIntervalsMenu } from './RepeatIntervalsMenu';

interface RepeatIntervalPickerProps {
  reminder: ScheduledReminder;
  updateReminder: (reminder: ScheduledReminder) => void;
}

export const RepeatIntervalPicker: FC<RepeatIntervalPickerProps> = ({ reminder, updateReminder }) => {
  const [showRepeatIntervalsMenu, setShowRepeatIntervalsMenu] = useState(false);

  // When dropdown menu closes, restore focus to parent button
  function updateRepeatIntervalsMenuState(show: boolean) {
    setShowRepeatIntervalsMenu(show);

    if (!show) ref.current?.focus();
  }

  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div id="repeatIntervalInputButton">
      <button
        aria-label="Change repeat interval"
        onClick={() => updateRepeatIntervalsMenuState(!showRepeatIntervalsMenu)}
        onKeyDown={(e) => {
          if (e.key === 'Tab') updateRepeatIntervalsMenuState(false);
        }}
        ref={ref}
        type="button"
      >
        <img src={repeatIcon} className="svg-filter" draggable="false" alt="" />
        <p id="repeatIntervalInputLabel">{Repeat[reminder.repeat]}</p>
        <AnimatePresence>
          {showRepeatIntervalsMenu && (
            <RepeatIntervalsMenu
              setShowRepeatIntervalsMenu={updateRepeatIntervalsMenuState}
              updateRepeatInterval={(repeatInterval) => {
                const scheduledReminderClone = getScheduledReminderClone(reminder);
                scheduledReminderClone.repeat = repeatInterval;
                updateReminder(scheduledReminderClone);
              }}
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
