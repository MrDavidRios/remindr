import { TASK_COLUMNS } from '../index.js';

export function getColumnIdxFromName(name: string) {
  // get idx of column by name (TASK_COLUMNS has idx as key and name as value)
  for (const [idx, column] of TASK_COLUMNS.entries()) {
    if (column === name) {
      return idx;
    }
  }

  return -1;
}
