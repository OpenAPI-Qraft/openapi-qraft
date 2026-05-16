import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createFixtureModuleAccess } from './fixtures.js';
import { createFixture, transformQraftTreeShaking } from './harness.js';

describe('transformQraftTreeShaking harness', () => {
  it('preserves an explicit moduleAccess.load override', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(async () => null);
    const readFileSpy = vi.spyOn(fs, 'readFile');

    try {
      const result = await transformQraftTreeShaking(
        `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
        sourceFile,
        {
          entrypoints: [
            {
              kind: 'clientFactory',
              factory: {
                exportName: 'createAPIClient',
                moduleSpecifier: './api',
              },
            },
          ],
          moduleAccess: {
            resolve: fixtureModuleAccess.resolve,
            load,
          },
        }
      );

      expect(result).toBeNull();
      expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
      expect(readFileSpy).not.toHaveBeenCalled();
    } finally {
      readFileSpy.mockRestore();
    }
  });
});
