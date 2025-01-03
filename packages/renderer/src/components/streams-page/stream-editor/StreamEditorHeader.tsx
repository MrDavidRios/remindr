import backIcon from '@assets/icons/angel-left.svg';
import pencilIcon from '@assets/icons/pencil.svg';
import { Stream, StreamState } from '@remindr/shared';
import { DynamicTextArea } from '@renderer/components/dynamic-text-area/DynamicTextArea';
import { SaveButtons } from '@renderer/components/save-buttons/SaveButtons';
import { showDialog } from '@renderer/features/menu-state/menuSlice';
import { setCurrentStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import { FC, useState } from 'react';

interface StreamEditorHeaderProps {
  currentStream: Stream;
  onNameChange: (newName: string) => void;
}

export const StreamEditorHeader: FC<StreamEditorHeaderProps> = ({ currentStream, onNameChange }) => {
  const dispatch = useAppDispatch();

  const streamIsNew = currentStream.state === StreamState.Uninitialized;
  const [namingStream, setNamingStream] = useState(streamIsNew);
  const [editedName, setEditedName] = useState(currentStream.name);

  const onChangeName = () => {
    if (editedName.trim() === '') {
      dispatch(showDialog({ title: 'Invalid Name', message: 'Make sure your stream has a name.' }));
      setEditedName(currentStream.name);
      return;
    }

    onNameChange(editedName);
    setNamingStream(false);
  };

  const cancelNameChange = () => {
    setEditedName(currentStream.name);
    setNamingStream(false);
  };

  const ref = useClickOutside(cancelNameChange);

  return (
    <div className="header">
      <button className="back-button" onClick={() => dispatch(setCurrentStream(undefined))} title="Back to dashboard">
        <img src={backIcon} alt="Back to dashboard" draggable={false} />
      </button>
      {namingStream ? (
        <div
          id="streamTitleInputWrapper"
          ref={ref as any}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();

              onChangeName();
            }
            if (e.key === 'Escape') {
              cancelNameChange();
            }
          }}
        >
          <DynamicTextArea
            aria-label="stream title input"
            placeholder="Enter a title"
            maxLength={255}
            value={editedName}
            autoFocus
            allowNewLine={false}
            onChange={(e) => setEditedName(e.currentTarget.value)}
          />
          <SaveButtons onSave={onChangeName} onCancel={cancelNameChange} />
        </div>
      ) : (
        <div id="streamHeaderWrapper" onClick={() => setNamingStream(true)}>
          <button onClick={() => setNamingStream(true)} title="Edit stream name">
            <h2>{currentStream.name}</h2>
            <img src={pencilIcon} draggable="false" alt="" />
          </button>
        </div>
      )}
    </div>
  );
};
