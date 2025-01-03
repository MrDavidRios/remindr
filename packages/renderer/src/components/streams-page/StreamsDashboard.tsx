import { Stream } from '@remindr/shared';
import { setCurrentStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { FC } from 'react';

export const StreamsDashboard: FC = () => {
  const streamList = useAppSelector((state) => state.streamList.value);
  const dispatch = useAppDispatch();

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
        <ul>
          {streamList.length > 0 ? (
            streamList.map((stream) => <li key={stream.creationTime}>{stream.name}</li>)
          ) : (
            <p id="emptyStreamListMessage" className="text-secondary">
              No streams have been made yet.
            </p>
          )}
        </ul>
      </div>
      <div className="action-bar">
        <button id="createStreamButton" className="accent-button" onClick={startCreatingStream}>
          Create Stream
        </button>
      </div>
    </div>
  );
};
