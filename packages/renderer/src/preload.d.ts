import type {
  AppStateHandler,
  DataHandler,
  DevHandler,
  DialogHandler,
  ElectronHandler,
  FirebaseHandler,
  FsHandler,
  MainWindowHandler,
  NotificationHandler,
  StoreHandler,
  UserStateHandler,
} from 'main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    dev: DevHandler;
    electron: ElectronHandler;
    mainWindow: MainWindowHandler;
    store: StoreHandler;
    dialog: DialogHandler;
    fs: FsHandler;
    firebase: FirebaseHandler;
    data: DataHandler;
    appState: AppStateHandler;
    userState: UserStateHandler;
    notifications: NotificationHandler;
  }
}

export {};
