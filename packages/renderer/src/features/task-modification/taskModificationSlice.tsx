import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Task, sortReminders } from '@remindr/shared';

type EditState = {
  originalTask?: Task;
  editedTask?: Task;
};

export interface TaskModificationState {
  taskCreationState: EditState;
  taskEditState: EditState;
  reminderEditState: { idx: number; state: 'create' | 'edit' };
  linkEditState: { idx: number; state: 'create' | 'edit' };
  lastEditType: 'create' | 'edit';
}

const initialState: TaskModificationState = {
  taskCreationState: { originalTask: undefined, editedTask: undefined },
  taskEditState: { originalTask: undefined, editedTask: undefined },
  reminderEditState: { idx: -1, state: 'create' },
  linkEditState: { idx: -1, state: 'create' },
  lastEditType: 'create',
};

export const taskModificationSlice = createSlice({
  name: 'taskModification',
  initialState,
  reducers: {
    setOriginalTask: (state, action: PayloadAction<{ creating?: boolean; task: InstanceType<typeof Task> }>) => {
      const creating = action.payload.creating ?? state.lastEditType === 'create';

      const sortedReminders = sortReminders(action.payload.task.scheduledReminders);
      const taskWithSortedReminders = { ...action.payload.task, scheduledReminders: sortedReminders };

      if (creating) {
        state.taskCreationState.originalTask = taskWithSortedReminders;
        state.lastEditType = 'create';
        return;
      }

      state.lastEditType = 'edit';
      state.taskEditState.originalTask = taskWithSortedReminders;
    },
    setEditedTask: (state, action: PayloadAction<{ creating?: boolean; task: InstanceType<typeof Task> }>) => {
      const creating = action.payload.creating ?? state.lastEditType === 'create';

      const sortedReminders = sortReminders(action.payload.task.scheduledReminders);
      const taskWithSortedReminders = { ...action.payload.task, scheduledReminders: sortedReminders };

      if (creating) {
        state.taskCreationState.editedTask = taskWithSortedReminders;
        state.lastEditType = 'create';
        return;
      }

      state.lastEditType = 'edit';
      state.taskEditState.editedTask = taskWithSortedReminders;
    },
    setReminderEditState: (state, action: PayloadAction<typeof state.reminderEditState>) => {
      state.reminderEditState = action.payload;
    },
    setLinkEditState: (state, action: PayloadAction<typeof state.linkEditState>) => {
      state.linkEditState = action.payload;
    },
  },
});

export const getEditedTask = (state: TaskModificationState, creating?: boolean) =>
  state[creating ?? state.lastEditType === 'create' ? 'taskCreationState' : 'taskEditState'].editedTask;

export default taskModificationSlice.reducer;
export const { setOriginalTask, setEditedTask, setReminderEditState, setLinkEditState } = taskModificationSlice.actions;
