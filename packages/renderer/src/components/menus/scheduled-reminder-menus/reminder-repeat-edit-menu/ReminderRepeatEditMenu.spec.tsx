import { renderWhileEditingTask } from "@mocks/renderHelpers";
import { testTask } from "@mocks/testObjs";
import {
  FrequencyType,
  getDefaultScheduledReminder,
  Menu,
  RepeatDurationType,
} from "@remindr/shared";
import { DisplayMenus } from "@renderer/menuLogic";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const openMenus = [Menu.ScheduledReminderEditMenu, Menu.ReminderRepeatEditMenu];

describe("Reminder Repeat Edit Menu", () => {
  afterEach(() => {
    cleanup();
  });

  describe("weekday selection flow", () => {
    beforeEach(async () => {
      renderWhileEditingTask({
        children: <DisplayMenus />,
        openMenus,
      });
    });

    it("should not save when saving with frequency set to 'weekdays' and no weekdays picked", async () => {
      const user = userEvent.setup();
      const weekdaysRadioButton = screen.getByRole("radio", {
        name: /weekdays/i,
      });
      await user.click(weekdaysRadioButton);
      await expect(weekdaysRadioButton).toBeInTheDocument();

      const weekdayButtons = screen.getAllByRole("button", {
        name: /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i,
      });
      weekdayButtons.forEach(async (button) => {
        await expect(button).not.toHaveClass("selected");
        await expect(button).not.toBeDisabled();
      });

      // Get only the 'reminder repeat edit menu' save button
      const saveButton = screen
        .getAllByRole("button", { name: "Save Changes" })
        .filter((el) => el.textContent === "Save Changes")[0];
      await user.click(saveButton);

      await expect(
        screen.getByText(/please pick at least one weekday to continue./i)
      ).toBeInTheDocument();
    });

    it("should disable all weekday selection buttions when 'fixed interval' frequency type is chosen", async () => {
      const user = userEvent.setup();
      const frequencyRadioButton = screen.getByRole("radio", {
        name: /repeats every 1/i,
      });
      await user.click(frequencyRadioButton);
      await expect(frequencyRadioButton).toBeInTheDocument();

      const weekdayButtons = screen.getAllByRole("button", {
        name: /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i,
      });
      weekdayButtons.forEach(async (button) => {
        await expect(button).toBeDisabled();
      });
    });
  });

  describe("initialization", () => {
    it("sets the chosen frequency option to 'fixed interval' to match the reminder", async () => {
      const editedTask = JSON.parse(
        JSON.stringify({ ...testTask, name: "Edited Task" })
      );
      const reminder = getDefaultScheduledReminder();
      reminder.repeatInfo.frequencyType = FrequencyType.FixedIntervalDays;
      editedTask.scheduledReminders = [reminder];

      renderWhileEditingTask({
        children: <DisplayMenus />,
        openMenus,
        taskModificationStateOverrides: {
          taskEditState: { originalTask: testTask, editedTask: editedTask },
        },
      });

      const frequencyRadioButton = screen.getByRole("radio", {
        name: /repeats every 1/i,
      });
      expect(frequencyRadioButton).toBeChecked();
    });

    it("sets the chosen frequency option to 'weekdays' to match the reminder", async () => {
      const editedTask = JSON.parse(
        JSON.stringify({ ...testTask, name: "Edited Task" })
      );
      const reminder = getDefaultScheduledReminder();
      reminder.repeatInfo.frequencyType = FrequencyType.Weekdays;
      reminder.repeatInfo.frequency = [
        true,
        false,
        true,
        false,
        true,
        false,
        true,
      ];
      editedTask.scheduledReminders = [reminder];

      renderWhileEditingTask({
        children: <DisplayMenus />,
        openMenus,
        taskModificationStateOverrides: {
          taskEditState: { originalTask: testTask, editedTask: editedTask },
        },
      });

      const weekdaysRadioButton = screen.getByRole("radio", {
        name: /weekdays/i,
      });
      expect(weekdaysRadioButton).toBeChecked();
    });

    it("sets the chosen duration option to 'forever' to match the reminder", async () => {
      const editedTask = JSON.parse(
        JSON.stringify({ ...testTask, name: "Edited Task" })
      );
      const reminder = getDefaultScheduledReminder();
      reminder.repeatInfo.durationType = RepeatDurationType.Forever;
      editedTask.scheduledReminders = [reminder];

      renderWhileEditingTask({
        children: <DisplayMenus />,
        openMenus,
        taskModificationStateOverrides: {
          taskEditState: { originalTask: testTask, editedTask: editedTask },
        },
      });

      const durationRadioButton = screen.getByRole("radio", {
        name: /forever/i,
      });
      expect(durationRadioButton).toBeChecked();
    });

    it("sets the chosen duration option to 'fixed amount' to match the reminder", async () => {
      const editedTask = JSON.parse(
        JSON.stringify({ ...testTask, name: "Edited Task" })
      );
      const reminder = getDefaultScheduledReminder();
      reminder.repeatInfo.durationType = RepeatDurationType.FixedAmount;
      reminder.repeatInfo.duration = 5;
      editedTask.scheduledReminders = [reminder];

      renderWhileEditingTask({
        children: <DisplayMenus />,
        openMenus,
        taskModificationStateOverrides: {
          taskEditState: { originalTask: testTask, editedTask: editedTask },
        },
      });

      const durationRadioButton = screen.getByRole("radio", {
        name: /5 reminders/i,
      });
      expect(durationRadioButton).toBeChecked();
    });

    it("sets the chosen duration option to 'date' to match the reminder", async () => {
      const editedTask = JSON.parse(
        JSON.stringify({ ...testTask, name: "Edited Task" })
      );
      const reminder = getDefaultScheduledReminder();
      reminder.repeatInfo.durationType = RepeatDurationType.Date;
      reminder.repeatInfo.duration = new Date("06-17-2025").getTime();
      editedTask.scheduledReminders = [reminder];

      renderWhileEditingTask({
        children: <DisplayMenus />,
        openMenus,
        taskModificationStateOverrides: {
          taskEditState: { originalTask: testTask, editedTask: editedTask },
        },
      });

      const durationRadioButton = screen.getByRole("radio", {
        name: /until/i,
      });
      expect(durationRadioButton).toBeChecked();

      const reminderRepeatEndDatePicker =
        screen.getByDisplayValue("2025-06-17");
      expect(reminderRepeatEndDatePicker).toBeInTheDocument();
    });
  });
});
