import { DARK_THEME, LIGHT_THEME } from '../constants/theme.js';
import { Theme } from '../types/theme.js';

export const getThemeColors = (theme: Theme, transparencyEnabled?: boolean) => {
  return theme === Theme.Dark ? DARK_THEME(transparencyEnabled) : LIGHT_THEME(transparencyEnabled);
};
