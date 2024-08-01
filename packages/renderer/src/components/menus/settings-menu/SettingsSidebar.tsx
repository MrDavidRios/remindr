import { Dispatch, SetStateAction } from 'react';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';

export enum SettingsPage {
  General,
  Appearance,
  Tasks,
  Notifications,
  Data,
  Advanced,
}

interface SettingsSidebarProps {
  page: SettingsPage;
  setPage: Dispatch<SetStateAction<SettingsPage>>;
}

export function SettingsSidebar(props: SettingsSidebarProps) {
  const { page, setPage } = props;

  return (
    <ArrowNavigable autoFocus initialFocusIdx={page} disableCleanup id="settingsSidebar">
      <button
        className={`setting-choice ${page === SettingsPage.General && 'selected'}`}
        onClick={() => setPage(SettingsPage.General)}
        type="button"
      >
        General
      </button>
      <button
        className={`setting-choice ${page === SettingsPage.Appearance && 'selected'}`}
        onClick={() => setPage(SettingsPage.Appearance)}
        type="button"
      >
        Appearance
      </button>
      <button
        className={`setting-choice ${page === SettingsPage.Tasks && 'selected'}`}
        onClick={() => setPage(SettingsPage.Tasks)}
        type="button"
      >
        Tasks
      </button>
      <button
        className={`setting-choice ${page === SettingsPage.Notifications && 'selected'}`}
        onClick={() => setPage(SettingsPage.Notifications)}
        type="button"
      >
        Notifications
      </button>
      <button
        className={`setting-choice ${page === SettingsPage.Data && 'selected'}`}
        onClick={() => setPage(SettingsPage.Data)}
        type="button"
      >
        Data
      </button>
      <button
        className={`setting-choice ${page === SettingsPage.Advanced && 'selected'}`}
        onClick={() => setPage(SettingsPage.Advanced)}
        type="button"
      >
        Advanced
      </button>
    </ArrowNavigable>
  );
}
