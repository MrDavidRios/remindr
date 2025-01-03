import backIcon from '@assets/icons/angel-left.svg';
import { Stream } from '@remindr/shared';
import { setCurrentStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { FC } from 'react';

interface StreamEditorHeaderProps {
  currentStream: Stream;
}

export const StreamEditorHeader: FC<StreamEditorHeaderProps> = ({ currentStream }) => {
  const dispatch = useAppDispatch();

  return (
    <div className="header">
      <button className="back-button" onClick={() => dispatch(setCurrentStream(undefined))} title="Back to dashboard">
        <img src={backIcon} alt="Back to dashboard" draggable={false} />
      </button>
      <h2>{currentStream.name}</h2>
    </div>
  );
};
