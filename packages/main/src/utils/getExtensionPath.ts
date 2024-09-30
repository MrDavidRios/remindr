import os from 'os';
import path from 'path';

export const getExtensionPath = (extensionSlug: string, profile = 1, overrideSlug?: string) => {
  if (!process.platform || !['win32', 'darwin'].includes(process.platform)) {
    console.error(`Unsupported OS: ${process.platform}`);
    return './';
  }
  let extensionsPath = `AppData/Local/Google/Chrome/User Data/Profile ${profile}/Extensions`;

  if (process.platform === 'darwin') {
    extensionsPath = `/Library/Application Support/Google/Chrome/Profile ${profile}/Extensions/`;
  }

  if (overrideSlug) {
    extensionsPath = extensionsPath.replace(`/Profile ${profile}/Extensions`, overrideSlug);
  }

  return path.join(os.homedir(), extensionsPath, overrideSlug ? '' : extensionSlug);
};
