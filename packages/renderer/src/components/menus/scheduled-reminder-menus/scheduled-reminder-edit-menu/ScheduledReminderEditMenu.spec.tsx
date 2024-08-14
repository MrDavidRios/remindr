import { renderWithProviders } from '@mocks/store-utils';
import { testTask } from '@mocks/testObjs';
import { DateFormat, Menu, Repeat, ScheduledReminder, setDate } from '@remindr/shared';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ScheduledReminderEditMenu } from './ScheduledReminderEditMenu';

const mockMenuState = {
  openMenus: [Menu.ScheduledReminderEditMenu],
  dialogInfo: { title: undefined, message: '', options: [], result: undefined },
  scheduledReminderEditorPosition: {
    anchor: { x: 0, y: 0, width: 0, height: 0 },
    yOffset: { topAnchored: 0, bottomAnchored: 0 },
    gap: 0,
  },
};

describe('Scheduled Reminder Edit Menu', () => {
  const testScheduledReminder = setDate(new ScheduledReminder(), new Date());
  const editedTask = { ...testTask, name: 'Edited Task' };
  editedTask.scheduledReminders = [JSON.parse(JSON.stringify(testScheduledReminder))];

  beforeEach(async () => {
    renderWithProviders(
      <ScheduledReminderEditMenu />,
      { dateFormat: DateFormat.YMDNumeric },
      {
        menuState: mockMenuState,
        taskModificationState: {
          taskEditState: { originalTask: testTask, editedTask: editedTask },
          taskCreationState: { originalTask: testTask, editedTask: editedTask },
          reminderEditState: { idx: 0, state: 'edit' },
          linkEditState: { idx: 0, state: 'edit' },
          lastEditType: 'edit',
        },
      },
    );
  });

  afterEach(() => {
    cleanup();
  });

  const repeatTypes = Object.keys(Repeat).filter((repeatType) => !Number.isNaN(Number(repeatType)));
  const repeatInfo = repeatTypes.map((repeatType) => ({
    repeatType,
    repeatName: Repeat[repeatType as keyof typeof Repeat],
  }));

  test.each(repeatInfo)('should properly show $repeatName on dropdown if selected', async ({ repeatName }) => {
    const user = userEvent.setup();

    const repeatIntervalButton = screen.getByRole('button', { name: 'Change repeat interval' });

    await user.click(repeatIntervalButton);

    // Part of a dropdown menu, so it won't be instantly visible
    const repeatIntervalMenuItem = screen
      .getAllByRole('listitem')
      .find((listitem) => listitem.textContent === repeatName.toString()) as HTMLLIElement;
    const saveButton = screen.getByRole('button', { name: 'Save Changes' });

    await userEvent.click(repeatIntervalMenuItem);
    await userEvent.click(saveButton);

    expect(screen.getByText(repeatName)).toBeTruthy();
  });
});
