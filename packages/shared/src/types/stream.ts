export type StreamTask = {
  creationTime: number;
  name: string;
  completed: boolean;
  /**
   * If true, this task is a reference to a task in the user's task list. The creation time will be treated as a
   * reference to the task rather than the creation time for the `StreamTask`.
   */
  isTaskReference: boolean;
};

export enum StreamState {
  Uninitialized,
  Active,
  Paused,
  Completed,
}

export class Stream {
  name: string;

  creationTime: number;

  tasks: StreamTask[];

  state: StreamState;

  /** Elapsed time in seconds */
  elapsedTime: number;

  constructor(name: string, tasks?: StreamTask[]) {
    this.name = name;
    this.tasks = tasks ?? [];

    this.state = StreamState.Uninitialized;
    this.creationTime = new Date().getTime();
    this.elapsedTime = 0;
  }
}
