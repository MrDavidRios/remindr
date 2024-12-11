import { DateFormat } from '../dateformat.js';
import { Page } from '../page.js';
import { Theme } from '../theme.js';
import { Timeframe } from '../timeframe.js';
import { AppMode } from './appMode.js';

export type Settings = {
  autoStartup: boolean;

  hideOnStartup: boolean;

  startupMode: AppMode;

  startupView: Page;

  autoUpdate: boolean;

  theme: Theme;

  background: string;

  stretchBackground: boolean;

  backgroundOpacity: number;

  nativeNotifications: boolean;

  militaryTime: boolean;

  defaultTimeframe: Timeframe;

  enableAnimations: boolean;

  enableTransparency: boolean;

  overdueShownAsToday: boolean;

  overdueBadge: boolean;

  overdueTrayBadge: boolean;

  // Date & Time
  dateFormat: DateFormat;

  /**
   * The day of the week that the week starts on.
   * 0 = Sunday, 1 = Monday, etc.
   */
  weekStartDay: number;

  /**
   * The timestamp of the last time the settings were updated.
   */
  timestamp: number;

  /**
   * Desktop-specific settings
   */
  unsavedTaskWarning: boolean;

  spellcheck: boolean;

  reorderableTodo: boolean;

  showCompletedTasks: boolean;

  enabledTaskColumns: number[];
};

export function createDefaultSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    militaryTime: false,
    defaultTimeframe: Timeframe.All,
    enableAnimations: true,
    enableTransparency: true,
    overdueShownAsToday: true,
    overdueBadge: true,
    overdueTrayBadge: true,
    dateFormat: DateFormat.MDYText,
    weekStartDay: 0,
    autoStartup: true,
    autoUpdate: true,
    hideOnStartup: false,
    startupMode: AppMode.Online,
    startupView: Page.ColumnView,
    background: '#121212',
    stretchBackground: true,
    theme: Theme.Dark,
    backgroundOpacity: 0,
    nativeNotifications: false,
    timestamp: -1,
    unsavedTaskWarning: true,
    spellcheck: true,
    reorderableTodo: false,
    showCompletedTasks: true,
    enabledTaskColumns: [-1, 0, 1],
    ...overrides,
  };
}
