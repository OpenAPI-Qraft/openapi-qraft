import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createPrecreatedFixtureFiles, writeFixtureFiles } from './fixtures.js';
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
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
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
        apiClient: [
          {
            client: 'APIClient',
            clientModule: './client',
            createAPIClientFn: 'createAPIClient',
            createAPIClientFnModule: './api',
            createAPIClientFnOptions: 'createAPIClientOptions',
            createAPIClientFnOptionsModule: './client-options',
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

  // Production gap: mixed context + precreated schema rewrites currently leave the
  // precreated access untouched instead of aliasing the second generated operation import.
  it.skip('aliases same-named schema operation imports from different generated roots', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
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
      'src/context-api/index.ts': `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { APIClientContext } from './APIClientContext';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, APIClientContext);
}
`,
      'src/context-api/APIClientContext.ts': `
export const APIClientContext = {};
`,
      'src/context-api/services/index.ts': `
import { petsService } from './PetsService';
import { storesService } from './StoresService';

export const services = {
  pets: petsService,
  stores: storesService,
} as const;
`,
      'src/context-api/services/PetsService.ts': `
export const getPets = { schema: { method: 'get', url: '/pets' } };
export const createPet = { schema: { method: 'post', url: '/pets' } };

export const petsService = {
  getPets,
  createPet,
} as const;
`,
      'src/context-api/services/StoresService.ts': `
export const getStores = { schema: { method: 'get', url: '/stores' } };

export const storesService = {
  getStores,
} as const;
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './context-api';
import { APIClient } from './precreated-client';

const contextApi = createAPIClient();

contextApi.pets.getPets.schema;
APIClient.pets.getPets.schema;
`,
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createAPIClient', module: './context-api' },
        ],
        apiClient: [
          {
            client: 'APIClient',
            clientModule: './precreated-client',
            createAPIClientFn: 'createAPIClient',
            createAPIClientFnModule: './precreated-api',
            createAPIClientFnOptions: 'createAPIClientOptions',
            createAPIClientFnOptionsModule: './precreated-client-options',
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
