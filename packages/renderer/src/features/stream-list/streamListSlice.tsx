import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Stream } from '@remindr/shared';

function saveStreamsData(streamList: Stream[]) {
  window.data.saveStreamsData(JSON.stringify(streamList));
}

export interface StreamListState {
  streams: Stream[];
}

const initialState: StreamListState = {
  streams: [],
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
      state.streams = action.payload;

      saveStreamsData(state.streams);
    },
  },
});

export default streamListSlice.reducer;
export const { setStreamList } = streamListSlice.actions;
