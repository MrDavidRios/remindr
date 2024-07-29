import Task from './task.js';

export default class TaskCollection {
  taskList: Task[];

  constructor(taskList?: Task[]) {
    this.taskList = taskList ?? [];
  }
}
