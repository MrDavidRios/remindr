import { Menu, reminderRepeats } from "@remindr/shared";
import { hideMenu, showMenu } from "@renderer/features/menu-state/menuSlice";
import { advanceRecurringReminder } from "@renderer/features/task-list/taskListSlice";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import { useHotkey } from "@renderer/scripts/utils/hooks/usehotkey";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { TaskEditMenu } from "../menus/task-edit-menu/TaskEditMenu";
import { TaskListDisplay } from "./task-list-display/TaskListContainer";

export function TaskManagementPage() {
  const dispatch = useAppDispatch();

  const selectedTasks = useAppSelector(
    (state) => state.taskList.selectedTasks,
    shallowEqual
  );
  const timeframe = useAppSelector((state) => state.taskList.timeframe);

  const showTaskEditMenu = useAppSelector((state) =>
    state.menuState.openMenus.includes(Menu.TaskEditMenu)
  );

  useEffect(() => {
    if (selectedTasks.length === 1 && !showTaskEditMenu) {
      // Close task create menu if it's open
      dispatch(
        hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: false })
      );
    }

    if (selectedTasks.length === 1) {
      dispatch(showMenu(Menu.TaskEditMenu));
      return;
    }

    dispatch(hideMenu({ menu: Menu.TaskEditMenu }));
  }, [selectedTasks]);

  // Test notifications with Cmd/Ctrl + T in development
  useHotkey(
    ["mod+t"],
    () => {
      if (window.electron.remote.isPackaged()) return;

      const TEST_RECURRING_REMINDERS = true;

      if (TEST_RECURRING_REMINDERS) {
        for (let i = 0; i < selectedTasks.length; i++) {
          if (
            selectedTasks[i].scheduledReminders.length > 0 &&
            reminderRepeats(selectedTasks[i].scheduledReminders[0])
          ) {
            dispatch(
              advanceRecurringReminder({
                task: selectedTasks[i],
                reminderIdx: 0,
              })
            );
          }
        }
      } else {
        for (let i = 0; i < selectedTasks.length; i++) {
          window.notifications.notify(JSON.stringify(selectedTasks[i]), 0);
        }
      }
    },
    Menu.None
  );

  return (
    <>
      <TaskListDisplay timeframe={timeframe} taskMenuShown={showTaskEditMenu} />
      <AnimatePresence>
        {showTaskEditMenu ? (
          <TaskEditMenu selectedTask={selectedTasks[0]} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
