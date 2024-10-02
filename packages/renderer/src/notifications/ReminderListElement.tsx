import checkImg from '@assets/icons/check.png';
import type { Settings, Task } from '@remindr/shared';
import { getReminderDisplayDate } from '@remindr/shared/src/utils/scheduledreminderfunctions';
import { getFormattedReminderTime } from '@remindr/shared/src/utils/timefunctions';
import type { FC } from 'react';

interface ReminderListElementProps {
  task: Task;
  reminderIdx: number;
  settings: Settings;
  onComplete: () => void;
}

export const ReminderListElement: FC<ReminderListElementProps> = ({ task, reminderIdx, settings, onComplete }) => {
  return (
    <div
      className="notif-element"
      onClick={() => {
        window.electron.ipcRenderer.sendMessage('open-task-in-edit-panel', task);
      }}
    >
      <div>
        <p className="title">{task.name}</p>
        <p className="date">
          {`${getReminderDisplayDate(
            task.scheduledReminders[reminderIdx],
            settings.dateFormat,
          )} at ${getFormattedReminderTime(task.scheduledReminders[0], settings.militaryTime)}`}
        </p>
      </div>
      <button
        type="button"
        className="complete-task-button"
        title="Complete Task"
        aria-label="Complete Task"
        onClick={onComplete}
      >
        <img src={checkImg} draggable={false} alt="" />
      </button>
    </div>
  );
};
