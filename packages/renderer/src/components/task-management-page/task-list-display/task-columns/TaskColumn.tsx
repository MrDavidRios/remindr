import { columnTasksInDifferentOrder, Task } from '@remindr/shared';
import { getColumnIdxFromName } from '@remindr/shared/src';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { addTask, updateTasks } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { tasksInSameOrder } from '@renderer/scripts/utils/tasklistutils';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { NewTaskTile } from '../task-tile/NewTaskTile';
import { TaskTileWrapper } from '../task-tile/TaskTileWrapper';
import { TaskColumnActionBar } from './TaskColumnActionBar';

interface TaskColumnProps {
  name: string;
  tasks: Task[];
}

const getOrderedIncompleteTasks = (tasks: Task[]) => {
  const filtered = tasks.filter((task) => !task.completed);
  filtered.sort((a, b) => a.orderInTaskColumn - b.orderInTaskColumn);

  return filtered;
};

export const TaskColumn: React.FC<TaskColumnProps> = ({ name, tasks }) => {
  const dispatch = useAppDispatch();
  const animationsEnabled = useAnimationsEnabled();

  const completeTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = getOrderedIncompleteTasks(tasks);

  const [orderedIncompleteTasks, setOrderedIncompleteTasks] = useState(incompleteTasks);
  const [showNewTaskTile, setShowNewTaskTile] = useState(false);

  useEffect(() => {
    if (!_.isEqual(tasks, orderedIncompleteTasks) || !tasksInSameOrder(tasks, orderedIncompleteTasks)) {
      const filteredTasks = getOrderedIncompleteTasks(tasks);
      setOrderedIncompleteTasks(filteredTasks);
    }
  }, [tasks]);

  const createTask = (taskName: string) => {
    // Make new task serializable for Redux to properly process
    const newTask: Task = JSON.parse(JSON.stringify(new Task(taskName)));
    newTask.columnIdx = getColumnIdxFromName(name);
    newTask.orderInTaskColumn = orderedIncompleteTasks.length;

    dispatch(addTask(newTask));
  };

  const onReorder = (reorderedTasks: Task[]) => setOrderedIncompleteTasks(reorderedTasks);

  const onReorderComplete = () => {
    const clonedIncompleteTasks: Task[] = [];
    for (let i = 0; i < orderedIncompleteTasks.length; i++) {
      const task = JSON.parse(JSON.stringify(orderedIncompleteTasks[i]));
      task.orderInTaskColumn = i;

      clonedIncompleteTasks.push(task);
    }

    // If sorting the column tasks puts them in the same order, don't re-save the list.
    if (!columnTasksInDifferentOrder(orderedIncompleteTasks, clonedIncompleteTasks)) return;

    dispatch(updateTasks(clonedIncompleteTasks));
  };

  const showNoTasksMessage = orderedIncompleteTasks.length === 0 && !showNewTaskTile;
  return (
    <div className="task-column frosted">
      <h2>{name}</h2>
      <ArrowNavigable waitForChildAnimation query=".task-tile:not(.animating)" className="tasks" id={name}>
        {showNoTasksMessage && <p className="no-tasks-message">All done here!</p>}
        <Reorder.Group
          className="task-group"
          values={orderedIncompleteTasks}
          layoutScroll
          axis="y"
          onReorder={onReorder}
        >
          <AnimatePresence mode="popLayout">
            {orderedIncompleteTasks.map((task) => (
              <div key={task.creationTime}>
                <TaskTileWrapper task={task} reorderable onReorderComplete={onReorderComplete} />
              </div>
            ))}
          </AnimatePresence>
        </Reorder.Group>
        {completeTasks.length > 0 && (
          <>
            <motion.p className="complete-tasks-header" layout={animationsEnabled ? 'position' : false}>
              Completed
            </motion.p>
            <AnimatePresence mode="popLayout">
              {completeTasks.map((task) => (
                <div key={task.creationTime}>
                  <TaskTileWrapper task={task} />
                </div>
              ))}
            </AnimatePresence>
          </>
        )}
      </ArrowNavigable>
      {showNewTaskTile && <NewTaskTile createTask={createTask} onEscape={() => setShowNewTaskTile(false)} />}
      <TaskColumnActionBar
        columnIdx={getColumnIdxFromName(name)}
        newTaskTileOpen={showNewTaskTile}
        onAddTask={() => setShowNewTaskTile(true)}
      />
    </div>
  );
};
