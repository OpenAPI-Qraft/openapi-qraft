import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createPrecreatedFixtureFiles,
  getContextFixtureFiles,
  PETS_SERVICE_TS,
  writeFixtureFiles,
} from './fixtures.js';
import { createFixture, transformQraftTreeShaking } from './harness.js';

describe('transformQraftTreeShaking schema and imports', () => {
  it('rewrites schema accesses from context-based and zero-arg createAPIClient calls', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  api.pets.findPetsByStatus.schema;
  createAPIClient().pets.findPetsByStatus.schema;
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
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { findPetsByStatus } from "./api/services/PetsService";
      export function App() {
        findPetsByStatus.schema;
        findPetsByStatus.schema;
      }"
      `);
  });

  it('rewrites schema accesses from precreated API clients directly to operations', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`)
    );
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { APIClient } from './client';

export function App() {
  return APIClient.pets.findPetsByStatus.schema;
}
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
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { findPetsByStatus } from "./api/services/PetsService";
      export function App() {
        return findPetsByStatus.schema;
      }"
      `);
  });

  it('skips schema access for generic factories that do not import services', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      'src/api/createAPIClient.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';

export function createAPIClient(services) {
  return qraftAPIClient(services, {});
}
`,
      'src/api/services/PetsService.ts': PETS_SERVICE_TS,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api/createAPIClient';
import { getPets } from './api/services/PetsService';

const api = createAPIClient({ pets: { getPets } });
api.pets.getPets.schema;
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api/createAPIClient',
            },
          },
        ],
      }
    );

    expect(result).toBeNull();
  });

  it('aliases same-named schema operation imports from different generated roots', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles(
        'APIClientContext',
        './APIClientContext',
        true,
        'context-api'
      ),
      ...createPrecreatedFixtureFiles(
        `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
        {
          'src/precreated-api/index.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(options?: { queryClient: unknown }) {
  return qraftAPIClient(services, defaultCallbacks, options);
}
`,
        }
      ),
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './context-api';
import { APIClient } from './client';

const contextApi = createAPIClient();

contextApi.pets.getPets.schema;
APIClient.pets.getPets.schema;
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './context-api',
            },
          },
          {
            kind: 'precreatedClient',
            client: {
              exportName: 'APIClient',
              moduleSpecifier: './client',
            },
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './precreated-api',
            },
            optionsFactory: {
              exportName: 'createAPIClientOptions',
              moduleSpecifier: './precreated-client-options',
            },
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { getPets } from "./context-api/services/PetsService";
      import { getPets as _getPets } from "./precreated-api/services/PetsService";
      getPets.schema;
      _getPets.schema;"
    `);
  });
});
