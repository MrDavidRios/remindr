import trashcanIcon from '@assets/icons/trashcan.svg';
import { Menu, Stream, StreamState, waitUntil } from '@remindr/shared';
import store from '@renderer/app/store';
import { hideMenu, showDialog } from '@renderer/features/menu-state/menuSlice';
import {
  deleteStream,
  markStreamComplete,
  markStreamIncomplete,
  setCurrentStream,
  startCurrentStream,
  stopCurrentStream,
} from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { FC } from 'react';

interface StreamEditorActionBar {
  currentStream: Stream;
}

export const StreamEditorActionBar: FC<StreamEditorActionBar> = ({ currentStream }) => {
  const dispatch = useAppDispatch();

  const isStreamPlayable =
    currentStream.state === StreamState.Uninitialized ||
    currentStream.state === StreamState.Initialized ||
    currentStream.state === StreamState.Paused;

  const playStream = () => {
    dispatch(startCurrentStream());
  };

  const pauseStream = () => {
    dispatch(stopCurrentStream());
  };

  const markStreamAsComplete = () => {
    dispatch(stopCurrentStream());
    dispatch(markStreamComplete(currentStream.creationTime));
    dispatch(setCurrentStream(undefined));
  };

  const markStreamAsIncomplete = () => {
    dispatch(setCurrentStream({ ...currentStream, state: StreamState.Initialized }));
    dispatch(markStreamIncomplete(currentStream.creationTime));
  };

  const onDelete = async () => {
    dispatch(
      showDialog({
        title: 'Delete Stream',
        message: 'Are you sure you want to delete this stream?',
        options: ['Cancel', 'Delete'],
      }),
    );

    await waitUntil(() => store.getState().menuState.dialogInfo.result !== undefined);
    const result = store.getState().menuState.dialogInfo.result;

    if (result === 'Delete') {
      dispatch(deleteStream(currentStream));
      dispatch(setCurrentStream(undefined));
    }

    dispatch(hideMenu({ menu: Menu.MessageModal }));
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
              {currentStream.state === StreamState.Uninitialized || currentStream.state === StreamState.Initialized
                ? 'Start'
                : 'Resume'}
            </button>
          ) : (
            <>
              <button id="pauseStreamButton" className="accent-button" onClick={pauseStream}>
                Pause
              </button>
              <button id="markStreamCompleteButton" className="accent-button" onClick={markStreamAsComplete}>
                Mark Complete
              </button>
            </>
          )}
        </>
      ) : (
        <button id="markStreamIncompleteButton" className="accent-button" onClick={markStreamAsIncomplete}>
          Mark Incomplete
        </button>
      )}
      {currentStream.state !== StreamState.Uninitialized && (
        <button id="deleteStreamButton" onClick={onDelete} className="secondary-button" title="Delete stream">
          <img src={trashcanIcon} draggable="false" alt="trashcan icon"></img>
        </button>
      )}
    </div>
  );
};
