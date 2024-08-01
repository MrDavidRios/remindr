import { createListenerMiddleware } from '@reduxjs/toolkit';
import { Menu, Task } from '@remindr/shared';
import _ from 'lodash';
import { hideMenu, showDialog, showMenu } from '../menuSlice';
import { AppDispatch, RootState } from '/@/app/store';
import { isFullscreenMenuOpen } from '/@/scripts/utils/menuutils';
import { waitUntil } from '/@/scripts/utils/timing';

export const unsavedTaskDialogMiddleware = createListenerMiddleware();
export const startListeningForHideMenu = unsavedTaskDialogMiddleware.startListening.withTypes<RootState, AppDispatch>();

startListeningForHideMenu({
  actionCreator: hideMenu,
  effect: async (action, listenerApi) => {
    if (action.payload.menu !== Menu.TaskCreateMenu) return;
    if (!action.payload.checkForUnsavedWork) return;
    if (!listenerApi.getState().settings.value.unsavedTaskWarning) return;

    const taskCreateMenu = document.getElementById('taskCreationWindow');
    if (taskCreateMenu?.classList.contains('closing')) return;

    listenerApi.cancelActiveListeners();

    const fullscreenMenuOpen = isFullscreenMenuOpen(listenerApi.getState().menuState);
    if (fullscreenMenuOpen) return;

    const createdTaskState = listenerApi.getState().taskModificationState.taskCreationState.editedTask ?? new Task('');
    const createdTask = JSON.parse(JSON.stringify(createdTaskState));
    const blankTask = JSON.parse(JSON.stringify(new Task('')));

    createdTask.creationTime = 0;
    blankTask.creationTime = 0;

    if (!_.isEqual(createdTask, blankTask)) {
      const title = 'Unsaved Task';
      const message = 'Would you like to continue editing this task?';
      const options = ['Discard', 'Continue'];

      listenerApi.dispatch(showDialog({ title, message, options }));
      listenerApi.dispatch(showMenu(Menu.TaskCreateMenu));

      await waitUntil(() => listenerApi.getState().menuState.dialogInfo.result !== undefined);
      const dialogResult = listenerApi.getState().menuState.dialogInfo.result;

      listenerApi.dispatch(hideMenu({ menu: Menu.MessageModal }));

      if (dialogResult?.toLowerCase() === 'continue') return;

      listenerApi.dispatch(hideMenu({ menu: Menu.TaskCreateMenu, checkForUnsavedWork: false }));
    }
  },
});
