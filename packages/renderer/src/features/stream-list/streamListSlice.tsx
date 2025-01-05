import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppMode, Stream, StreamState, StreamTask } from '@remindr/shared';
import _ from 'lodash';
import { setAppMode } from '../app-mode/appModeSlice';
import { updateUserState } from '../user-state/userSlice';
import { initializeStreamListSyncListener } from './streamListSync';

function saveStreamsData(streamList: Stream[]) {
  window.data.saveStreamsData(JSON.stringify(streamList));
}

export interface StreamListState {
  value: Stream[];
  streamListGetStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  currentStream?: Stream;
  streamStartTimestamp?: number;
}

const initialState: StreamListState = {
  value: [],
  streamListGetStatus: 'idle',
  currentStream: undefined,
  streamStartTimestamp: undefined,
};

export const getStreamList = createAsyncThunk('streamList/getStreamList', async () => {
  const streams: Stream[] = await window.data.loadStreamsData();

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
    /**
     * Updates an existing stream or adds stream to stream list if it's new.
     * @param state
     * @param action
     * @returns
     */
    updateStream: (state, action: PayloadAction<Stream>) => {
      // Don't save uninitialized streams
      if (action.payload.state === StreamState.Uninitialized) return;

      const newStream = !state.value.some((stream) => stream.creationTime === action.payload.creationTime);
      if (newStream) {
        state.value.push(action.payload);

        saveStreamsData(state.value);
        return;
      }

      // Update stream
      const streamIdx = state.value.findIndex((stream) => stream.creationTime === action.payload.creationTime);

      if (_.isEqual(state.value[streamIdx], action.payload)) return;

      state.value[streamIdx] = action.payload;
      saveStreamsData(state.value);
    },
    setCurrentStream: (state, action: PayloadAction<Stream | undefined>) => {
      state.currentStream = action.payload;
    },
    startCurrentStream: (state) => {
      if (!state.currentStream) return;

      state.currentStream.state = StreamState.Active;
      state.streamStartTimestamp = new Date().getTime();
    },
    stopCurrentStream: (state) => {
      if (state.currentStream === undefined || state.streamStartTimestamp === undefined) return;

      state.currentStream.state = StreamState.Paused;

      const sessionTime = new Date().getTime() - state.streamStartTimestamp;
      state.currentStream.elapsedTime += sessionTime;
      state.streamStartTimestamp = undefined;

      // update elapsed time in stored data
      const streamCreationTime = state.currentStream.creationTime;
      const streamIdx = state.value.findIndex((stream) => stream.creationTime === streamCreationTime);
      state.value[streamIdx] = state.currentStream;

      saveStreamsData(state.value);
    },
    markStreamComplete: (state, action: PayloadAction<number>) => {
      const streamIdx = state.value.findIndex((stream) => stream.creationTime === action.payload);
      const stream = state.value[streamIdx];
      state.value[streamIdx] = { ...stream, state: StreamState.Completed };
      saveStreamsData(state.value);
    },
    markStreamIncomplete: (state, action: PayloadAction<number>) => {
      const streamIdx = state.value.findIndex((stream) => stream.creationTime === action.payload);
      const stream = state.value[streamIdx];
      state.value[streamIdx] = { ...stream, state: StreamState.Initialized };
      saveStreamsData(state.value);
    },
    removeTaskFromStream: (state, action: PayloadAction<StreamTask>) => {
      if (state.currentStream === undefined) return;

      state.currentStream.tasks = state.currentStream.tasks.filter(
        (task) => task.creationTime !== action.payload.creationTime,
      );
    },
    deleteStream: (state, action: PayloadAction<Stream>) => {
      state.value = state.value.filter((stream) => stream.creationTime !== action.payload.creationTime);
      saveStreamsData(state.value);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getStreamList.pending, (state) => {
      if (state.streamListGetStatus !== 'pending') {
        state.streamListGetStatus = 'pending';
      }
    });
    builder.addCase(getStreamList.fulfilled, (state, action) => {
      state.value = action.payload;
      state.streamListGetStatus = 'succeeded';
    });
    builder.addCase(getStreamList.rejected, (state) => {
      if (state.streamListGetStatus !== 'failed') {
        state.streamListGetStatus = 'failed';
      }
    });
    /*
     * Mimicking pageLogic.tsx's logic, this resets the stream list/stream list get state when:
     * - App mode is set to login screen/offline
     * - User signs out
     */
    builder.addCase(setAppMode, (state, action) => {
      if (action.payload !== AppMode.Online) resetStreamListState(state);
    });
    builder.addCase(updateUserState, (state, action) => {
      // If user is de-authenticated, clear stream list
      if (!action.payload.authenticated) resetStreamListState(state);
    });
  },
});

function resetStreamListState(state: StreamListState) {
  state.value = [];
  state.streamListGetStatus = 'idle';
  state.currentStream = undefined;
  state.streamStartTimestamp = undefined;
}

initializeStreamListSyncListener();

export default streamListSlice.reducer;
export const {
  setStreamList,
  updateStream,
  setCurrentStream,
  startCurrentStream,
  stopCurrentStream,
  removeTaskFromStream,
  markStreamComplete,
  markStreamIncomplete,
  deleteStream,
} = streamListSlice.actions;
