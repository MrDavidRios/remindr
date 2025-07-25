import repeatIcon from "@assets/icons/repeat.svg";
import type { ScheduledReminder } from "@remindr/shared";
import {
  getScheduledReminderClone,
  getSimplifiedReadableRepeatValue,
} from "@remindr/shared";
import { AnimatePresence } from "framer-motion";
import type { FC } from "react";
import { useRef, useState } from "react";
import { RepeatIntervalsMenu } from "./RepeatIntervalsMenu";

interface RepeatIntervalPickerProps {
  reminder: ScheduledReminder;
  updateReminder: (reminder: ScheduledReminder) => void;
}

export const RepeatIntervalPicker: FC<RepeatIntervalPickerProps> = ({
  reminder,
  updateReminder,
}) => {
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
          if (e.key === "Tab") updateRepeatIntervalsMenuState(false);
        }}
        ref={ref}
        type="button"
      >
        <img src={repeatIcon} className="svg-filter" draggable="false" alt="" />
        <p id="repeatIntervalInputLabel">
          {getSimplifiedReadableRepeatValue(reminder)}
        </p>
        <AnimatePresence>
          {showRepeatIntervalsMenu && (
            <RepeatIntervalsMenu
              setShowRepeatIntervalsMenu={updateRepeatIntervalsMenuState}
              updateRepeatInfo={(repeatInfo) => {
                const scheduledReminderClone =
                  getScheduledReminderClone(reminder);
                scheduledReminderClone.repeatInfo = repeatInfo;
                updateReminder(scheduledReminderClone);
              }}
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
