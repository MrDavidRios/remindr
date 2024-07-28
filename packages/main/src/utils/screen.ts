import { screen } from 'electron';

export function getScreenWidth() {
  return screen.getPrimaryDisplay().bounds.width;
}

/** Returns usable screen height (not including taskbar) */
export function getScreenHeight() {
  return screen.getPrimaryDisplay().workArea.height;
}
