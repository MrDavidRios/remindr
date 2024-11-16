/**
 * A mapping from task column idx to task column name.
 *
 * If a task column idx is less than the smallest key, then it will be in the column associated with the lowest
 * key. Vice versa for the largest key.
 */
export const TASK_COLUMNS = new Map([
  [-2, 'Past'],
  [-1, 'Yesterday'],
  [0, 'Today'],
  [1, 'Tomorrow'],
  [3, 'Near Future'],
  [20, 'Distant Future'],
]);
