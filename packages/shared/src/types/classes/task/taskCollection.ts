import type { Task } from './task.js';

export class TaskCollection {
  taskList: Task[];

  constructor(taskList?: Task[]) {
    this.taskList = taskList ?? [];
  }
}
