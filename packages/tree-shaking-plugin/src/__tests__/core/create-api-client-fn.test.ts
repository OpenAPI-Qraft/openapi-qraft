import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createFixtureModuleAccess,
  getContextFixtureFiles,
  PRECREATED_BASE_FILES,
  writeFixtureFiles,
} from './fixtures.js';
import {
  createFixture,
  createTransformPlan,
  transformQraftTreeShaking,
} from './harness.js';

describe('transformQraftTreeShaking createAPIClientFn clients', () => {
  it('collects named and inline usages in one transform plan', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);

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
      fixtureModuleAccess
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

  it('infers an aliased generated context from the qraftReactAPIClient third argument', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    await writeFixtureFiles(fixture, {
      ...getContextFixtureFiles('APIClientContext', './APIClientContext', true),
      'src/api/index.ts': `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { APIClientContext as InternalContext } from './APIClientContext';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, InternalContext);
}
`,
    });

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
      import { InternalContext } from "./api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, InternalContext);
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

  it('transforms factory imported via a barrel when the module config points to the direct file', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...PRECREATED_BASE_FILES,
      'src/api-barrel.ts': `export { createAPIClient } from './api';`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api-barrel';

const api = createAPIClient({ queryClient: {} });
api.pets.getPets.invalidateQueries();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { getPets } from "./api/services/PetsService";
      const api_pets_getPets = qraftAPIClient(getPets, {
        invalidateQueries
      }, {
        queryClient: {}
      });
      api_pets_getPets.invalidateQueries();"
    `);
  });

  it('transforms zero-arg and options calls to a no-context factory', async () => {
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPets } from "./api/services/PetsService";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      const apiUtility_pets_getPets = qraftAPIClient(getPets, {
        getQueryKey
      });
      const apiWithClient_pets_getPets = qraftAPIClient(getPets, {
        invalidateQueries,
        setQueryData
      }, {
        queryClient: {}
      });
      apiUtility_pets_getPets.getQueryKey();
      apiWithClient_pets_getPets.invalidateQueries();
      apiWithClient_pets_getPets.setQueryData(undefined, () => undefined);"
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

  it('creates separate optimized clients for multiple operations across services', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
api.pets.createPet.useMutation();
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
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { createPet } from "./api/services/PetsService";
      import { getStores } from "./api/services/StoresService";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      const api_pets_createPet = qraftReactAPIClient(createPet, {
        useMutation
      }, APIClientContext);
      const api_stores_getStores = qraftReactAPIClient(getStores, {
        useQuery
      }, APIClientContext);
      api_pets_getPets.useQuery();
      api_pets_createPet.useMutation();
      api_stores_getStores.useQuery();"
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

  it('rewrites representative suspense and infinite hook callbacks for context clients', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const reactApi = createAPIClient();

export function App() {
  reactApi.pets.getPets.useSuspenseQuery();
  reactApi.pets.findPetsByStatus.useInfiniteQuery();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useSuspenseQuery } from "@openapi-qraft/react/callbacks/useSuspenseQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      import { useInfiniteQuery } from "@openapi-qraft/react/callbacks/useInfiniteQuery";
      import { findPetsByStatus } from "./api/services/PetsService";
      const reactApi_pets_getPets = qraftReactAPIClient(getPets, {
        useSuspenseQuery
      }, APIClientContext);
      const reactApi_pets_findPetsByStatus = qraftReactAPIClient(findPetsByStatus, {
        useInfiniteQuery
      }, APIClientContext);
      export function App() {
        reactApi_pets_getPets.useSuspenseQuery();
        reactApi_pets_findPetsByStatus.useInfiniteQuery();
      }"
    `);
  });
});
