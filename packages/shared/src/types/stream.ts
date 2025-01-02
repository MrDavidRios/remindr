import { TaskReference } from './classes/index.js';

export type StreamTask = string | TaskReference;

export type StreamState = 'uninitialized' | 'active' | 'paused' | 'stopped';

export class Stream {
  name: string;

  creationTime: number;

  tasks: StreamTask[];

  state: StreamState;

  constructor(name: string, tasks?: StreamTask[]) {
    this.name = name;
    this.tasks = tasks ?? [];

    this.state = 'uninitialized';
    this.creationTime = new Date().getTime();
  }
}
