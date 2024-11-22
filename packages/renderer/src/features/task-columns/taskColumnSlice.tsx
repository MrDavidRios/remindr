import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskColumnState {
  focusedTaskColumnIdx: number | undefined;
}

export const initialTaskColumnState: TaskColumnState = {
  focusedTaskColumnIdx: undefined,
};

export const taskColumnsSlice = createSlice({
  name: 'taskColumns',
  initialState: initialTaskColumnState,
  reducers: {
    setFocusedTaskColumn: (state, action: PayloadAction<number>) => {
      state.focusedTaskColumnIdx = action.payload;
    },
  },
});

export default taskColumnsSlice.reducer;
export const { setFocusedTaskColumn } = taskColumnsSlice.actions;
