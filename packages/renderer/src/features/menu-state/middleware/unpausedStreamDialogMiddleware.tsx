import { createListenerMiddleware } from '@reduxjs/toolkit';
import { Page, StreamState } from '@remindr/shared';
import { AppDispatch, RootState } from '@renderer/app/store';
import { updateCurrentPage } from '@renderer/features/page-state/pageState';
import { setCurrentStream, stopCurrentStream } from '@renderer/features/stream-list/streamListSlice';

export const unpausedStreamDialogMiddleware = createListenerMiddleware();
export const startListeningForUpdateCurrentPage = unpausedStreamDialogMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

/**
 * Stops the currently playing stream if user leaves stream editor page while a stream is currently playing.
 */
startListeningForUpdateCurrentPage({
  actionCreator: updateCurrentPage,
  effect: async (action, listenerApi) => {
    if (action.payload === Page.StreamEditor) return;
    if (listenerApi.getState().streamList.currentStream?.state !== StreamState.Active) return;

    listenerApi.cancelActiveListeners();
    listenerApi.dispatch(stopCurrentStream());
    listenerApi.dispatch(setCurrentStream(undefined));
  },
});
