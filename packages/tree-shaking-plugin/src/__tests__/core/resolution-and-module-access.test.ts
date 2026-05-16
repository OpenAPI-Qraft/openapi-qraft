import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { transformQraftTreeShaking as transformQraftTreeShakingImpl } from '../../core.js';
import { createFixtureModuleAccess } from './fixtures.js';
import {
  createFixture,
  createTransformAnalysis,
  transformQraftTreeShaking,
} from './harness.js';

describe('transformQraftTreeShaking resolution and module access', () => {
  it('throws by default when a configured transform candidate cannot load generated source', async () => {
    const sourceFile = path.join(
      await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')),
      'src/App.tsx'
    );

    await expect(
      transformQraftTreeShaking(
        `
import { createAPIClient } from './api';
createAPIClient().pets.getPets.useQuery();
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
            resolve: async () => '/virtual/api/index.ts',
            load: async () => null,
          },
        }
      )
    ).rejects.toMatchObject({
      name: 'QraftTreeShakeError',
      reason: expect.objectContaining({
        code: 'entrypoint-source-unavailable',
      }),
    });
  });

  it('throws by default when a usage-before-declaration local client cannot load generated source', async () => {
    const sourceFile = path.join(
      await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')),
      'src/App.tsx'
    );

    await expect(
      transformQraftTreeShaking(
        `
import { createAPIClient } from './api';

export function App() {
  return api.pets.getPets.useQuery();
}

const api = createAPIClient();
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
            resolve: async () => '/virtual/api/index.ts',
            load: async () => null,
          },
        }
      )
    ).rejects.toMatchObject({
      name: 'QraftTreeShakeError',
      reason: expect.objectContaining({
        code: 'entrypoint-source-unavailable',
      }),
    });
  });

  it('skips unresolved transform candidates when diagnostics is off', async () => {
    const sourceFile = path.join(
      await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')),
      'src/App.tsx'
    );

    await expect(
      transformQraftTreeShaking(
        `
import { createAPIClient } from './api';
createAPIClient().pets.getPets.useQuery();
`,
        sourceFile,
        {
          diagnostics: 'off',
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
            resolve: async () => '/virtual/api/index.ts',
            load: async () => null,
          },
        }
      )
    ).resolves.toBeNull();
  });

  it('throws by default when a configured precreated transform candidate cannot resolve generated source', async () => {
    const sourceFile = path.join(
      await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')),
      'src/App.tsx'
    );

    await expect(
      transformQraftTreeShaking(
        `
import { APIClient } from './client';
APIClient.pets.getPets.useQuery();
`,
        sourceFile,
        {
          entrypoints: [
            {
              kind: 'precreatedClient',
              client: {
                exportName: 'APIClient',
                moduleSpecifier: './client',
              },
              factory: {
                exportName: 'createAPIClient',
                moduleSpecifier: './api',
              },
              optionsFactory: {
                exportName: 'createAPIClientOptions',
                moduleSpecifier: './client-options',
              },
            },
          ],
          moduleAccess: {
            resolve: async (specifier) =>
              specifier === './client' ? '/virtual/client.ts' : null,
            load: async () => null,
          },
        }
      )
    ).rejects.toMatchObject({
      name: 'QraftTreeShakeError',
      reason: expect.objectContaining({
        code: 'entrypoint-source-unavailable',
      }),
    });
  });

  it('skips unresolved precreated transform candidates when diagnostics is off', async () => {
    const sourceFile = path.join(
      await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')),
      'src/App.tsx'
    );

    await expect(
      transformQraftTreeShaking(
        `
import { APIClient } from './client';
APIClient.pets.getPets.useQuery();
`,
        sourceFile,
        {
          diagnostics: 'off',
          entrypoints: [
            {
              kind: 'precreatedClient',
              client: {
                exportName: 'APIClient',
                moduleSpecifier: './client',
              },
              factory: {
                exportName: 'createAPIClient',
                moduleSpecifier: './api',
              },
              optionsFactory: {
                exportName: 'createAPIClientOptions',
                moduleSpecifier: './client-options',
              },
            },
          ],
          moduleAccess: {
            resolve: async (specifier) =>
              specifier === './client' ? '/virtual/client.ts' : null,
            load: async () => null,
          },
        }
      )
    ).resolves.toBeNull();
  });

  it('warns and skips unresolved transform candidates when diagnostics is warn', async () => {
    const sourceFile = path.join(
      await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')),
      'src/App.tsx'
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      await expect(
        transformQraftTreeShaking(
          `
import { createAPIClient } from './api';
createAPIClient().pets.getPets.useQuery();
`,
          sourceFile,
          {
            diagnostics: 'warn',
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
              resolve: async () => '/virtual/api/index.ts',
              load: async () => null,
            },
          }
        )
      ).resolves.toBeNull();

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('entrypoint-source-unavailable')
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('uses module access from options by default when creating a transform analysis', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(fixtureModuleAccess.load);

    const analysis = await createTransformAnalysis(
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
            reactContext: {
              exportName: 'APIClientContext',
            },
          },
        ],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load,
        },
      }
    );

    expect(analysis.clients).toHaveLength(1);
    expect(analysis.namedUsages).toHaveLength(1);
    expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
  });

  it('resolves a factory module through the fixture resolver when the bundler cannot', async () => {
    const fixture = await createFixture({ apiDirName: 'generated-api' });
    const sourceFile = path.join(fixture, 'src/App.tsx');

    await fs.writeFile(
      sourceFile,
      `
import { createAPIClient } from './generated-api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`
    );

    const result = await transformQraftTreeShaking(
      await fs.readFile(sourceFile, 'utf8'),
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './generated-api',
            },
            reactContext: {
              exportName: 'APIClientContext',
            },
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./generated-api/services/PetsService";
      import { APIClientContext } from "./generated-api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      export function App() {
        return api_pets_getPets.useQuery();
      }"
    `);
  });

  it('does not read generated modules from the filesystem when moduleAccess.load returns null', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureResolver = createFixtureModuleAccess(fixture).resolve;
    const readFileSpy = vi.spyOn(fs, 'readFile');
    const load = vi.fn(async () => null);

    try {
      const result = await transformQraftTreeShakingImpl(
        `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
        sourceFile,
        {
          diagnostics: 'off',
          entrypoints: [
            {
              kind: 'clientFactory',
              factory: {
                exportName: 'createAPIClient',
                moduleSpecifier: './api',
              },
            },
          ],
        },
        {
          resolve: fixtureResolver,
          load,
        }
      );

      expect(result).toBeNull();
      expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
      expect(readFileSpy).not.toHaveBeenCalled();
    } finally {
      readFileSpy.mockRestore();
    }
  });

  it('supports a legacy resolver 4th argument together with module access load options', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(fixtureModuleAccess.load);

    const result = await transformQraftTreeShakingImpl(
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
            reactContext: {
              exportName: 'APIClientContext',
            },
          },
        ],
        moduleAccess: {
          load,
        },
      },
      fixtureModuleAccess.resolve
    );

    expect(result?.code).toContain('api_pets_getPets.useQuery()');
    expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
  });

  it('prefers module access resolve from options over a conflicting legacy resolver 4th argument', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(fixtureModuleAccess.load);
    const legacyResolver = vi.fn(async () => {
      throw new Error('legacy resolver should not be called');
    });

    const result = await transformQraftTreeShakingImpl(
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
            reactContext: {
              exportName: 'APIClientContext',
            },
          },
        ],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load,
        },
      },
      legacyResolver
    );

    expect(result?.code).toContain('api_pets_getPets.useQuery()');
    expect(legacyResolver).not.toHaveBeenCalled();
    expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
  });

  it('does not match a same-named import that resolves to a different module', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    // Write an unrelated module that exports a same-named symbol but is NOT
    // configured as a factory.
    const otherFile = path.join(fixture, 'src/other.ts');
    await fs.writeFile(
      otherFile,
      `export function createAPIClient() { return { ping: () => 'pong' }; }\n`
    );

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './other';

const lookalike = createAPIClient();

lookalike.pets.getPets.useQuery();
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
      }
    );

    expect(result).toBeNull();
  });

  it('throws by default when a configured factory import specifier cannot be resolved', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    await expect(
      transformQraftTreeShaking(
        `
import { createAPIClient } from 'unresolvable-module';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
        sourceFile,
        {
          entrypoints: [
            {
              kind: 'clientFactory',
              factory: {
                exportName: 'createAPIClient',
                moduleSpecifier: 'unresolvable-module',
              },
            },
          ],
          resolve: () => null,
        }
      )
    ).rejects.toMatchObject({
      name: 'QraftTreeShakeError',
      reason: expect.objectContaining({
        code: 'entrypoint-source-unavailable',
      }),
    });
  });

  it('skips an unresolved configured factory import specifier when diagnostics is off', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    await expect(
      transformQraftTreeShaking(
        `
import { createAPIClient } from 'unresolvable-module';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
        sourceFile,
        {
          diagnostics: 'off',
          entrypoints: [
            {
              kind: 'clientFactory',
              factory: {
                exportName: 'createAPIClient',
                moduleSpecifier: 'unresolvable-module',
              },
            },
          ],
          resolve: () => null,
        }
      )
    ).resolves.toBeNull();
  });

  it('does not report unrelated unresolved same-named precreated imports', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { APIClient } from './other-client';

APIClient.pets.getPets.useQuery();
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'precreatedClient',
            client: {
              exportName: 'APIClient',
              moduleSpecifier: './client',
            },
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api',
            },
            optionsFactory: {
              exportName: 'createAPIClientOptions',
              moduleSpecifier: './client-options',
            },
          },
        ],
        resolve: () => null,
      }
    );

    expect(result).toBeNull();
  });

  it('skips when entrypoints are empty', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
      { entrypoints: [] }
    );

    expect(result).toBeNull();
  });
});
