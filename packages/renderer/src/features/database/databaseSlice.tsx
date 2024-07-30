import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface DatabaseState {
  ongoingRequests: number;
  connectionError: boolean;
  attemptingToRegainConnection: boolean;
}

const initialState: DatabaseState = {
  ongoingRequests: 0,
  connectionError: false,
  attemptingToRegainConnection: false,
};

export const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    addDatabaseRequest: (state) => {
      state.ongoingRequests += 1;
    },
    removeDatabaseRequest: (state) => {
      state.ongoingRequests -= 1;
    },
    updateDatabaseRequests: (state, action: PayloadAction<number>) => {
      state.ongoingRequests = action.payload;
    },
    setConnectionError: (state, action: PayloadAction<boolean>) => {
      state.connectionError = action.payload;
    },
    setAttemptingToRegainConnection: (state, action: PayloadAction<boolean>) => {
      state.attemptingToRegainConnection = action.payload;
    },
  },
});

export default databaseSlice.reducer;
export const {
  addDatabaseRequest,
  removeDatabaseRequest,
  updateDatabaseRequests,
  setConnectionError,
  setAttemptingToRegainConnection,
} = databaseSlice.actions;
