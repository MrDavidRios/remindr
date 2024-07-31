import type { TaskCollection } from './classes/task/taskCollection.js';
import type { User } from './classes/user.js';

export interface CompleteAppData {
  userData: User;

  taskData: TaskCollection;
}
