import { Stream, StreamState } from '@remindr/shared';
import { setCurrentStream, updateStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { FC } from 'react';

interface StreamEditorActionBar {
  currentStream: Stream;
}

export const StreamEditorActionBar: FC<StreamEditorActionBar> = ({ currentStream }) => {
  const dispatch = useAppDispatch();

  const isStreamPlayable =
    currentStream.state === StreamState.Uninitialized || currentStream.state === StreamState.Paused;

  const playStream = () => {
    updateStreamAndSave({ ...currentStream, state: StreamState.Active });
  };

  const pauseStream = () => {
    updateStreamAndSave({ ...currentStream, state: StreamState.Paused });
  };

  const markStreamComplete = () => {
    updateStreamAndSave({ ...currentStream, state: StreamState.Completed });
    dispatch(setCurrentStream(undefined));
  };

  const markStreamIncomplete = () => {
    updateStreamAndSave({ ...currentStream, state: StreamState.Paused });
    dispatch(setCurrentStream(undefined));
  };

  const updateStreamAndSave = (updatedStream: Stream) => {
    dispatch(setCurrentStream(updatedStream));
    dispatch(updateStream(updatedStream));
  };

  return (
    <div className="action-bar">
      {currentStream.state !== StreamState.Completed ? (
        <>
          {isStreamPlayable ? (
            <button
              id="createStreamButton"
              className="accent-button"
              disabled={currentStream.tasks.length === 0}
              onClick={playStream}
            >
              {currentStream.state === StreamState.Uninitialized ? 'Start' : 'Resume'}
            </button>
          ) : (
            <>
              <button id="pauseStreamButton" className="accent-button" onClick={pauseStream}>
                Pause
              </button>
              <button id="markStreamCompleteButton" className="accent-button" onClick={markStreamComplete}>
                Mark Complete
              </button>
            </>
          )}
        </>
      ) : (
        <button id="markStreamIncompleteButton" className="accent-button" onClick={markStreamIncomplete}>
          Mark Incomplete
        </button>
      )}
    </div>
  );
};
