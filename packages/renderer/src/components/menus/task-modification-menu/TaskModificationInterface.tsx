import pencilIcon from '@assets/icons/pencil.svg';
import type { Subtask } from '@remindr/shared';
import { Task, formatDateAndTime } from '@remindr/shared';
import { showDialog } from '@renderer/features/menu-state/menuSlice';
import { updateTask } from '@renderer/features/task-list/taskListSlice';
import { getEditedTask, setEditedTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import type { FC } from 'react';
import { DynamicTextArea } from '../../dynamic-text-area/DynamicTextArea';
import { ActionBar } from './ActionBar';
import { SubtaskEditor } from './SubtaskEditor';
import { LinksEditor } from './links-editor/LinksEditor';
import { NotesEditor } from './notes-editor/NotesEditor';
import { RemindersEditor } from './reminders-editor/RemindersEditor';

interface TaskModificationInterfaceProps {
  animationComplete: boolean;
  creating: boolean;
  onSave?: (task: Task) => void;
}

export const TaskModificationInterface: FC<TaskModificationInterfaceProps> = ({
  animationComplete,
  creating,
  onSave,
}) => {
  const dispatch = useAppDispatch();

  const fallbackTask = JSON.parse(JSON.stringify(new Task(''))) as Task;
  const editedTask = useAppSelector((state) => getEditedTask(state.taskModificationState, creating)) ?? fallbackTask;

  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);

  async function save() {
    if (editedTask.name.trim() === '') {
      dispatch(showDialog({ title: 'Invalid Name', message: 'Make sure your task has a name.' }));
      return;
    }

    if (!creating) {
      dispatch(updateTask(editedTask));
    }

    onSave?.(editedTask);
  }

  return (
    <div className="task-panel frosted">
      <div className="task-modification-interface">
        <div>
          <h3 id="taskCreationWindowHeader">{creating ? 'New Task' : 'Edit Task'}</h3>

          <DynamicTextArea
            id="taskTitleInput"
            aria-label="task-title"
            placeholder="Remind me to..."
            maxLength={255}
            value={editedTask?.name ?? ''}
            autoFocus={animationComplete}
            allowNewLine={false}
            onChange={(e) => {
              // If there's no change, don't re-render (for some reason, this event was fired when clicking away from the title input opening the task modification interface)
              if (editedTask.name === e.currentTarget.value) return;

              const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
              editedTaskClone.name = e.currentTarget.value;
              dispatch(setEditedTask({ creating, task: editedTaskClone }));
            }}
            onBlur={() => {
              if (!creating) save();
            }}
          />

          <RemindersEditor />

          <SubtaskEditor
            subtasks={editedTask?.subtasks ?? []}
            onChange={(subtasks: Subtask[]) => {
              const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
              editedTaskClone.subtasks = JSON.parse(JSON.stringify(subtasks));
              dispatch(setEditedTask({ creating, task: editedTaskClone }));
            }}
            onSaveableChange={(subtasks: Subtask[]) => {
              if (!creating) save();
            }}
          />

          <LinksEditor />

          <div id="notesWrapper">
            <div id="notesHeader">
              <img src={pencilIcon} draggable="false" alt="" />
              <h4>Notes</h4>
            </div>
            <NotesEditor
              className="notes-editor"
              placeholder="Enter notes here..."
              value={editedTask?.notes ?? ''}
              onChange={(e) => {
                const editedTaskClone = JSON.parse(JSON.stringify(editedTask));
                editedTaskClone.notes = e.currentTarget.value;
                dispatch(setEditedTask({ creating, task: editedTaskClone }));
              }}
              onBlur={() => {
                if (!creating) save();
              }}
            />
          </div>
        </div>

        {/* Footer of the Task Modification Interface */}
        {editedTask.completed && editedTask.completionTime > 0 && (
          <div className="task-panel-footer">
            <p className="completion-timestamp" style={{ fontSize: 14 }}>{`Completed ${formatDateAndTime(
              new Date(editedTask.completionTime),
              dateFormat,
            )}`}</p>
          </div>
        )}
      </div>
      <ActionBar task={editedTask} onSave={save} creatingTask={creating} />
    </div>
  );
};
