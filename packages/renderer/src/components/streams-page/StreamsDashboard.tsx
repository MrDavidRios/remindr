import { Stream } from '@remindr/shared';
import { AppDispatch } from '@renderer/app/store';
import { getStreamList, setCurrentStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { getAccentColor } from '@renderer/scripts/systems/stylemanager';
import { FC, useEffect } from 'react';
import HashLoader from 'react-spinners/HashLoader';
import { StreamTile } from './StreamTile';

export const StreamsDashboard: FC = () => {
  const dispatch = useAppDispatch();

  const streamList = useAppSelector((state) => state.streamList.value);
  const streamListGetStatus = useAppSelector((state) => state.streamList.streamListGetStatus);

  useEffect(() => {
    attemptGetStreamList(streamListGetStatus, dispatch);
  }, [streamListGetStatus]);

  const startCreatingStream = () => {
    const newStream: Stream = JSON.parse(JSON.stringify(new Stream('New Stream')));
    dispatch(setCurrentStream(newStream));
  };

  return (
    <div id="streamsDashboard" className="menu frosted">
      <div className="header">
        <h2>Streams</h2>
      </div>
      <div>
        {streamListGetStatus !== 'succeeded' ? (
          <HashLoader color={getAccentColor()} cssOverride={{ margin: 16 }} />
        ) : (
          <ul id="streamList">
            {streamList.length > 0 ? (
              streamList.map((stream) => <StreamTile key={stream.creationTime} stream={stream} />)
            ) : (
              <p id="emptyStreamListMessage" className="text-secondary">
                No streams have been made yet.
              </p>
            )}
          </ul>
        )}
      </div>
      <div className="action-bar">
        <button id="createStreamButton" className="accent-button" onClick={startCreatingStream}>
          Create Stream
        </button>
      </div>
    </div>
  );
};

function attemptGetStreamList(taskListGetStatus: string, dispatch: AppDispatch) {
  if (taskListGetStatus === 'pending' || taskListGetStatus === 'succeeded') return;

  if (taskListGetStatus === 'failed') {
    // Adding a delay seems to allow enough time for firebase to realize that the client is back online
    setTimeout(() => dispatch(getStreamList()), 1000);
    return;
  }

  // Should automatically retry if failed
  dispatch(getStreamList());
}
