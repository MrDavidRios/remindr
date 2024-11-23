import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Page } from '@remindr/shared';

export interface PageState {
  currentPage: Page;
}

const initialState: PageState = {
  currentPage: Page.TaskListView,
};

export const pageStateSlice = createSlice({
  name: 'pageState',
  initialState,
  reducers: {
    updateCurrentPage: (state, action: PayloadAction<Page>) => {
      state.currentPage = action.payload;
    },
  },
});

export default pageStateSlice.reducer;
export const { updateCurrentPage } = pageStateSlice.actions;
