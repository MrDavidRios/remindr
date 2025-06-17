// State needed for reminder repeat edit menu:
// task modification slice -> reminder edit state (we're modifying a reminder)
// reminder repeat edit menu open state

import {
  FrequencyType,
  IntervalFrequencyType,
  isIntervalFrequencyType,
  Menu,
  ScheduledReminder,
} from "@remindr/shared";
import { CloseMenuButton } from "@renderer/components/close-menu-button/CloseMenuButton";
import { getEditedTask } from "@renderer/features/task-modification/taskModificationSlice";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { FC, useState } from "react";
import { FullScreenMenu } from "../../fullscreen-menu/FullScreenMenu";
import FloatingDatePicker from "./FloatingDatePicker";
import FrequencyTypeDropdown from "./FrequencyTypeDropdown";
import { WeekdayPicker } from "./WeekdayPicker";

export const ReminderRepeatEditMenu: FC = () => {
  const dispatch = useAppDispatch();
  const editedTask = useAppSelector((state) =>
    getEditedTask(state.taskModificationState)
  );
  const reminderEditState = useAppSelector(
    (state) => state.taskModificationState.reminderEditState
  );

  const handleSaveClick = () => {
    throw new Error("Not implemented");
  };

  const reminder: ScheduledReminder | undefined =
    editedTask?.scheduledReminders[reminderEditState.idx];
  const [frequencyOption, setFrequencyOption] = useState<
    "fixedInterval" | "weekdays"
  >("fixedInterval");

  const reminderFrequency = reminder?.repeatInfo?.frequency ?? 1;
  const [repeatInterval, setRepeatInterval] = useState<number>(
    typeof reminderFrequency === "number" ? reminderFrequency : 1
  );
  const repeatIntervalType =
    !isIntervalFrequencyType(reminder?.repeatInfo?.frequencyType) ||
    reminder?.repeatInfo?.frequencyType === undefined
      ? FrequencyType.FixedIntervalDays
      : reminder?.repeatInfo?.frequencyType;
  const [frequencyType, setFrequencyType] =
    useState<IntervalFrequencyType>(repeatIntervalType);
  const [pickedWeekdays, setPickedWeekdays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [durationOption, setDurationOption] = useState<
    "forever" | "fixedAmount" | "date"
  >("forever");
  const [durationCount, setDurationCount] = useState<number>(1);

  return (
    <FullScreenMenu
      modal
      menuType={Menu.ReminderRepeatEditMenu}
      className="menu"
      id="reminderRepeatEditMenu"
    >
      <div className="titlebar">
        <div>
          <h3>Custom Repeat</h3>
        </div>
        <CloseMenuButton />
      </div>
      <div className="reminder-repeat-edit-menu-radio-group radio-group">
        <h4>Frequency</h4>
        <div className="options">
          <label className="radio-label-inline">
            <input
              type="radio"
              name="frequency"
              value="fixedInterval"
              checked={frequencyOption === "fixedInterval"}
              onChange={() => setFrequencyOption("fixedInterval")}
            />
            <p>Repeats every</p>
            <input
              type="number"
              className="frequency-input"
              min={1}
              max={1000}
              defaultValue={1}
              disabled={frequencyOption !== "fixedInterval"}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) {
                  // Dispatch action to update the interval in the reminder
                  setRepeatInterval(value);
                }
              }}
            />
            <FrequencyTypeDropdown
              value={frequencyType}
              onSelect={setFrequencyType}
              disabled={frequencyOption !== "fixedInterval"}
              plural={repeatInterval > 1}
            />
          </label>
          <label id="weekdayPickerLabel">
            <input
              type="radio"
              name="frequency"
              value="weekdays"
              checked={frequencyOption === "weekdays"}
              onChange={() => setFrequencyOption("weekdays")}
            />
            <div id="weekdayPickerWrapper">
              <p>Weekdays</p>
              <WeekdayPicker
                selected={pickedWeekdays}
                onChange={setPickedWeekdays}
                disabled={frequencyOption !== "weekdays"}
              />
            </div>
          </label>
        </div>
      </div>
      <div className="reminder-repeat-edit-menu-radio-group radio-group">
        <h4>Duration</h4>
        <div className="options">
          <label>
            <input
              type="radio"
              name="duration"
              value="forever"
              checked={durationOption === "forever"}
              onChange={() => setDurationOption("forever")}
            />
            <p>Forever</p>
          </label>
          <label>
            <input
              type="radio"
              name="duration"
              value="fixedAmount"
              checked={durationOption === "fixedAmount"}
              onChange={() => setDurationOption("fixedAmount")}
            />
            <input
              type="number"
              className="frequency-input"
              min={1}
              max={1000}
              defaultValue={1}
              disabled={durationOption !== "fixedAmount"}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) {
                  // Dispatch action to update the interval in the reminder
                  setDurationCount(value);
                }
              }}
            />
            <p>{durationCount > 1 ? "reminders" : "reminder"}</p>
          </label>
          <label>
            <input
              type="radio"
              name="duration"
              value="date"
              checked={durationOption === "date"}
              onChange={() => setDurationOption("date")}
            />
            <p>Until date</p>
            <FloatingDatePicker value={new Date()} onChange={() => {}} />
          </label>
        </div>
      </div>
      {/*(${disableButton ? 'disabled' : ''}*/}
      <button
        className={`primary-button`}
        onClick={handleSaveClick}
        type="button"
      >
        Save
      </button>
    </FullScreenMenu>
  );
};
