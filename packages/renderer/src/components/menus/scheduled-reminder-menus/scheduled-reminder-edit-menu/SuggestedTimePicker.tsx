import { AnimatePresence } from 'framer-motion';
import { ScheduledReminder } from 'main/types/classes/task/scheduledReminder';
import { setDate } from 'main/utils/reminderfunctions';
import { FC, useRef, useState } from 'react';
import { getScheduledReminderClone } from 'renderer/scripts/utils/scheduledreminderfunctions';
import alarmIcon from '../../../../../../assets/icons/alarm.svg';
import { SuggestedTimesMenu } from './SuggestedTimesMenu';

interface SuggestedTimePickerProps {
  reminder: ScheduledReminder;
  updateReminder: (reminder: ScheduledReminder) => void;
}

export const SuggestedTimePicker: FC<SuggestedTimePickerProps> = ({ reminder, updateReminder }) => {
  const [showSuggestedTimesMenu, setShowSuggestedTimesMenu] = useState(false);

  // When dropdown menu closes, restore focus to parent button
  function updateSuggestedTimesMenuState(show: boolean) {
    setShowSuggestedTimesMenu(show);

    if (!show) ref.current?.focus();
  }

  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      id="suggestedTimesInputButton"
      aria-label="Pick a suggested time"
      onClick={() => updateSuggestedTimesMenuState(!showSuggestedTimesMenu)}
      onKeyDown={(e) => {
        if (e.key === 'Tab') updateSuggestedTimesMenuState(false);
      }}
      ref={ref}
      type="button"
    >
      <img src={alarmIcon} className="svg-filter" draggable="false" alt="" />
      <AnimatePresence>
        {showSuggestedTimesMenu && (
          <SuggestedTimesMenu
            setShowSuggestedTimesMenu={updateSuggestedTimesMenuState}
            updateSuggestedTime={(date) => {
              let scheduledReminderClone = getScheduledReminderClone(reminder);
              scheduledReminderClone = setDate(scheduledReminderClone, date);
              updateReminder(scheduledReminderClone);
            }}
          />
        )}
      </AnimatePresence>
    </button>
  );
};
