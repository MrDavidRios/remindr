import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { UpdateStatus } from '@remindr/shared';

interface UpdateState {
  status: UpdateStatus;
  downloadedReleaseName?: string;
}

const initialState: UpdateState = {
  status: UpdateStatus.Idle,
  downloadedReleaseName: undefined,
};

export const updateStateSlice = createSlice({
  name: 'updateState',
  initialState,
  reducers: {
    setUpdateState: (state, action: PayloadAction<{ status: UpdateStatus; downloadedReleaseName?: string }>) => {
      state.status = action.payload.status;
      state.downloadedReleaseName = action.payload.downloadedReleaseName;
    },
  },
});

export default updateStateSlice.reducer;
export const { setUpdateState } = updateStateSlice.actions;
