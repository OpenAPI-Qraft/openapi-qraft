import '@qraft/test-utils/vitestFsMock';
import type { SourceMapInput } from '@jridgewell/trace-mapping';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { describe, expect, it } from 'vitest';
import { transformQraftTreeShaking as transformQraftTreeShakingImpl } from './core.js';
import { createTransformPlan } from './lib/transform/plan.js';

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

type TransformOptions = Parameters<typeof transformQraftTreeShakingImpl>[2];
type TransformWithInputSourceMap = (
  code: string,
  id: string,
  options: TransformOptions,
  resolver: Parameters<typeof transformQraftTreeShakingImpl>[3],
  inputSourceMap?: SourceMapInput
) => ReturnType<typeof transformQraftTreeShakingImpl>;

const transformQraftTreeShakingImplWithInputSourceMap =
  transformQraftTreeShakingImpl satisfies (
    code: string,
    id: string,
    options: TransformOptions,
    resolver: Parameters<typeof transformQraftTreeShakingImpl>[3]
  ) => ReturnType<typeof transformQraftTreeShakingImpl>;

const transformQraftTreeShakingWithInputSourceMap =
  transformQraftTreeShakingImplWithInputSourceMap as unknown as TransformWithInputSourceMap;

async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: TransformOptions,
  inputSourceMap?: SourceMapInput
) {
  const fixtureRoot = path.dirname(path.dirname(id));
  const fixtureResolver = createFixtureResolver(fixtureRoot);
  const resolver = async (specifier: string, importer: string) => {
    if (options.resolve) {
      try {
        const resolved = await options.resolve(specifier, importer);
        if (resolved) return resolved;
      } catch {
        // Fall through to the fixture resolver.
      }
    }

    return fixtureResolver(specifier, importer);
  };

  return transformQraftTreeShakingWithInputSourceMap(
    code,
    id,
    options,
    resolver,
    inputSourceMap
  );
}

describe('transformQraftTreeShaking', () => {
  it('collects named and inline usages in one transform plan', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureResolver = createFixtureResolver(fixture);

    const plan = await createTransformPlan(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  api.pets.getPets.useQuery();
  createAPIClient({ queryClient: {} }).pets.findPetsByStatus.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] },
      fixtureResolver
    );

    expect(plan.namedUsages).toHaveLength(1);
    expect(plan.inlineUsages).toHaveLength(1);
  });

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

  it('keeps a rewritten user call site traceable through an incoming source map', async () => {
    const fixture = await createFixture();
    const generatedSourceFile = path.join(fixture, 'src/App.generated.tsx');
    const originalSourceFile = path.join(fixture, 'src/App.tsx');
    const code = [
      "import { createAPIClient } from './api';",
      '',
      'const api = createAPIClient();',
      '',
      'export function App() {',
      '  return api.pets.getPets.useQuery();',
      '}',
    ].join('\n');
    const inputSourceMap = createIdentitySourceMap(
      generatedSourceFile,
      originalSourceFile,
      code
    );

    const result = await transformQraftTreeShaking(
      code,
      generatedSourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] },
      inputSourceMap
    );

    if (!result) {
      throw new Error('Expected transform result');
    }

    const generatedLineIndex = result.code
      .split('\n')
      .findIndex((line) => line.includes('api_pets_getPets.useQuery()'));

    if (generatedLineIndex === -1) {
      throw new Error('Expected rewritten user call site in generated output');
    }

    const generatedLine = generatedLineIndex + 1;
    const generatedColumn = result.code
      .split('\n')
      [generatedLineIndex].indexOf('api_pets_getPets');

    const traceMapInput = result.map! as SourceMapInput;

    const position = originalPositionFor(new TraceMap(traceMapInput), {
      line: generatedLine,
      column: generatedColumn,
    });

    expect(position).toMatchObject({
      source: originalSourceFile,
      line: 6,
    });
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

const api = createAPIClient({});

api.pets.getPets.getQueryKey({});
api.pets.getPets();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPets } from "./api/services/PetsService";
      import { operationInvokeFn } from "@openapi-qraft/react/callbacks/operationInvokeFn";
      const api_pets_getPets = qraftAPIClient(getPets, {
        getQueryKey,
        operationInvokeFn
      }, {});
      api_pets_getPets.getQueryKey({});
      api_pets_getPets();"
    `);
  });

  it('rewrites context-free callbacks from zero-arg createAPIClient calls', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

function App() {
  void createAPIClient().pets.findPetsByStatus.getQueryKey();
  const utilityClient = createAPIClient();
  void utilityClient.pets.findPetsByStatus.getQueryKey();
  api.pets.findPetsByStatus.getQueryKey();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { findPetsByStatus } from "./api/services/PetsService";
      const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
        getQueryKey
      });
      function App() {
        void qraftAPIClient(findPetsByStatus, {
          getQueryKey
        }).getQueryKey();
        const utilityClient_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
          getQueryKey
        });
        void utilityClient_pets_findPetsByStatus.getQueryKey();
        api_pets_findPetsByStatus.getQueryKey();
      }"
      `);
  });

  it('does not transform zero-arg calls to a no-context factory', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...PRECREATED_BASE_FILES,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.getQueryKey();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    // Zero-arg calls to no-context (qraftAPIClient) factories are not transformed —
    // only options-based calls are optimized.
    expect(result).toBeNull();
  });

  it('transforms options calls to a no-context factory while keeping zero-arg calls untouched', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...PRECREATED_BASE_FILES,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const apiUtility = createAPIClient();
const apiWithClient = createAPIClient({ queryClient: {} });

apiUtility.pets.getPets.getQueryKey();
apiWithClient.pets.getPets.invalidateQueries();
apiWithClient.pets.getPets.setQueryData(undefined, () => undefined);
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { createAPIClient } from './api';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { getPets } from "./api/services/PetsService";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      const apiUtility = createAPIClient();
      const apiWithClient_pets_getPets = qraftAPIClient(getPets, {
        invalidateQueries,
        setQueryData
      }, {
        queryClient: {}
      });
      apiUtility.pets.getPets.getQueryKey();
      apiWithClient_pets_getPets.invalidateQueries();
      apiWithClient_pets_getPets.setQueryData(undefined, () => undefined);"
    `);
  });

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

  it('keeps APIClientContext when context-free and contextful callbacks share one client', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  api.pets.findPetsByStatus.getQueryKey();
  api.pets.getPets.useQuery();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { findPetsByStatus } from "./api/services/PetsService";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
        getQueryKey
      });
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      export function App() {
        api_pets_findPetsByStatus.getQueryKey();
        api_pets_getPets.useQuery();
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
import { createAPIClient } from './api';

const api = createAPIClient();

function PetUpdateItem({ petId }: { petId: number }) {
  return api.pets.updatePet.useIsMutating(api.pets.updatePet.getMutationKey());
}

function PetUpdateForm({ petId }: { petId: number }) {
  api.pets.updatePet.useMutation(undefined, {
    mutationKey: api.pets.updatePet.getMutationKey(),
  });
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useIsMutating } from "@openapi-qraft/react/callbacks/useIsMutating";
      import { updatePet } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      import { getMutationKey } from "@openapi-qraft/react/callbacks/getMutationKey";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      const api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useIsMutating,
        getMutationKey
      }, APIClientContext);
      const _api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useMutation,
        getMutationKey
      }, APIClientContext);
      function PetUpdateItem({
        petId
      }: {
        petId: number;
      }) {
        return api_pets_updatePet.useIsMutating(api_pets_updatePet.getMutationKey());
      }
      function PetUpdateForm({
        petId
      }: {
        petId: number;
      }) {
        _api_pets_updatePet.useMutation(undefined, {
          mutationKey: _api_pets_updatePet.getMutationKey()
        });
      }"
    `);
  });

  it('splits explicit options clients across sibling callback scopes', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

function PetUpdateItem({ petId }: { petId: number }) {
  return api.pets.updatePet.useIsMutating(api.pets.updatePet.getMutationKey());
}

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api.pets.updatePet.useMutation(undefined, {
    mutationKey: api.pets.updatePet.getMutationKey(),
    async onMutate(variables) {
      const getQueryData = () => api.pets.updatePet.getMutationKey();
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
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useIsMutating } from "@openapi-qraft/react/callbacks/useIsMutating";
      import { updatePet } from "./api/services/PetsService";
      import { getMutationKey } from "@openapi-qraft/react/callbacks/getMutationKey";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getPetById } from "./api/services/PetsService";
      import { getQueryData as _getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      const api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useIsMutating,
        getMutationKey
      }, APIClientContext);
      const _api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useMutation,
        getMutationKey
      }, APIClientContext);
      function PetUpdateItem({
        petId
      }: {
        petId: number;
      }) {
        return api_pets_updatePet.useIsMutating(api_pets_updatePet.getMutationKey());
      }
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
        _api_pets_updatePet.useMutation(undefined, {
          mutationKey: _api_pets_updatePet.getMutationKey(),
          async onMutate(variables) {
            const getQueryData = () => _api_pets_updatePet.getMutationKey();
            const apiClient_pets_getPetById = () => null;
            const _apiClient_pets_getPetById = qraftAPIClient(getPetById, {
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
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { getPetById } from "./api/services/PetsService";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      function PetUpdateForm() {
        const apiContext = useContext(APIClientContext);
        qraftAPIClient(getPetById, {
          setQueryData
        }, apiContext!).setQueryData({
          path: {
            petId: 1
          }
        }, {
          id: 1
        });
        qraftAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
      }"
      `);
  });

  it('optimizes mutation callbacks across onMutate, onError, and onSuccess', async () => {
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

  const onUpdate = () => {};

  api.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const miniQraft = createAPIClient(apiContext!);
      miniQraft.pets.getPetById.getQueryKey();
      await miniQraft.pets.getPetById.cancelQueries({
        parameters: petParams,
      });

      const prevPet = miniQraft.pets.getPetById.getQueryData(petParams);

      miniQraft.pets.getPetById.setQueryData(petParams, (oldData) => ({
        ...oldData,
        ...variables.body,
      }));

      return { prevPet };
    },
    async onError(_error, _variables, context) {
      if (context?.prevPet) {
        createAPIClient(apiContext!).pets.getPetById.setQueryData(
          petParams,
          context.prevPet
        );
      }
    },
    async onSuccess(updatedPet) {
      const miniQraft = createAPIClient(apiContext!);
      miniQraft.pets.getPetById.setQueryData(petParams, updatedPet);
      miniQraft.pets.findPetsByStatus.getQueryKey();
      await miniQraft.pets.findPetsByStatus.invalidateQueries();
      onUpdate();
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
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { updatePet } from "./api/services/PetsService";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPetById } from "./api/services/PetsService";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { findPetsByStatus } from "./api/services/PetsService";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
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
        const onUpdate = () => {};
        api_pets_updatePet.useMutation(undefined, {
          async onMutate(variables) {
            const miniQraft_pets_getPetById = qraftAPIClient(getPetById, {
              getQueryKey,
              cancelQueries,
              getQueryData,
              setQueryData
            }, apiContext!);
            miniQraft_pets_getPetById.getQueryKey();
            await miniQraft_pets_getPetById.cancelQueries({
              parameters: petParams
            });
            const prevPet = miniQraft_pets_getPetById.getQueryData(petParams);
            miniQraft_pets_getPetById.setQueryData(petParams, oldData => ({
              ...oldData,
              ...variables.body
            }));
            return {
              prevPet
            };
          },
          async onError(_error, _variables, context) {
            if (context?.prevPet) {
              qraftAPIClient(getPetById, {
                setQueryData
              }, apiContext!).setQueryData(petParams, context.prevPet);
            }
          },
          async onSuccess(updatedPet) {
            const miniQraft_pets_getPetById = qraftAPIClient(getPetById, {
              setQueryData
            }, apiContext!);
            const miniQraft_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
              getQueryKey,
              invalidateQueries
            }, apiContext!);
            miniQraft_pets_getPetById.setQueryData(petParams, updatedPet);
            miniQraft_pets_findPetsByStatus.getQueryKey();
            await miniQraft_pets_findPetsByStatus.invalidateQueries();
            onUpdate();
          }
        });
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

      function syncPetPreview() {
        // This binding intentionally collides with the optimized client name from the outer scope.
        const _apiClient_pets_getPetById2 = () => null;
        const apiClient = createAPIClient(apiContext!);

        apiClient.pets.getPetById.setQueryData(petParams, variables.body);
      }

      await apiClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient.pets.getPetById.getQueryData(petParams);

      apiClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      syncPetPreview();

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
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { updatePet } from "./api/services/PetsService";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { getPetById } from "./api/services/PetsService";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getQueryData as _getQueryData2 } from "@openapi-qraft/react/callbacks/getQueryData";
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
            const _apiClient_pets_getPetById4 = qraftAPIClient(getPetById, {
              cancelQueries,
              getQueryData: _getQueryData2,
              setQueryData
            }, apiContext!);
            function syncPetPreview() {
              // This binding intentionally collides with the optimized client name from the outer scope.
              const _apiClient_pets_getPetById2 = () => null;
              const _apiClient_pets_getPetById3 = qraftAPIClient(getPetById, {
                setQueryData
              }, apiContext!);
              _apiClient_pets_getPetById3.setQueryData(petParams, variables.body);
            }
            await _apiClient_pets_getPetById4.cancelQueries({
              parameters: petParams
            });
            const prevPet = _apiClient_pets_getPetById4.getQueryData(petParams);
            _apiClient_pets_getPetById4.setQueryData(petParams, old => ({
              ...old,
              ...variables.body
            }));
            syncPetPreview();
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
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
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      async function run() {
        const apiContext = useContext(APIClientContext);
        void qraftAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
        await qraftAPIClient(findPetsByStatus, {
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
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { getPets } from "./api/services/PetsService";
      const api_pets_getPets = qraftAPIClient(getPets, {
        invalidateQueries
      }, APIClientContext);
      async function run() {
        const apiContext = useContext(APIClientContext);
        api_pets_getPets.invalidateQueries();
        qraftAPIClient(getPets, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
      }"
    `);
  });

  it('optimizes clients with a single object literal even without known option keys', async () => {
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

    expect(result?.code).toMatchInlineSnapshot(`
      "import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery as _useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery: _useQuery
      }, {
        useQuery
      });
      api_pets_getPets.useQuery();"
    `);
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
        createAPIClientFn: [
          { name: 'createAPIClient', module: './generated-api' },
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
    const fixtureRoot = root;
    const sourceFile = path.join(fixtureRoot, 'src/App.tsx');
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

function createFixtureResolver(fixtureRoot: string) {
  return async (specifier: string, importer: string) => {
    if (specifier.startsWith('@/')) {
      return resolveFixtureModule(
        path.join(fixtureRoot, 'src'),
        specifier.slice(2)
      );
    }

    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      return resolveFixtureModule(path.dirname(importer), specifier);
    }

    return null;
  };
}

function createIdentitySourceMap(
  generatedSourceFile: string,
  originalSourceFile: string,
  source: string
): SourceMapInput {
  const lineCount = source.split('\n').length;
  const mappings = Array.from({ length: lineCount }, (_, index) =>
    index === 0 ? 'AAAA' : 'AACA'
  ).join(';');

  return {
    version: 3,
    file: generatedSourceFile,
    names: [],
    sources: [originalSourceFile],
    sourcesContent: [source],
    mappings,
  };
}

async function resolveFixtureModule(baseDir: string, importPath: string) {
  const base = path.resolve(baseDir, importPath);
  const candidateBases = new Set([base]);
  const extension = path.extname(importPath);
  if (
    extension === '.js' ||
    extension === '.jsx' ||
    extension === '.mjs' ||
    extension === '.cjs'
  ) {
    candidateBases.add(base.slice(0, -extension.length));
  }

  const candidates = [...candidateBases].flatMap((candidateBase) => [
    candidateBase,
    `${candidateBase}.ts`,
    `${candidateBase}.tsx`,
    `${candidateBase}.js`,
    `${candidateBase}.jsx`,
    `${candidateBase}.mts`,
    `${candidateBase}.cts`,
    path.join(candidateBase, 'index.ts'),
    path.join(candidateBase, 'index.tsx'),
    path.join(candidateBase, 'index.js'),
    path.join(candidateBase, 'index.jsx'),
    path.join(candidateBase, 'index.mts'),
    path.join(candidateBase, 'index.cts'),
  ]);

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
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
