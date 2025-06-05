import { app } from 'electron';
import { join } from 'node:path';

export const getMainAssetPath = (path: string) => {
  return import.meta.env.PROD ? join(process.resourcesPath, 'assets', path)
    : join(app.getAppPath(), 'packages/main/public', path);
};
