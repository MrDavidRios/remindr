import checkIcon from '@assets/icons/check.svg';
import type { ScheduledReminder, Task } from '@remindr/shared';
import {
  delay,
  formatHour,
  formatMinute,
  getDate,
  getDefaultScheduledReminder,
  getFormattedReminderTime,
  getReminderDisplayDate,
  getScheduledReminderClone,
  Menu,
  militaryToStandardHour,
  setDate,
  standardToMilHour,
} from '@remindr/shared';
import { getTaskColumnIdx } from '@remindr/shared/src/utils';
import { DatePicker } from '@renderer/components/date-picker/DatePicker';
import { FloatingMenu } from '@renderer/components/floating-menu/FloatingMenu';
import { hideMenu, showDialog } from '@renderer/features/menu-state/menuSlice';
import { updateTask } from '@renderer/features/task-list/taskListSlice';
import { getEditedTask, setEditedTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { useDetectWheel } from '@renderer/scripts/utils/hooks/usedetectwheel';
import { useEscToClose } from '@renderer/scripts/utils/hooks/useesctoclose';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { RepeatIntervalPicker } from './RepeatIntervalPicker';
import { SuggestedTimePicker } from './SuggestedTimePicker';

export const ScheduledReminderEditMenu: FC = () => {
  const dispatch = useAppDispatch();
  const editedTask = useAppSelector((state) => getEditedTask(state.taskModificationState));

  const militaryTime = useAppSelector((state) => state.settings.value.militaryTime);
  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);

  const { anchor, yOffset, gap } = useAppSelector((state) => state.menuState.scheduledReminderEditorPosition);

  const taskEditType = useAppSelector((state) => state.taskModificationState.lastEditType);
  const reminderEditState = useAppSelector((state) => state.taskModificationState.reminderEditState);

  const creatingReminder = reminderEditState.state === 'create';
  const reminder: ScheduledReminder | undefined = editedTask?.scheduledReminders[reminderEditState.idx];

  const [updatedReminder, setUpdatedReminder] = useState<ScheduledReminder>(reminder ?? getDefaultScheduledReminder());

  function handleEditCompletion() {
    // Make updatedReminder serializable
    const updatedScheduledReminder = JSON.parse(JSON.stringify(updatedReminder)) as ScheduledReminder;

    const parsedHour = parseInt(hourInputState === '' ? '12' : hourInputState, 10);
    // If the hour is greater than 12, then it's military time. Otherwise, convert it to military time.
    const hourVal =
      parsedHour > 12 ? parsedHour : standardToMilHour(parsedHour, updatedScheduledReminder.reminderMeridiem);

    updatedScheduledReminder.reminderHour = hourVal;
    updatedScheduledReminder.reminderMinute = parseInt(minuteInputState === '' ? '0' : minuteInputState, 10);

    const duplicateReminder = editedTask?.scheduledReminders.find(
      (r: ScheduledReminder) =>
        getDate(r).getTime() === getDate(updatedScheduledReminder).getTime() && r.id !== updatedScheduledReminder.id,
    );

    if (duplicateReminder !== undefined) {
      // This will only happen if the user presses save repeatedly when creating. If this happens, just ignore the request.
      if (duplicateReminder.id === updatedScheduledReminder.id) return;

      const formattedTime = `${getReminderDisplayDate(
        updatedScheduledReminder,
        dateFormat,
        false,
        false,
        true,
      )} at ${getFormattedReminderTime(updatedScheduledReminder, militaryTime)}`;
      dispatch(
        showDialog({
          title: 'Duplicate Reminder',
          message: `You already have a reminder set for ${formattedTime}.`,
        }),
      );
      return;
    }

    const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
    editedTaskClone.scheduledReminders[reminderEditState.idx] = updatedScheduledReminder;

    editedTaskClone.columnIdx = getTaskColumnIdx(editedTaskClone);

    dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
    if (taskEditType === 'edit') dispatch(updateTask(editedTaskClone));

    dispatch(hideMenu({ menu: Menu.ScheduledReminderEditMenu }));
  }

  const onMenuClose = () => {
    if (!creatingReminder) return;

    const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
    editedTaskClone.scheduledReminders.splice(reminderEditState.idx, 1);

    dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
  };

  useEscToClose(dispatch, Menu.ScheduledReminderEditMenu);
  useHotkey(['mod+s'], handleEditCompletion, Menu.ScheduledReminderEditMenu);
  useDetectWheel({
    element: document.querySelector('.task-modification-interface') as HTMLElement | undefined,
    callback: () => {
      onMenuClose();

      dispatch(hideMenu({ menu: Menu.ScheduledReminderEditMenu, fromEscKeypress: true }));
    },
  });

  useEffect(() => {
    if (reminderEditState.idx === -1) return;

    setUpdatedReminder(reminder ?? getDefaultScheduledReminder());
  }, [reminderEditState]);

  useEffect(() => {
    const waitAndFocus = async () => {
      await delay(0);
      // Focus on the hour input when the scheduled reminder edit menu finishes rendering
      document.getElementById('hour')?.focus();
    };

    waitAndFocus();
  }, []);

  const militaryTimeEnabled = useAppSelector((state) => state.settings.value.militaryTime);

  const hour = militaryTimeEnabled
    ? updatedReminder.reminderHour
    : (militaryToStandardHour(updatedReminder.reminderHour) as number);

  const minHour = militaryTimeEnabled ? 0 : 1;
  const maxHour = militaryTimeEnabled ? 23 : 12;

  const [hourInputState, setHourInputState] = useState(formatHour(hour));
  const [minuteInputState, setMinuteInputState] = useState(formatMinute(updatedReminder.reminderMinute));

  useEffect(() => {
    setHourInputState(formatHour(hour));
  }, [hour]);

  useEffect(() => {
    setMinuteInputState(formatMinute(updatedReminder.reminderMinute));
  }, [updatedReminder.reminderMinute]);

  console.log('scheduled reminder edit menu re-render:', anchor, yOffset, gap);

  return (
    <FloatingMenu
      anchor={anchor}
      yOffset={yOffset}
      gap={gap}
      rightAlign={taskEditType === 'edit'}
      id="scheduledReminderEditMenu"
      className="frosted"
      clickOutsideExceptions={['.reminder-tile']}
      onClickOutside={() => {
        onMenuClose();
        dispatch(hideMenu({ menu: Menu.ScheduledReminderEditMenu, fromEscKeypress: true }));
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();

          handleEditCompletion();
        }
      }}
    >
      {/* Date Picker */}
      <DatePicker
        date={getDate(updatedReminder)}
        onChange={(date) => {
          let scheduledReminderClone = getScheduledReminderClone(updatedReminder);
          scheduledReminderClone = setDate(scheduledReminderClone, date, false);
          setUpdatedReminder(scheduledReminderClone);
        }}
      />

      {/* Time Input */}
      <div id="timeInputContainer" data-testid="time-input-container">
        <div id="timeInputWrapper">
          <SuggestedTimePicker reminder={updatedReminder} updateReminder={setUpdatedReminder} />
          <input
            type="number"
            placeholder="12"
            className="time-input"
            autoFocus
            id="hour"
            aria-label="reminder hour"
            value={hourInputState}
            onInput={digitNumberOnInput}
            onChange={(e) => {
              inputOnChangeHandler(e, minHour, maxHour, setHourInputState);
            }}
            onBlur={(e) => {
              const value = e.currentTarget.value === '' ? '12' : e.currentTarget.value;
              let hourVal = parseInt(value, 10);

              // Make sure hour doesn't go below minHour
              hourVal = hourVal < minHour ? minHour : hourVal;

              setHourInputState(formatHour(hourVal));
            }}
          />
          <p id="timeInputColon">:</p>
          <input
            type="number"
            placeholder="00"
            className="time-input"
            id="minute"
            aria-label="reminder minute"
            value={minuteInputState}
            onInput={digitNumberOnInput}
            onChange={(e) => {
              inputOnChangeHandler(e, 0, 59, setMinuteInputState);
            }}
            onBlur={(e) => {
              const value = e.currentTarget.value === '' ? '0' : e.currentTarget.value;
              const minuteVal = parseInt(value, 10);
              setMinuteInputState(formatHour(minuteVal));
            }}
          />
          <button
            id="meridiemInputText"
            onClick={() => {
              const scheduledReminderClone = getScheduledReminderClone(updatedReminder);
              scheduledReminderClone.reminderMeridiem = scheduledReminderClone.reminderMeridiem === 'AM' ? 'PM' : 'AM';
              setUpdatedReminder(scheduledReminderClone);
            }}
            type="button"
          >
            {updatedReminder.reminderMeridiem}
          </button>
        </div>

        <RepeatIntervalPicker reminder={updatedReminder} updateReminder={setUpdatedReminder} />

        <button
          id="saveTaskButton"
          className="action-button accessible-button"
          onClick={handleEditCompletion}
          type="button"
          aria-label="Save Changes"
        >
          <img
            src={checkIcon}
            className="svg-filter"
            draggable="false"
            title="Save Changes (Ctrl + S)"
            alt="Save Changes"
          />
        </button>
      </div>
    </FloatingMenu>
  );
};

function isEmptyHour(inputValue: string): boolean {
  return inputValue === '' || inputValue === '0' || inputValue === '00';
}

function inputOnChangeHandler(
  e: React.ChangeEvent<HTMLInputElement>,
  minVal: number,
  maxVal: number,
  setState: (value: string) => void,
) {
  if (e.currentTarget.value.length > 2) return;

  const filteredVal = e.currentTarget.value.replace(/\D/, '');
  const emptyHour = isEmptyHour(filteredVal);
  let hourVal = parseInt(emptyHour ? '0' : filteredVal, 10);

  if (hourVal < minVal) hourVal = minVal;
  if (hourVal > maxVal) return;

  setState(filteredVal);
}

const digitNumberOnInput = (e: React.FormEvent<HTMLInputElement>): void => {
  e.preventDefault();
  // Manually replace e, +, - with empty strings
  e.currentTarget.value = e.currentTarget.value.replace(/[e+-]/gi, '');
};
