import { AppMode } from '../../../shared/src/types/classes/appMode.js';
import type { Settings } from '../../../shared/src/types/classes/settings.js';
import { DateFormat } from '../../../shared/src/types/dateformat.js';
import { Theme } from '../../../shared/src/types/theme.js';
import { Timeframe } from '../../../shared/src/types/timeframe.js';

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
    enabledTaskColumns: [-1, 0, 1],
    ...overrides,
  };
}
