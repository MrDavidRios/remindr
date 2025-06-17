import reminderIcon from "@assets/icons/bell.svg";
import linkIcon from "@assets/icons/link.svg";
import pencilIcon from "@assets/icons/pencil.svg";
import repeatIcon from "@assets/icons/repeat.svg";
import subtasksIcon from "@assets/icons/subtasks.svg";
import type { Task } from "@remindr/shared";
import {
  getFormattedReminderTime,
  getReadableRepeatValue,
  getReminderDisplayDate,
  isOverdue,
  reminderRepeats,
  taskHasNotes,
} from "@remindr/shared";
import {
  completeTask,
  markTaskIncomplete,
} from "@renderer/features/task-list/taskListSlice";
import { useAppDispatch, useAppSelector } from "@renderer/hooks";
import type { FC } from "react";
import { TaskCompleteButton } from "./TaskCompleteButton";

interface TaskTileContentsProps {
  task: Task;
}

export const TaskTileContents: FC<TaskTileContentsProps> = ({ task }) => {
  const dispatch = useAppDispatch();

  const militaryTime = useAppSelector(
    (state) => state.settings.value.militaryTime
  );
  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);

  const hasReminders = task.scheduledReminders.length > 0;

  const overdue = hasReminders ? isOverdue(task.scheduledReminders[0]) : false;

  const timeDisplayClasses = `time ${overdue ? "overdue" : ""}`;

  const hasNotes = taskHasNotes(task);
  const repeats = hasReminders
    ? reminderRepeats(task.scheduledReminders[0])
    : false;
  const multipleReminders = task.scheduledReminders.length > 1;
  const hasSubtasks = task.subtasks.length > 0;
  const hasLinks = task.links?.length > 0;

  const hasIndicators =
    hasReminders || hasNotes || repeats || multipleReminders || hasSubtasks;
  const indicatorClasses = "reminder-indicator task-tile-image";

  const completedSubtasks = task.subtasks?.filter((s) => s.complete).length;
  const subtasks = task.subtasks?.length;

  const toggleComplete = () => {
    if (task.completed) {
      dispatch(markTaskIncomplete(task));
      return;
    }

    dispatch(completeTask(task));
  };

  return (
    <>
      <TaskCompleteButton task={task} toggleComplete={toggleComplete} />
      <div>
        <p className="task-title">{task.name}</p>
        <div
          className={`reminder-time-container ${
            hasIndicators && "contains-images"
          }`}
        >
          {hasReminders && (
            <div className={timeDisplayClasses}>
              {`${getReminderDisplayDate(
                task.scheduledReminders[0],
                dateFormat
              )} at ${getFormattedReminderTime(
                task.scheduledReminders[0],
                militaryTime
              )}`}
            </div>
          )}

          {/* Indicators */}
          {hasNotes && (
            <img
              className={`${indicatorClasses} notes`}
              src={pencilIcon}
              draggable={false}
              title="This task has notes"
              alt=""
            />
          )}
          {repeats && (
            <img
              className={`${indicatorClasses} repeat`}
              src={repeatIcon}
              draggable={false}
              title={getReadableRepeatValue(
                task.scheduledReminders[0],
                dateFormat
              )}
              alt=""
            />
          )}
          {multipleReminders && (
            <div className="reminder-indicator-container">
              <img
                className={`${indicatorClasses}`}
                src={reminderIcon}
                draggable={false}
                title={`${task.scheduledReminders.length} reminders`}
                alt=""
              />
              <p>{task.scheduledReminders.length}</p>
            </div>
          )}
          {hasSubtasks && (
            <div className="subtasks-indicator">
              <img
                className={`${indicatorClasses} repeat`}
                src={subtasksIcon}
                draggable={false}
                title={`${completedSubtasks} of ${subtasks} subtasks completed`}
                alt=""
              />
              <p>{`${completedSubtasks}/${subtasks}`}</p>
            </div>
          )}
          {hasLinks && (
            <div className="reminder-indicator-container">
              <img
                className={indicatorClasses}
                src={linkIcon}
                draggable={false}
                title="This task has links"
                alt=""
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
