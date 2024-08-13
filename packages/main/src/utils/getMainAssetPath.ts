import { app } from 'electron';
import { join } from 'node:path';

export const getMainAssetPath = (path: string) => {
  return join(app.getAppPath(), import.meta.env.PROD ? `packages/main/dist/${path}` : `packages/main/public/${path}`);
};
