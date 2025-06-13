export type TaskListAction =
  | 'add'
  | 'remove'
  | 'update'
  | 'complete'
  | 'complete-recurring'
  | 'markIncomplete'
  | 'duplicate'
  | 'pin'
  | 'unpin';

export function getTaskListActionVerb(action: TaskListAction): string {
  switch (action) {
    case 'add':
      return 'added';
    case 'remove':
      return 'removed';
    case 'update':
      return 'updated';
    case 'complete':
    case 'complete-recurring':
      return 'completed';
    case 'markIncomplete':
      return 'marked incomplete';
    case 'duplicate':
      return 'duplicated';
    case 'pin':
      return 'pinned';
    case 'unpin':
      return 'unpinned';
    default:
      throw new Error(`Invalid action type: ${action}`);
  }
}
