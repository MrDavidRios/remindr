import { DialogProps, MenuState, waitUntil } from '@remindr/shared';
import { AppDispatch } from '../app/store';
import { showDialog } from '../features/menu-state/menuSlice';

interface FeedbackDialogProps extends DialogProps {
  dispatch: AppDispatch;
  menuState: MenuState;
}

/**
 * Shows a dialog that asks the user for feedback.
 * @param props
 * @returns
 */
export async function showFeedbackDialog(props: FeedbackDialogProps): Promise<string | undefined> {
  const { title, message, options, dispatch, menuState } = props;

  dispatch(showDialog({ title, message, options }));

  await waitUntil(() => menuState.dialogInfo.result !== undefined);

  return menuState.dialogInfo.result;
}
