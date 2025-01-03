import clockIcon from '@assets/icons/clock.svg';
import subtasksIcon from '@assets/icons/subtasks.svg';
import { formatDate, formatSeconds, Stream, StreamState } from '@remindr/shared';
import { setCurrentStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { FC } from 'react';

export interface StreamTileProps {
  stream: Stream;
}

export const StreamTile: FC<StreamTileProps> = ({ stream }) => {
  const dispatch = useAppDispatch();
  const dateFormat = useAppSelector((state) => state.settings.value.dateFormat);

  const completedTasks = stream.tasks.filter((task) => task.completed).length;
  const formattedDate = formatDate(new Date(stream.creationTime), dateFormat);

  const formattedElapsedTime = formatSeconds(stream.elapsedTime);

  const handleClick = () => {
    dispatch(setCurrentStream(stream));
  };

  return (
    <div key={stream.creationTime} className="stream-tile" onClick={handleClick} title={`Open ${stream.name}`}>
      <p>{stream.name}</p>
      <div className="stream-info">
        <div className="indicator">
          <p className="text-secondary">{formattedDate}</p>
        </div>
        <div className="task-completion-indicator indicator">
          <img
            src={subtasksIcon}
            draggable={false}
            title={`${completedTasks} of ${stream.tasks.length} tasks completed`}
            alt=""
          />
          <p className="text-secondary">
            {completedTasks}/{stream.tasks.length}
          </p>
        </div>
        {stream.state !== StreamState.Uninitialized && (
          <div className="indicator">
            <img src={clockIcon} draggable={false} alt="clock icon" />
            <p className="text-secondary">{`${formattedElapsedTime}`}</p>
          </div>
        )}
      </div>
    </div>
  );
};