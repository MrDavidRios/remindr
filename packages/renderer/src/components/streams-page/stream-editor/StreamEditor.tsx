import plusIcon from '@assets/icons/plus.svg';
import { Stream, StreamState, StreamTask } from '@remindr/shared';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { setCurrentStream, updateStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import _ from 'lodash';
import { FC, useEffect, useState } from 'react';
import { NewStreamTaskTile } from '../NewStreamTaskTile';
import { StreamEditorActionBar } from './StreamEditorActionBar';
import { StreamEditorHeader } from './StreamEditorHeader';
import { StreamTaskList } from './StreamTaskList';
import { StreamTimeDisplay } from './StreamTimeDisplay';

export const StreamEditor: FC = () => {
  const dispatch = useAppDispatch();
  const currentStream = useAppSelector((state) => state.streamList.currentStream);
  const [showNewTaskTile, setShowNewTaskTile] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState(currentStream?.tasks ?? []);

  if (!currentStream) return <></>;

  const addTask = (taskName: string) => {
    const newStreamTask: StreamTask = {
      creationTime: new Date().getTime(),
      name: taskName,
      completed: false,
      isTaskReference: false,
    };

    const updatedTasks = [...orderedTasks, newStreamTask];
    const updatedStream: Stream = { ...initialize(currentStream), tasks: updatedTasks };

    setOrderedTasks(updatedTasks);
    dispatch(updateStream(updatedStream));
    dispatch(setCurrentStream(updatedStream));
  };

  const onReorder = (reorderedTasks: StreamTask[]) => setOrderedTasks(reorderedTasks);

  const onReorderComplete = () => {
    dispatch(setCurrentStream({ ...currentStream, tasks: orderedTasks }));
  };

  const initialize = (stream: Stream) => {
    if (stream.state !== StreamState.Uninitialized) return stream;

    return { ...stream, state: StreamState.Initialized };
  };

  const onChange = (updatedTasks: StreamTask[]) => {
    const updatedStream: Stream = { ...initialize(currentStream), tasks: updatedTasks };
    dispatch(updateStream(updatedStream));
    dispatch(setCurrentStream(updatedStream));
  };

  const onNameChange = (newName: string) => {
    const updatedStream: Stream = { ...currentStream, name: newName };
    dispatch(updateStream(updatedStream));
    dispatch(setCurrentStream(updatedStream));
  };

  useEffect(() => {
    if (!_.isEqual(currentStream.tasks, orderedTasks)) {
      setOrderedTasks(currentStream.tasks);
    }
  }, [currentStream.tasks]);

  const isStreamPlayable =
    currentStream.state === StreamState.Uninitialized ||
    currentStream.state === StreamState.Initialized ||
    currentStream.state === StreamState.Paused;

  return (
    <div id="streamEditor" className={`menu frosted`}>
      <StreamEditorHeader currentStream={currentStream} onNameChange={onNameChange} />
      <ArrowNavigable
        waitForChildAnimation
        query=".stream-task-tile:not(.animating), #streamTaskList > button"
        id="streamTaskListWrapper"
      >
        <StreamTaskList
          showNewTaskTile={showNewTaskTile}
          tasks={orderedTasks}
          currentStream={currentStream}
          onReorder={onReorder}
          onReorderComplete={onReorderComplete}
          onChange={onChange}
        />
        {showNewTaskTile && <NewStreamTaskTile onEscape={() => setShowNewTaskTile(false)} createTask={addTask} />}
        {!showNewTaskTile && isStreamPlayable && (
          <button className="icon-accent-button" onClick={() => setShowNewTaskTile(true)}>
            <img src={plusIcon} alt="plus icon" draggable={false} />
            Add To-Do
          </button>
        )}
      </ArrowNavigable>
      {currentStream.state !== StreamState.Uninitialized && (
        <StreamTimeDisplay active={currentStream.state === StreamState.Active} />
      )}
      <StreamEditorActionBar currentStream={currentStream} />
    </div>
  );
};
