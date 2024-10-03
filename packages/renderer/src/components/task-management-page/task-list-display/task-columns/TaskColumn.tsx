import plusIcon from '@assets/icons/plus.svg';
import { columnTasksInDifferentOrder, Task } from '@remindr/shared';
import { ArrowNavigable } from '@renderer/components/accessibility/ArrowNavigable';
import { addTask, updateTasks } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { tasksInSameOrder } from '@renderer/scripts/utils/tasklistutils';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { AnimateChangeInHeight } from '../../AnimateChangeInHeight';
import { NewTaskTile } from '../task-tile/NewTaskTile';
import { TaskTileWrapper } from '../task-tile/TaskTileWrapper';

interface TaskColumnProps {
  name: string;
  tasks: Task[];
}

interface TaskColumnActionBarProps {
  newTaskTileOpen: boolean;
  onAddTask: () => void;
}

const TaskColumnActionBar: React.FC<TaskColumnActionBarProps> = ({ newTaskTileOpen, onAddTask }) => {
  return (
    <motion.div className="task-column-action-bar">
      {!newTaskTileOpen && (
        <button onClick={onAddTask} style={{ marginTop: 12 }}>
          <img src={plusIcon} draggable={false} alt="" />
          Add task
        </button>
      )}
    </motion.div>
  );
};

const getOrderedIncompleteTasks = (tasks: Task[]) => {
  const filtered = tasks.filter((task) => !task.completed);
  const sorted = filtered.sort((a, b) => a.orderInTaskColumn - b.orderInTaskColumn);
  return sorted;
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
      return;
    }
  }, [tasks]);

  const createTask = (taskName: string) => {
    // Make new task serializable for Redux to properly process
    const newTask: Task = JSON.parse(JSON.stringify(new Task(taskName)));
    newTask.taskColumnId = name;
    newTask.orderInTaskColumn = orderedIncompleteTasks.length;

    dispatch(addTask(newTask));
  };

  const onReorder = (reorderedTasks: Task[]) => setOrderedIncompleteTasks(reorderedTasks);

  const animationProps = animationsEnabled
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {};

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

  return (
    <div className="task-column">
      <ArrowNavigable waitForChildAnimation query=".task-tile:not(.animating)" id={name}>
        <AnimateChangeInHeight show>
          <h2>{name}</h2>
          <div className="tasks">
            {orderedIncompleteTasks.length === 0 && <p className="no-tasks-message">All done here!</p>}
            <Reorder.Group
              className="task-group"
              values={orderedIncompleteTasks}
              axis="y"
              onReorder={onReorder}
              {...animationProps}
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
          </div>
          {showNewTaskTile && <NewTaskTile createTask={createTask} onEscape={() => setShowNewTaskTile(false)} />}
          <TaskColumnActionBar newTaskTileOpen={showNewTaskTile} onAddTask={() => setShowNewTaskTile(true)} />
        </AnimateChangeInHeight>
      </ArrowNavigable>
    </div>
  );
};
