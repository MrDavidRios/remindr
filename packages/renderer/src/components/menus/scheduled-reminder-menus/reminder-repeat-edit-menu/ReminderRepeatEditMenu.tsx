// State needed for reminder repeat edit menu:
// task modification slice -> reminder edit state (we're modifying a reminder)
// reminder repeat edit menu open state

import {
  FrequencyType,
  getDefaultScheduledReminder,
  getScheduledReminderClone,
  IntervalFrequencyType,
  isIntervalFrequencyType,
  Menu,
  RepeatDurationType,
  RepeatInfo,
  ScheduledReminder,
  Task,
} from "@remindr/shared";
import { CloseMenuButton } from "@renderer/components/close-menu-button/CloseMenuButton";
import { hideMenu, showDialog } from "@renderer/features/menu-state/menuSlice";
import { updateTask } from "@renderer/features/task-list/taskListSlice";
import {
  getEditedTask,
  setEditedTask,
  setReminderEditState,
} from "@renderer/features/task-modification/taskModificationSlice";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { useHotkey } from "@renderer/scripts/utils/hooks/usehotkey";
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
  const taskEditType = useAppSelector(
    (state) => state.taskModificationState.lastEditType
  );
  const reminderEditState = useAppSelector(
    (state) => state.taskModificationState.reminderEditState
  );
  const reminder: ScheduledReminder =
    editedTask?.scheduledReminders[reminderEditState.idx] ??
    getDefaultScheduledReminder();

  const handleSaveClick = () => {
    const getDuration = () => {
      if (durationOption === RepeatDurationType.Date) {
        return repeatEndDateTimestamp;
      } else if (durationOption === RepeatDurationType.FixedAmount) {
        return durationCount;
      }

      return undefined;
    };

    const noWeekdaysSelected = pickedWeekdays.every(
      (daySelected) => !daySelected
    );
    if (frequencyOption === "weekdays" && noWeekdaysSelected) {
      dispatch(
        showDialog({
          title: "Select Weekdays",
          message: "Please pick at least one weekday to continue.",
        })
      );
      return;
    }

    const repeatInfo = new RepeatInfo({
      frequencyType:
        frequencyOption === "weekdays" ? FrequencyType.Weekdays : frequencyType,
      frequency:
        frequencyOption === "weekdays" ? pickedWeekdays : repeatInterval,
      durationType: durationOption,
      duration: getDuration(),
    });
    const serializedRepeatInfo = JSON.parse(
      JSON.stringify(repeatInfo)
    ) as RepeatInfo;

    // Create a new reminder with the updated repeat info
    const updatedReminder = getScheduledReminderClone(reminder);
    updatedReminder.repeatInfo = serializedRepeatInfo;
    const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
    editedTaskClone.scheduledReminders[reminderEditState.idx] = updatedReminder;

    dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
    dispatch(setReminderEditState(reminderEditState));

    if (taskEditType === "edit") {
      dispatch(updateTask(editedTaskClone));
    }

    dispatch(hideMenu({ menu: Menu.ReminderRepeatEditMenu }));
  };

  useHotkey(["mod+s"], handleSaveClick, Menu.ReminderRepeatEditMenu);

  const [frequencyOption, setFrequencyOption] = useState<
    "fixedInterval" | "weekdays"
  >(
    isIntervalFrequencyType(reminder.repeatInfo?.frequencyType) ||
      reminder.repeatInfo?.frequencyType === FrequencyType.Never
      ? "fixedInterval"
      : "weekdays"
  );

  const reminderFrequency = reminder.repeatInfo?.frequency ?? 1;
  const [repeatInterval, setRepeatInterval] = useState<number>(
    typeof reminderFrequency === "number" ? reminderFrequency : 1
  );
  const repeatIntervalType =
    !isIntervalFrequencyType(reminder.repeatInfo?.frequencyType) ||
    reminder.repeatInfo?.frequencyType === undefined
      ? FrequencyType.FixedIntervalDays
      : reminder.repeatInfo?.frequencyType;
  const [frequencyType, setFrequencyType] =
    useState<IntervalFrequencyType>(repeatIntervalType);
  const [pickedWeekdays, setPickedWeekdays] = useState(
    typeof reminder.repeatInfo?.frequency !== "number" &&
      reminder.repeatInfo?.frequency !== undefined
      ? reminder.repeatInfo?.frequency
      : [false, false, false, false, false, false, false]
  );

  const [durationOption, setDurationOption] = useState<RepeatDurationType>(
    reminder.repeatInfo?.durationType ?? RepeatDurationType.Forever
  );
  const [durationCount, setDurationCount] = useState<number>(
    reminder.repeatInfo?.duration !== undefined &&
      reminder.repeatInfo?.durationType === RepeatDurationType.FixedAmount
      ? reminder.repeatInfo?.duration
      : 1
  );
  const [repeatEndDateTimestamp, setRepeatEndDateTimestamp] = useState<number>(
    reminder.repeatInfo?.durationType === RepeatDurationType.Date &&
      reminder.repeatInfo?.duration !== undefined
      ? reminder.repeatInfo.duration
      : new Date().getTime()
  );

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
              defaultValue={
                typeof reminderFrequency === "number" ? reminderFrequency : 1
              }
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
              onSelect={(freqType) => {
                console.log("Selected frequency type:", freqType);
                setFrequencyType(freqType);
              }}
              disabled={frequencyOption !== "fixedInterval"}
              plural={repeatInterval > 1}
            />
          </label>
          <div>
            <label id="weekdayPickerLabel">
              <input
                type="radio"
                name="frequency"
                value="weekdays"
                checked={frequencyOption === "weekdays"}
                onChange={() => setFrequencyOption("weekdays")}
              />
              <p>Weekdays</p>
            </label>
            <div id="weekdayPickerWrapper">
              <WeekdayPicker
                selected={pickedWeekdays}
                onChange={setPickedWeekdays}
                disabled={frequencyOption !== "weekdays"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="reminder-repeat-edit-menu-radio-group radio-group">
        <h4>Duration</h4>
        <div className="options">
          <label>
            <input
              type="radio"
              name="duration"
              value={RepeatDurationType.Forever}
              checked={durationOption === RepeatDurationType.Forever}
              onChange={() => setDurationOption(RepeatDurationType.Forever)}
            />
            <p>Forever</p>
          </label>
          <label>
            <input
              type="radio"
              name="duration"
              value={RepeatDurationType.FixedAmount}
              checked={durationOption === RepeatDurationType.FixedAmount}
              onChange={() => setDurationOption(RepeatDurationType.FixedAmount)}
            />
            <input
              type="number"
              className="frequency-input"
              min={1}
              max={1000}
              defaultValue={durationCount}
              disabled={durationOption !== RepeatDurationType.FixedAmount}
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
              value={RepeatDurationType.Date}
              checked={durationOption === RepeatDurationType.Date}
              onChange={() => setDurationOption(RepeatDurationType.Date)}
            />
            <p>Until</p>
            <FloatingDatePicker
              value={new Date(repeatEndDateTimestamp)}
              onChange={(date) => setRepeatEndDateTimestamp(date.getTime())}
              parentMenu={Menu.ReminderRepeatEditMenu}
              disabled={durationOption !== RepeatDurationType.Date}
              disablePastDays
            />
          </label>
        </div>
      </div>
      <button
        className={`primary-button`}
        onClick={handleSaveClick}
        type="button"
      >
        Save Changes
      </button>
    </FullScreenMenu>
  );
};
