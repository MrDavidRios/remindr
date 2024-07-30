import React from 'react';

export function isCmdorCtrlPressed(e: React.KeyboardEvent) {
  return (!window.electron.process.isMac() && e.ctrlKey) || (window.electron.process.isMac() && e.metaKey);
}
