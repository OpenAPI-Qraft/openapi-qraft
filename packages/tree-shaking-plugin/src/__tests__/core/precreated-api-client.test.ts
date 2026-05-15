import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createPrecreatedFixtureFiles, writeFixtureFiles } from './fixtures.js';
import { transformQraftTreeShaking } from './harness.js';

describe('transformQraftTreeShaking precreated apiClient clients', () => {
  it('imports an operation directly for a precreated named API client', async () => {
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
import { APIClient as API } from './client';

export function App() {
  return API.pets.getPets.useQuery();
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { createAPIClientOptions } from "./client-options";
      const API_pets_getPets = qraftAPIClient(getPets, {
        useQuery
      }, createAPIClientOptions());
      export function App() {
        return API_pets_getPets.useQuery();
      }"
      `);
  });

  it('keeps precreated optimized client names collision-safe inside shadowed callbacks', async () => {
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

const petParams = { path: { petId: 1 } };

export function App() {
  APIClient.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      // These locals intentionally shadow the generated optimized client name.
      const APIClient_pets_getPetById = () => null;
      await APIClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = APIClient.pets.getPetById.getQueryData(petParams);
      APIClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));
      return { prevPet };
    },
    async onSuccess(updatedPet) {
      // These locals intentionally shadow the generated optimized client name.
      const APIClient_pets_getPetById = () => null;
      APIClient.pets.getPetById.setQueryData(petParams, updatedPet);
      await APIClient.pets.findPetsByStatus.invalidateQueries();
    },
  });
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { updatePet } from "./api/services/PetsService";
      import { createAPIClientOptions } from "./client-options";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getPetById } from "./api/services/PetsService";
      import { getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      const APIClient_pets_updatePet = qraftAPIClient(updatePet, {
        useMutation
      }, createAPIClientOptions());
      const _APIClient_pets_getPetById = qraftAPIClient(getPetById, {
        cancelQueries,
        getQueryData,
        setQueryData
      }, createAPIClientOptions());
      const _APIClient_pets_getPetById2 = qraftAPIClient(getPetById, {
        setQueryData
      }, createAPIClientOptions());
      const APIClient_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
        invalidateQueries
      }, createAPIClientOptions());
      const petParams = {
        path: {
          petId: 1
        }
      };
      export function App() {
        APIClient_pets_updatePet.useMutation(undefined, {
          async onMutate(variables) {
            // These locals intentionally shadow the generated optimized client name.
            const APIClient_pets_getPetById = () => null;
            await _APIClient_pets_getPetById.cancelQueries({
              parameters: petParams
            });
            const prevPet = _APIClient_pets_getPetById.getQueryData(petParams);
            _APIClient_pets_getPetById.setQueryData(petParams, old => ({
              ...old,
              ...variables.body
            }));
            return {
              prevPet
            };
          },
          async onSuccess(updatedPet) {
            // These locals intentionally shadow the generated optimized client name.
            const APIClient_pets_getPetById = () => null;
            _APIClient_pets_getPetById2.setQueryData(petParams, updatedPet);
            await APIClient_pets_findPetsByStatus.invalidateQueries();
          }
        });
      }"
    `);
  });

  it('supports a precreated default API client export', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

const APIClient = createAPIClient(createAPIClientOptions());
export default APIClient;
`)
    );
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import API from './client';

API.pets.getPets.invalidateQueries();
`,
      sourceFile,
      {
        apiClient: [
          {
            client: 'default',
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { getPets } from "./api/services/PetsService";
      import { createAPIClientOptions } from "./client-options";
      const API_pets_getPets = qraftAPIClient(getPets, {
        invalidateQueries
      }, createAPIClientOptions());
      API_pets_getPets.invalidateQueries();"
    `);
  });

  it('imports precreated client options from a separate module', async () => {
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

APIClient.pets.getPets();
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { operationInvokeFn } from "@openapi-qraft/react/callbacks/operationInvokeFn";
      import { getPets } from "./api/services/PetsService";
      import { createAPIClientOptions } from "./client-options";
      const APIClient_pets_getPets = qraftAPIClient(getPets, {
        operationInvokeFn
      }, createAPIClientOptions());
      APIClient_pets_getPets();"
      `);
  });

  it('imports precreated client options from a fixture-relative module', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(
        `
import { createAPIClient } from './api';
import { buildRelativeClientOptions } from './precreated/options/barrel';

export const APIClient = createAPIClient(buildRelativeClientOptions());
`,
        {
          'src/precreated/options/barrel/index.ts': `
export {
  createBarrelClientOptions,
  buildRelativeClientOptions,
} from './create-api-client-options';
`,
          'src/precreated/options/barrel/create-api-client-options.ts': `
export const createBarrelClientOptions = () => ({
  queryClient: {}
});

export const buildRelativeClientOptions = createBarrelClientOptions;
`,
        }
      )
    );
    const sourceFile = path.join(root, 'src/App.tsx');
    const result = await transformQraftTreeShaking(
      `
import { APIClient } from './client';

APIClient.pets.getPets.useQuery();
`,
      sourceFile,
      {
        apiClient: [
          {
            client: 'APIClient',
            clientModule: './client',
            createAPIClientFn: 'createAPIClient',
            createAPIClientFnModule: './api',
            createAPIClientFnOptions: 'buildRelativeClientOptions',
            createAPIClientFnOptionsModule: './precreated/options/barrel',
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
        "import { qraftAPIClient } from "@openapi-qraft/react";
        import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
        import { getPets } from "./api/services/PetsService";
        import { buildRelativeClientOptions } from "./precreated/options/barrel";
        const APIClient_pets_getPets = qraftAPIClient(getPets, {
          useQuery
        }, buildRelativeClientOptions());
        APIClient_pets_getPets.useQuery();"
      `);
  });

  it('imports precreated client options from the same module as the client', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';

export const createAPIClientOptions = () => ({
  queryClient: {}
});

export const APIClient = createAPIClient(createAPIClientOptions());
`)
    );
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { APIClient, createAPIClientOptions } from './client';

APIClient.pets.getPets.useQuery();
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
            // createAPIClientFnOptionsModule: './client' -- not specified, inherited by `clientModule`
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { createAPIClientOptions } from './client';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      const APIClient_pets_getPets = qraftAPIClient(getPets, {
        useQuery
      }, createAPIClientOptions());
      APIClient_pets_getPets.useQuery();"
    `);
  });

  it('skips a precreated client created by a local same-named factory', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(`
const createAPIClient = (options?: unknown) => ({ options });

export const APIClient = createAPIClient({});
`)
    );
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { APIClient } from './client';

APIClient.pets.getPets.useQuery();
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
          },
        ],
      }
    );

    expect(result).toBeNull();
  });

  it('skips a precreated client whose generated factory has no static services import', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(
        `
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';
import { getPets } from './api/services/PetsService';

export const APIClient = createAPIClient(
  {
    pets: {
      getPets
    }
  },
  createAPIClientOptions()
);
`,
        {
          'src/api/index.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(services, options) {
  return qraftAPIClient(services, defaultCallbacks, options);
}
`,
        }
      )
    );
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { APIClient } from './client';

APIClient.pets.getPets.useQuery();
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

    expect(result).toBeNull();
  });

  it('skips a precreated client when the imported factory module does not match the configured one', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(
        `
import { createAPIClient } from './wrong-factory';

export const APIClient = createAPIClient({});
`,
        {
          'src/wrong-factory.ts': `
export function createAPIClient() {
  return {};
}
`,
        }
      )
    );
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { APIClient } from './client';

APIClient.pets.getPets.useQuery();
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
          },
        ],
      }
    );

    expect(result).toBeNull();
  });

  it('skips namespace and dynamic imports of precreated clients', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
export const APIClient = createAPIClient({});
`)
    );
    const sourceFile = path.join(root, 'src/App.tsx');
    const options = {
      apiClient: [
        {
          client: 'APIClient',
          clientModule: './client',
          createAPIClientFn: 'createAPIClient',
          createAPIClientFnModule: './api',
          createAPIClientFnOptions: 'createAPIClientOptions',
        },
      ],
    };

    await expect(
      transformQraftTreeShaking(
        `
import * as clientModule from './client';

clientModule.APIClient.pets.getPets.useQuery();
`,
        sourceFile,
        options
      )
    ).resolves.toBeNull();

    await expect(
      transformQraftTreeShaking(
        `
const clientModule = await import('./client');

clientModule.APIClient.pets.getPets.useQuery();
`,
        sourceFile,
        options
      )
    ).resolves.toBeNull();
  });

  it('keeps a partially transformed precreated client import', async () => {
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

APIClient.pets.getPets.useQuery();
console.log(APIClient);
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
      "import { APIClient } from './client';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { createAPIClientOptions } from "./client-options";
      const APIClient_pets_getPets = qraftAPIClient(getPets, {
        useQuery
      }, createAPIClientOptions());
      APIClient_pets_getPets.useQuery();
      console.log(APIClient);"
      `);
  });

  it('rewrites query-client state callbacks for precreated clients', async () => {
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

APIClient.pets.getPets.getQueryState();
APIClient.pets.getPets.isFetching();
APIClient.pets.updatePet.isMutating();
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { getQueryState } from "@openapi-qraft/react/callbacks/getQueryState";
      import { getPets } from "./api/services/PetsService";
      import { createAPIClientOptions } from "./client-options";
      import { isFetching } from "@openapi-qraft/react/callbacks/isFetching";
      import { isMutating } from "@openapi-qraft/react/callbacks/isMutating";
      import { updatePet } from "./api/services/PetsService";
      const APIClient_pets_getPets = qraftAPIClient(getPets, {
        getQueryState,
        isFetching
      }, createAPIClientOptions());
      const APIClient_pets_updatePet = qraftAPIClient(updatePet, {
        isMutating
      }, createAPIClientOptions());
      APIClient_pets_getPets.getQueryState();
      APIClient_pets_getPets.isFetching();
      APIClient_pets_updatePet.isMutating();"
    `);
  });
});
