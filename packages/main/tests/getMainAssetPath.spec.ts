import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { getMainAssetPath } from '../src/utils/getMainAssetPath';

// Mock app.getAppPath
vi.mock('electron', () => {
  return {
    app: {
      getAppPath: vi.fn(() => '/mocked/app/path'),
    },
  };
});

describe('getMainAssetPath', () => {
  it('should return the correct path in production environment', () => {
    vi.stubEnv('PROD', true);

    const result = getMainAssetPath('test-file.txt');
    const expectedPath = path.join('/mocked/app/path', 'packages', 'main', 'dist', 'test-file.txt');
    expect(result).toBe(expectedPath);
  });

  it('should return the correct path in development environment', () => {
    vi.stubEnv('PROD', false);

    const result = getMainAssetPath('test-file.txt');
    const expectedPath = path.join('/mocked/app/path', 'packages', 'main', 'public', 'test-file.txt');
    expect(result).toBe(expectedPath);
  });
});
