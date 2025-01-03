import { StreamState, StreamTask } from '@remindr/shared';
import { addTaskToCurrentStream, setCurrentStream } from '@renderer/features/stream-list/streamListSlice';
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

  const onToggleCompleteTask = (task: StreamTask) => {
    const taskIdx = orderedTasks.findIndex((t) => t.creationTime === task.creationTime);
    const updatedTasks = [...orderedTasks];
    updatedTasks[taskIdx] = { ...task, completed: !task.completed };

    setOrderedTasks(updatedTasks);
    dispatch(setCurrentStream({ ...currentStream, tasks: updatedTasks }));
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
      <div id="streamTaskListWrapper">
        <StreamTaskList
          showNewTaskTile={showNewTaskTile}
          orderedTasks={orderedTasks}
          currentStream={currentStream}
          onReorder={onReorder}
          onReorderComplete={onReorderComplete}
          onToggleCompleteTask={onToggleCompleteTask}
        />
        {showNewTaskTile && <NewStreamTaskTile onEscape={() => setShowNewTaskTile(false)} createTask={addTask} />}
        {!showNewTaskTile && isStreamPlayable && (
          <button className="accent-button" onClick={() => setShowNewTaskTile(true)}>
            Add To-Do
          </button>
        )}
      </div>
      <StreamEditorActionBar currentStream={currentStream} />
    </div>
  );
};
