import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Stream, StreamState, StreamTask } from '@remindr/shared';

function saveStreamsData(streamList: Stream[]) {
  window.data.saveStreamsData(JSON.stringify(streamList));
}

export interface StreamListState {
  value: Stream[];
  currentStream?: Stream;
}

const initialState: StreamListState = {
  value: [],
  currentStream: undefined,
};

export const getStreamList = createAsyncThunk('streamList/getStreamList', async () => {
  const streams: Stream[] = await window.data.loadTaskData();

  // using JSON.stringify makes sure that we're putting the serializable version of the class into state
  return JSON.parse(JSON.stringify(streams));
});

export const streamListSlice = createSlice({
  name: 'streamList',
  initialState,
  reducers: {
    setStreamList: (state, action: PayloadAction<InstanceType<typeof Stream>[]>) => {
      state.value = action.payload;

      saveStreamsData(state.value);
    },
    setCurrentStream: (state, action: PayloadAction<Stream | undefined>) => {
      state.currentStream = action.payload;
    },
    setCurrentStreamState: (state, action: PayloadAction<StreamState>) => {
      if (state.currentStream === undefined) return;

      state.currentStream = { ...state.currentStream, state: action.payload };
    },
    addTaskToCurrentStream: (state, action: PayloadAction<StreamTask>) => {
      if (state.currentStream === undefined) return;

      state.currentStream.tasks.push(action.payload);
    },
    removeTaskFromStream: (state, action: PayloadAction<StreamTask>) => {
      if (state.currentStream === undefined) return;

      state.currentStream.tasks = state.currentStream.tasks.filter(
        (task) => task.creationTime !== action.payload.creationTime,
      );
    },
  },
});

export default streamListSlice.reducer;
export const { setStreamList, setCurrentStream, setCurrentStreamState, addTaskToCurrentStream, removeTaskFromStream } =
  streamListSlice.actions;
