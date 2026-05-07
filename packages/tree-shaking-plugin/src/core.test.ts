import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { transformQraftTreeShaking } from './core.js';

const PRECREATED_API_INDEX_TS = `
import { qraftAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(options?: { queryClient: unknown }) {
  return qraftAPIClient(services, defaultCallbacks, options);
}
`;

const SERVICES_INDEX_TS = `
import { petsService } from './PetsService';
import { storesService } from './StoresService';

export const services = {
  pets: petsService,
  stores: storesService,
} as const;
`;

const PETS_SERVICE_TS = `
export const getPets = { schema: { method: 'get', url: '/pets' } };
export const createPet = { schema: { method: 'post', url: '/pets' } };
export const updatePet = { schema: { method: 'put', url: '/pets/{petId}' } };
export const getPetById = { schema: { method: 'get', url: '/pets/{petId}' } };
export const findPetsByStatus = { schema: { method: 'get', url: '/pets/findByStatus' } };

export const petsService = {
  getPets,
  createPet,
  updatePet,
  getPetById,
  findPetsByStatus,
} as const;
`;

const STORES_SERVICE_TS = `
export const getStores = { schema: { method: 'get', url: '/stores' } };

export const storesService = {
  getStores,
} as const;
`;

const DEFAULT_PRECREATED_CLIENT_OPTIONS_TS = `
export const createAPIClientOptions = () => ({
  queryClient: {}
});
`;

describe('transformQraftTreeShaking', () => {
  it('imports an operation directly for a context API client', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      export function App() {
        return api_pets_getPets.useQuery();
      }"
      `);
  });

  it('aliases an imported operation when a local binding uses the same name', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();
// These bindings intentionally collide with generated names.
const getPets = async () => {};
const _getPets = async () => {};
const api_pets_getPets = () => {};
const _api_pets_getPets = () => {};

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets as _getPets2 } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const _api_pets_getPets2 = qraftReactAPIClient(_getPets2, {
        useQuery
      }, APIClientContext);
      // These bindings intentionally collide with generated names.
      const getPets = async () => {};
      const _getPets = async () => {};
      const api_pets_getPets = () => {};
      const _api_pets_getPets = () => {};
      export function App() {
        return _api_pets_getPets2.useQuery();
      }"
      `);
  });

  it('does not alias a top-level generated client because of an inner scope binding', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

function helper() {
  const api_pets_getPets = () => {};
  return api_pets_getPets;
}

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      function helper() {
        const api_pets_getPets = () => {};
        return api_pets_getPets;
      }
      export function App() {
        return api_pets_getPets.useQuery();
      }"
      `);
  });

  it('supports a custom context name from the generated factory import', async () => {
    const fixture = await createFixture({
      contextName: 'MyAPIContext',
      contextModule: './MyAPIContext',
    });
    const sourceFile = path.join(fixture, 'src/App.tsx');

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
        createAPIClientFn: [
          {
            name: 'createAPIClient',
            module: './api',
            context: 'MyAPIContext',
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { MyAPIContext } from "./api/MyAPIContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, MyAPIContext);
      export function App() {
        return api_pets_getPets.useQuery();
      }"
    `);
  });

  it('supports an explicit context module for the generated factory', async () => {
    const fixture = await createFixture({
      contextName: 'MyAPIContext',
      contextModule: '@my-org/api/context',
      importContext: false,
    });
    const sourceFile = path.join(fixture, 'src/App.tsx');

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
        createAPIClientFn: [
          {
            name: 'createAPIClient',
            module: './api',
            context: 'MyAPIContext',
            contextModule: './api/MyAPIContext',
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { MyAPIContext } from "./api/MyAPIContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, MyAPIContext);
      export function App() {
        return api_pets_getPets.useQuery();
      }"
    `);
  });

  it('groups callbacks per operation and imports operationInvokeFn directly', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.getQueryKey({});
api.pets.getPets();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      import { operationInvokeFn } from "@openapi-qraft/react/callbacks/operationInvokeFn";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        getQueryKey,
        operationInvokeFn
      }, APIClientContext);
      api_pets_getPets.getQueryKey({});
      api_pets_getPets();"
    `);
  });

  it('creates separate optimized clients for multiple operations from the same service', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
api.pets.createPet.useMutation();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { createPet } from "./api/services/PetsService";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      const api_pets_createPet = qraftReactAPIClient(createPet, {
        useMutation
      }, APIClientContext);
      api_pets_getPets.useQuery();
      api_pets_createPet.useMutation();"
    `);
  });

  it('creates separate optimized clients for operations from different services', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
api.stores.getStores.useQuery();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      import { getStores } from "./api/services/StoresService";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      const api_stores_getStores = qraftReactAPIClient(getStores, {
        useQuery
      }, APIClientContext);
      api_pets_getPets.useQuery();
      api_stores_getStores.useQuery();"
    `);
  });

  it('keeps the original client when an unsupported reference remains', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

// Unsupported raw client reference keeps the original client binding alive.
console.log(api);
api.pets.getPets.useQuery();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { createAPIClient } from './api';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      const api = createAPIClient();

      // Unsupported raw client reference keeps the original client binding alive.
      console.log(api);
      api_pets_getPets.useQuery();"
    `);
  });

  it('optimizes explicit options clients created inside callbacks', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const getQueryData = () => null;
      const apiClient_pets_getPetById = () => null;
      const apiClient = createAPIClient(apiContext!);

      await apiClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient.pets.getPetById.getQueryData(petParams);

      apiClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      return { prevPet, getQueryData, apiClient_pets_getPetById };
    },
  });
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { updatePet } from "./api/services/PetsService";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getPetById } from "./api/services/PetsService";
      import { getQueryData as _getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      const api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useMutation
      }, APIClientContext);
      function PetUpdateForm({
        petId
      }: {
        petId: number;
      }) {
        const apiContext = useContext(APIClientContext);
        const petParams = {
          path: {
            petId
          }
        };
        api_pets_updatePet.useMutation(undefined, {
          async onMutate(variables) {
            const getQueryData = () => null;
            const apiClient_pets_getPetById = () => null;
            const _apiClient_pets_getPetById = qraftReactAPIClient(getPetById, {
              cancelQueries,
              getQueryData: _getQueryData,
              setQueryData
            }, apiContext!);
            await _apiClient_pets_getPetById.cancelQueries({
              parameters: petParams
            });
            const prevPet = _apiClient_pets_getPetById.getQueryData(petParams);
            _apiClient_pets_getPetById.setQueryData(petParams, old => ({
              ...old,
              ...variables.body
            }));
            return {
              prevPet,
              getQueryData,
              apiClient_pets_getPetById
            };
          }
        });
      }"
      `);
  });

  it('optimizes inline explicit options clients', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

function PetUpdateForm() {
  const apiContext = useContext(APIClientContext);

  createAPIClient(apiContext!).pets.getPetById.setQueryData(
    { path: { petId: 1 } },
    { id: 1 }
  );

  createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { getPetById } from "./api/services/PetsService";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      function PetUpdateForm() {
        const apiContext = useContext(APIClientContext);
        qraftReactAPIClient(getPetById, {
          setQueryData
        }, apiContext!).setQueryData({
          path: {
            petId: 1
          }
        }, {
          id: 1
        });
        qraftReactAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
      }"
      `);
  });

  it('aliases generated names for explicit options clients inside nested function scopes', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      // These bindings intentionally collide with generated names in this callback scope.
      const getQueryData = () => null;
      const _getQueryData = () => null;
      const apiClient_pets_getPetById = () => null;
      const _apiClient_pets_getPetById = () => null;
      const apiClient = createAPIClient(apiContext!);

      await apiClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient.pets.getPetById.getQueryData(petParams);

      apiClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      return { prevPet };
    },
  });
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { updatePet } from "./api/services/PetsService";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getPetById } from "./api/services/PetsService";
      import { getQueryData as _getQueryData2 } from "@openapi-qraft/react/callbacks/getQueryData";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      const api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useMutation
      }, APIClientContext);
      function PetUpdateForm({
        petId
      }: {
        petId: number;
      }) {
        const apiContext = useContext(APIClientContext);
        const petParams = {
          path: {
            petId
          }
        };
        api_pets_updatePet.useMutation(undefined, {
          async onMutate(variables) {
            // These bindings intentionally collide with generated names in this callback scope.
            const getQueryData = () => null;
            const _getQueryData = () => null;
            const apiClient_pets_getPetById = () => null;
            const _apiClient_pets_getPetById = () => null;
            const _apiClient_pets_getPetById2 = qraftReactAPIClient(getPetById, {
              cancelQueries,
              getQueryData: _getQueryData2,
              setQueryData
            }, apiContext!);
            await _apiClient_pets_getPetById2.cancelQueries({
              parameters: petParams
            });
            const prevPet = _apiClient_pets_getPetById2.getQueryData(petParams);
            _apiClient_pets_getPetById2.setQueryData(petParams, old => ({
              ...old,
              ...variables.body
            }));
            return {
              prevPet
            };
          }
        });
      }"
      `);
  });

  it('preserves void and await prefixes for named client calls', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

async function run() {
  void api.pets.findPetsByStatus.invalidateQueries();
  await api.pets.findPetsByStatus.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_findPetsByStatus = qraftReactAPIClient(findPetsByStatus, {
        invalidateQueries
      }, APIClientContext);
      async function run() {
        void api_pets_findPetsByStatus.invalidateQueries();
        await api_pets_findPetsByStatus.invalidateQueries();
      }"
    `);
  });

  it('preserves void and await prefixes for inline client calls', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

async function run() {
  const apiContext = useContext(APIClientContext);
  void createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
  await createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      async function run() {
        const apiContext = useContext(APIClientContext);
        void qraftReactAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
        await qraftReactAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
      }"
    `);
  });

  it('handles the same operation called via named and inline clients in the same scope', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

async function run() {
  const apiContext = useContext(APIClientContext);

  api.pets.getPets.invalidateQueries();
  createAPIClient(apiContext!).pets.getPets.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { getPets } from "./api/services/PetsService";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        invalidateQueries
      }, APIClientContext);
      async function run() {
        const apiContext = useContext(APIClientContext);
        api_pets_getPets.invalidateQueries();
        qraftReactAPIClient(getPets, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
      }"
    `);
  });

  it('skips callbacks-like object arguments', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';

const api = createAPIClient({ useQuery });

api.pets.getPets.useQuery();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result).toBeNull();
  });

  it('skips exported clients', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

export const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result).toBeNull();
  });

  it('recognizes a custom factory name imported via a bare module specifier', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const apiIndex = path.join(fixture, 'src/api/index.ts');

    const result = await transformQraftTreeShaking(
      `
import { createMyAPIClient } from '@api/my-api';

const api = createMyAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createMyAPIClient', module: '@api/my-api' },
        ],
        async resolve(specifier) {
          if (specifier === '@api/my-api') return apiIndex;
          return null;
        },
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      export function App() {
        return api_pets_getPets.useQuery();
      }"
      `);
  });

  it('resolves a factory module from the project root when the bundler cannot', async () => {
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

    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(fixture);
    try {
      const result = await transformQraftTreeShaking(
        await fs.readFile(sourceFile, 'utf8'),
        sourceFile,
        {
          createAPIClientFn: [
            { name: 'createAPIClient', module: './src/generated-api' },
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
    } finally {
      cwdSpy.mockRestore();
    }
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
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result).toBeNull();
  });

  it('returns null when the specifier cannot be resolved', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from 'unresolvable-module';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createAPIClient', module: 'unresolvable-module' },
        ],
        resolve: () => null,
      }
    );

    expect(result).toBeNull();
  });

  it('skips when createAPIClientFn is empty', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
      { createAPIClientFn: [] }
    );

    expect(result).toBeNull();
  });

  it('supports two factory functions that share the same generated services', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, createExtraAPIClient } from './api';

const api = createAPIClient();
const extraApi = createExtraAPIClient();

export function App() {
  api.pets.getPets.useQuery();
  extraApi.pets.getPets.useQuery();
}
`,
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createAPIClient', module: './api' },
          { name: 'createExtraAPIClient', module: './api' },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      const extraApi_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      export function App() {
        api_pets_getPets.useQuery();
        extraApi_pets_getPets.useQuery();
      }"
    `);
  });

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

  it('imports precreated client options from a project-root-relative module', async () => {
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
    const fixtureRoot = await fs.realpath(root);
    const sourceFile = path.join(fixtureRoot, 'src/App.tsx');
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(fixtureRoot);
    try {
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
              createAPIClientFnOptionsModule: './src/precreated/options/barrel',
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
    } finally {
      cwdSpy.mockRestore();
    }
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

  it('supports precreated client options re-exported through client.ts', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(
        `
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export { createAPIClientOptions };

export const APIClient = createAPIClient(createAPIClientOptions());
`
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
            createAPIClientFnOptionsModule: './client',
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
        "import { qraftAPIClient } from "@openapi-qraft/react";
        import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
        import { getPets } from "./api/services/PetsService";
        import { createAPIClientOptions } from "./client";
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
});

type FixtureOptions = {
  contextName?: string;
  contextModule?: string;
  importContext?: boolean;
  apiDirName?: string;
};

async function createFixture(options: FixtureOptions = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-'));
  const contextName = options.contextName ?? 'APIClientContext';
  const contextModule = options.contextModule ?? `./${contextName}`;
  const importContext = options.importContext ?? true;

  await writeFixtureFiles(root, {
    ...getContextFixtureFiles(
      contextName,
      contextModule,
      importContext,
      options.apiDirName
    ),
  });

  return root;
}

function getContextFixtureFiles(
  contextName: string,
  contextModule: string,
  importContext: boolean,
  apiDirName = 'api'
) {
  const apiRoot = `src/${apiDirName}`;

  return {
    [`${apiRoot}/index.ts`]: `${importContext ? `import { ${contextName} } from '${contextModule}';\n` : ''}${CONTEXT_API_INDEX_TS_BODY(contextName)}`,
    [`${apiRoot}/${contextName}.ts`]: `\nexport const ${contextName} = {};\n`,
    [`${apiRoot}/services/index.ts`]: SERVICES_INDEX_TS,
    [`${apiRoot}/services/PetsService.ts`]: PETS_SERVICE_TS,
    [`${apiRoot}/services/StoresService.ts`]: STORES_SERVICE_TS,
  } as const;
}

function CONTEXT_API_INDEX_TS_BODY(contextName: string) {
  return `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, ${contextName});
}
export function createExtraAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, ${contextName});
}
`;
}

const PRECREATED_BASE_FILES = {
  'src/api/index.ts': PRECREATED_API_INDEX_TS,
  'src/api/services/index.ts': SERVICES_INDEX_TS,
  'src/api/services/PetsService.ts': PETS_SERVICE_TS,
  'src/api/services/StoresService.ts': STORES_SERVICE_TS,
  'src/client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
} as const;

function createPrecreatedFixtureFiles(
  clientTs: string,
  extraFiles: Record<string, string> = {}
) {
  return {
    ...PRECREATED_BASE_FILES,
    'src/client.ts': clientTs,
    ...extraFiles,
  } as const;
}

async function writeFixtureFiles(root: string, files: Record<string, string>) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }
}
