import { Stream, StreamState, StreamTask } from '@remindr/shared';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { addTaskToCurrentStream, setCurrentStream, updateStream } from '@renderer/features/stream-list/streamListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import _ from 'lodash';
import { FC, useEffect, useState } from 'react';
import { NewStreamTaskTile } from '../NewStreamTaskTile';
import { StreamEditorActionBar } from './StreamEditorActionBar';
import { StreamEditorHeader } from './StreamEditorHeader';
import { StreamTaskList } from './StreamTaskList';

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

    setOrderedTasks([...orderedTasks, newStreamTask]);
    dispatch(addTaskToCurrentStream(newStreamTask));
  };

  const onReorder = (reorderedTasks: StreamTask[]) => setOrderedTasks(reorderedTasks);

  const onReorderComplete = () => {
    dispatch(setCurrentStream({ ...currentStream, tasks: orderedTasks }));
  };

  const onChange = (updatedTasks: StreamTask[]) => {
    const updatedStream: Stream = { ...currentStream, tasks: updatedTasks };
    dispatch(updateStream(updatedStream));
    dispatch(setCurrentStream(updatedStream));
  };

  useEffect(() => {
    if (!_.isEqual(currentStream.tasks, orderedTasks)) {
      setOrderedTasks(currentStream.tasks);
    }
  }, [currentStream.tasks]);

  const isStreamPlayable =
    currentStream.state === StreamState.Uninitialized || currentStream.state === StreamState.Paused;

  return (
    <div id="streamEditor" className="menu frosted">
      <StreamEditorHeader currentStream={currentStream} />
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
          <button className="accent-button" onClick={() => setShowNewTaskTile(true)}>
            Add To-Do
          </button>
        )}
      </ArrowNavigable>
      <StreamEditorActionBar currentStream={currentStream} />
    </div>
  );
};
