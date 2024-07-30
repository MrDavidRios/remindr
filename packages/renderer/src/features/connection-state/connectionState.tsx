import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ConnectionState {
  connected: boolean;
  connCheckStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: ConnectionState = {
  connected: false,
  connCheckStatus: 'idle',
};

export const getConnectionStatus = createAsyncThunk('connectionState/getConnectionStatus', async () => {
  const hasNetworkConnection = await window.appState.hasNetworkConnection();
  return hasNetworkConnection;
});

export const connectionStateSlice = createSlice({
  name: 'connectionState',
  initialState,
  reducers: {
    updateConnectionState: (state, action: PayloadAction<{ connectionStatus: boolean }>) => {
      state.connected = action.payload.connectionStatus;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getConnectionStatus.pending, (state, action) => {
      if (state.connCheckStatus === 'idle') {
        state.connCheckStatus = 'pending';
      }
    });
    builder.addCase(getConnectionStatus.fulfilled, (state, action) => {
      state.connected = action.payload;
      state.connCheckStatus = 'succeeded';
    });
  },
});

export default connectionStateSlice.reducer;
export const { updateConnectionState } = connectionStateSlice.actions;
