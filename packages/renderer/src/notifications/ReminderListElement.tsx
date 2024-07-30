import { Settings } from 'main/types/classes/settings';
import Task from 'main/types/classes/task/task';
import { FC } from 'react';
import { getReminderDisplayDate } from 'renderer/scripts/utils/scheduledreminderfunctions';
import { getFormattedReminderTime } from 'renderer/scripts/utils/timefunctions';
import checkImg from '../../../assets/icons/check.png';

interface ReminderListElementProps {
  task: Task;
  reminderIdx: number;
  settings: Settings;
  onComplete: () => void;
}

export const ReminderListElement: FC<ReminderListElementProps> = ({ task, reminderIdx, settings, onComplete }) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="notif-element"
      onClick={() => {
        window.electron.ipcRenderer.sendMessage('open-task-in-edit-panel', task);
      }}
    >
      <div>
        <p className="title">{task.name}</p>
        <p className="date">
          {`${getReminderDisplayDate(task.scheduledReminders[reminderIdx], settings.dateFormat)} at ${getFormattedReminderTime(
            task.scheduledReminders[0],
            settings.militaryTime,
          )}`}
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
