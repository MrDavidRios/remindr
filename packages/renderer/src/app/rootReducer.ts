import { combineReducers } from '@reduxjs/toolkit';
import appModeReducer from '../features/app-mode/appModeSlice';
import connectionStateReducer from '../features/connection-state/connectionState';
import databaseReducer from '../features/database/databaseSlice';
import menuStateReducer from '../features/menu-state/menuSlice';
import pageStateReducer from '../features/page-state/pageState';
import settingsReducer from '../features/settings/settingsSlice';
import taskListReducer from '../features/task-list/taskListSlice';
import taskModificationReducer from '../features/task-modification/taskModificationSlice';
import updateStateReducer from '../features/update-state/updateState';
import userStateReducer from '../features/user-state/userSlice';

export const rootReducer = combineReducers({
  taskList: taskListReducer,
  appMode: appModeReducer,
  settings: settingsReducer,
  userState: userStateReducer,
  connectionState: connectionStateReducer,
  menuState: menuStateReducer,
  taskModificationState: taskModificationReducer,
  databaseState: databaseReducer,
  updateState: updateStateReducer,
  pageState: pageStateReducer,
});
