import { Task } from "@remindr/shared";
import { ArrowNavigable } from "@renderer/components/accessibility/ArrowNavigable";
import { FC } from "react";
import { TaskTileWrapper } from "../task-tile/TaskTileWrapper";

interface TaskGroupProps {
  tasks: Task[];
  expanded: boolean;
  name: string;
}

export const TaskGroup: FC<TaskGroupProps> = ({ tasks, expanded, name }) => {
  return (
    <ArrowNavigable asUl query=".task-tile" id={name}>
      {expanded && (
        <div className="task-group">
          {tasks.map((task) => (
            <div key={task.creationTime}>
              <TaskTileWrapper task={task} />
            </div>
          ))}
        </div>
      )}
    </ArrowNavigable>
  );
};
