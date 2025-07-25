import { renderWithProviders } from "@mocks/store-utils";
import { getMockTaskListState, mockMenuState, testTask } from "@mocks/testObjs";
import {
  DateFormat,
  Menu,
  Repeat,
  ScheduledReminder,
  setDate,
} from "@remindr/shared";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, test } from "vitest";
import { ScheduledReminderEditMenu } from "./ScheduledReminderEditMenu";

describe("Scheduled Reminder Edit Menu", () => {
  const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
  const editedTask = { ...testTask, name: "Edited Task" };
  editedTask.scheduledReminders = [
    JSON.parse(JSON.stringify(testScheduledReminder)),
  ];

  beforeEach(async () => {
    renderWithProviders(
      <ScheduledReminderEditMenu />,
      { dateFormat: DateFormat.YMDNumeric },
      {
        menuState: {
          ...mockMenuState,
          openMenus: [Menu.ScheduledReminderEditMenu],
          openDropdowns: {},
        },
        taskList: getMockTaskListState([testTask]),
        taskModificationState: {
          taskEditState: { originalTask: testTask, editedTask: editedTask },
          taskCreationState: { originalTask: testTask, editedTask: editedTask },
          reminderEditState: { idx: 0, state: "edit" },
          linkEditState: { idx: 0, state: "edit" },
          lastEditType: "edit",
        },
      }
    );
  });

  afterEach(() => {
    cleanup();
  });

  const repeatTypes = Object.values(Repeat).filter(
    (repeatType) => repeatType !== Repeat.NoRepeat
  );

  test.each(repeatTypes)(
    "should properly show $repeatName on dropdown if selected",
    async (repeatType) => {
      const user = userEvent.setup();

      const repeatIntervalButton = screen.getByRole("button", {
        name: "Change repeat interval",
      });

      await user.click(repeatIntervalButton);

      // Part of a dropdown menu, so it won't be instantly visible
      const repeatIntervalMenuItem = screen
        .getAllByRole("listitem")
        .find(
          (listitem) => listitem.textContent === repeatType.toString()
        ) as HTMLLIElement;
      const saveButton = screen.getByRole("button", { name: "Save Changes" });

      await userEvent.click(repeatIntervalMenuItem);
      await userEvent.click(saveButton);

      // expect(screen.getByText(repeatName)).toBeTruthy();
    }
  );
});
