import { generateUniqueID } from '../../../utils/index.js';

export default class Subtask {
  name: string;

  complete: boolean;

  id: number;

  constructor(name: string, complete?: boolean, id?: number) {
    this.name = name;
    this.complete = complete ?? false;
    this.id = id ?? generateUniqueID();
  }
}
