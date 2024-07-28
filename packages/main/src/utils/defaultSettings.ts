import { AppMode } from '../../../../types/appMode.js';
import { DateFormat } from '../../../../types/dateformat.js';
import type { Settings } from '../../../../types/settings.js';
import { Theme } from '../../../../types/theme.js';
import { Timeframe } from '../../../../types/timeframe.js';

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
    ...overrides,
  };
}
