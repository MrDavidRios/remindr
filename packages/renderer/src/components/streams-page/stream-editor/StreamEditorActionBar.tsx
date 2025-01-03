import { Stream, StreamState } from '@remindr/shared';
import { setCurrentStreamState } from '@renderer/features/stream-list/streamListSlice';
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
    dispatch(setCurrentStreamState(StreamState.Active));
  };

  const pauseStream = () => {
    dispatch(setCurrentStreamState(StreamState.Paused));
  };

  const endStream = () => {
    dispatch(setCurrentStreamState(StreamState.Ended));
  };

  return (
    <div className="action-bar">
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
          <button id="endStreamButton" className="accent-button" onClick={endStream}>
            End
          </button>
        </>
      )}
    </div>
  );
};
