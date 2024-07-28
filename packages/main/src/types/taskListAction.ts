export type TaskListAction =
  | 'add'
  | 'remove'
  | 'update'
  | 'complete'
  | 'complete-recurring'
  | 'markIncomplete'
  | 'duplicate';

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
    default:
      throw new Error(`Invalid action type: ${action}`);
  }
}
