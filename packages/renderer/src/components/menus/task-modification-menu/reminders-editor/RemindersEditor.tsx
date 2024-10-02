import reminderIcon from '@assets/icons/bell.svg';
import plusIcon from '@assets/icons/plus.svg';
import type { MenuRect, Task } from '@remindr/shared';
import { generateUniqueID, getDefaultScheduledReminder, Menu, sortReminders } from '@remindr/shared';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { hideMenu, setFloatingMenuPosition, showMenu } from '@renderer/features/menu-state/menuSlice';
import { updateTask } from '@renderer/features/task-list/taskListSlice';
import {
  getEditedTask,
  setEditedTask,
  setReminderEditState,
} from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch, useAppSelector, useAppStore } from '@renderer/hooks';
import { convertDOMRectToMenuRect, isMenuOpen } from '@renderer/scripts/utils/menuutils';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useRef, useState } from 'react';
import { ReminderTile } from './ReminderTile';

interface RemindersEditorProps {}

export const RemindersEditor: FC<RemindersEditorProps> = () => {
  const dispatch = useAppDispatch();
  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);
  const militaryTime = useAppSelector((state) => state.settings.value.militaryTime);

  const currentlyEditedReminderIdx = useAppSelector((state) => state.taskModificationState.reminderEditState.idx);

  const [hoveringOverEditorHeader, setHoveringOverEditorHeader] = useState(false);

  const store = useAppStore();

  const editorRef = useRef<HTMLDivElement>(null);

  // Gap (px) between reminder tiles
  const gap = 6;

  const editedTask = useAppSelector((state) => getEditedTask(state.taskModificationState));
  if (!editedTask) return null;

  const openReminderEditMenu = (anchor?: MenuRect, idx = -1, additionalOffset = 0, creatingReminder = false) => {
    // If the scheduled reminder edit menu is already open with the same reminder, close it.
    if (isMenuOpen(store.getState().menuState, Menu.ScheduledReminderEditMenu) && currentlyEditedReminderIdx === idx) {
      dispatch(hideMenu({ menu: Menu.ScheduledReminderEditMenu }));
      return;
    }

    const editorRect = convertDOMRectToMenuRect(editorRef.current?.getBoundingClientRect());
    const usableAnchor: MenuRect | undefined = anchor ?? editorRect;

    if (usableAnchor === undefined) {
      throw new Error('[openReminderEditMenu]: usable anchor is undefined');
    }

    dispatch(setReminderEditState({ idx, state: creatingReminder ? 'create' : 'edit' }));
    dispatch(showMenu(Menu.ScheduledReminderEditMenu));

    // Apply this offset if the anchor is editor rect, which does not take the height of the header into account.
    // Only relevant if the menu is top-anchored.
    const reminderEditorHeaderOffset = !anchor ? (editorRect?.height ?? 0) - 26 : 0;

    const taskModificationInterface = document.querySelector('.task-modification-interface');

    const scrollTopBefore = taskModificationInterface?.scrollTop ?? 0;

    // If creating a new reminder, scroll to the nearest reminder tile (if one exists) to make sure that it's in view
    if (creatingReminder) {
      const remindersContainer = editorRef.current?.querySelector('.reminders-container') as HTMLElement | null;
      const nearestReminderTile = remindersContainer?.querySelector(
        `.reminder-tile:nth-child(${idx})`,
      ) as HTMLElement | null;

      nearestReminderTile?.scrollIntoView();
    }

    const scrollTopAfter = taskModificationInterface?.scrollTop ?? 0;

    // Make sure the scheduled reminder edit menu takes the new scroll position into its yOffset
    // ==
    // This is because the anchor position is recorded before scrolling. Factoring in the scroll height difference
    // allows the menu to be positioned correctly even after scrolling.
    const scrollTopDiff = scrollTopAfter - scrollTopBefore;

    dispatch(
      setFloatingMenuPosition({
        menu: Menu.ScheduledReminderEditMenu,
        positionInfo: {
          anchor: usableAnchor,
          yOffset: {
            topAnchored: scrollTopDiff + additionalOffset - reminderEditorHeaderOffset,
            bottomAnchored: scrollTopDiff + (creatingReminder ? -42 : 0),
          },
          gap,
        },
      }),
    );
  };

  // Sort the scheduled reminders of the edited task
  const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;

  const onDeleteReminder = (idx: number) => {
    dispatch(hideMenu({ menu: Menu.ScheduledReminderEditMenu }));

    editedTaskClone.scheduledReminders.splice(idx, 1);
    dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
    dispatch(updateTask(editedTaskClone));
  };

  return (
    <div className="reminders-editor" title="Add/remove reminders here." ref={editorRef}>
      <div
        className="reminders-editor-header"
        onMouseEnter={() => setHoveringOverEditorHeader(true)}
        onMouseLeave={() => setHoveringOverEditorHeader(false)}
      >
        <button
          type="button"
          onClick={async () => {
            // Add new reminder and open reminder edit menu with new reminder index
            const newReminder = getDefaultScheduledReminder();

            const newReminderId = newReminder.id;
            editedTaskClone.scheduledReminders.push(JSON.parse(JSON.stringify(newReminder)));
            const sortedReminders = sortReminders(editedTaskClone.scheduledReminders);
            const newReminderIdx = sortedReminders.findIndex((r) => r.id === newReminderId);

            dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));

            const remindersContainer = editorRef.current?.querySelector('.reminders-container') as HTMLElement | null;
            const lastReminderTile = remindersContainer?.querySelector(
              `.reminder-tile:nth-child(${newReminderIdx})`,
            ) as HTMLElement | null;
            const tileRect = convertDOMRectToMenuRect(lastReminderTile?.getBoundingClientRect());

            openReminderEditMenu(tileRect, newReminderIdx, 36 + gap, true);
          }}
        >
          <div>
            <img src={reminderIcon} draggable="false" alt="" />
            <h4>Reminders</h4>
          </div>
          <motion.img
            src={plusIcon}
            draggable={false}
            alt="Add reminder"
            style={{
              visibility: hoveringOverEditorHeader ? 'visible' : 'hidden',
            }}
          />
        </button>
      </div>
      <ArrowNavigable
        className={`reminders-container ${editedTaskClone.scheduledReminders.length > 0 ? 'has-items' : ''}`}
        disableKeyboardClick
        asUl
        style={{ height: 'auto', width: 'auto' }}
      >
        {editedTaskClone.scheduledReminders.map((reminder, idx) => {
          return (
            <ReminderTile
              reminder={reminder}
              // handling undefined id allows for compatibility with older versions (where scheduled reminders didn't yet have ids)
              key={reminder.id ?? generateUniqueID()}
              dateFormat={dateFormat}
              militaryTime={militaryTime}
              onEditReminder={(tileRect?: MenuRect) => openReminderEditMenu(tileRect, idx)}
              onDeleteReminder={() => onDeleteReminder(idx)}
            />
          );
        })}
      </ArrowNavigable>
    </div>
  );
};
