import TaskCollection from './classes/task/taskCollection.ts';
import User from './classes/user.ts';

export default interface CompleteAppData {
  userData: User;

  taskData: TaskCollection;
}
