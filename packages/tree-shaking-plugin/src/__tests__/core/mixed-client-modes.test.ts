import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
  getContextFixtureFiles,
  PETS_SERVICE_TS,
  PRECREATED_API_INDEX_TS,
  SERVICES_INDEX_TS,
  STORES_SERVICE_TS,
  writeFixtureFiles,
} from './fixtures.js';
import { transformQraftTreeShaking } from './harness.js';

describe('transformQraftTreeShaking mixed client modes', () => {
  it('keeps original clients independently for partial mixed-mode transforms', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles(
        'ContextAPIClientContext',
        './ContextAPIClientContext',
        true,
        'context-api'
      ),
      'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
      'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
      'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
      'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
      'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
      'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './context-api';
import { APIClient } from './precreated-client';
import { useEffect } from 'react';

const api = createAPIClient();

export function App() {
  api.pets.getPets.useQuery();
  console.log(api);

  useEffect(() => {
    APIClient.pets.getPets.invalidateQueries();
    console.log(APIClient);
  }, []);
}
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
      "import { createAPIClient } from './context-api';
      import { APIClient } from './precreated-client';
      import { useEffect } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./context-api/services/PetsService";
      import { ContextAPIClientContext } from "./context-api/ContextAPIClientContext";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { getPets as _getPets } from "./precreated-api/services/PetsService";
      import { createAPIClientOptions } from "./precreated-client-options";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, ContextAPIClientContext);
      const APIClient_pets_getPets = qraftAPIClient(_getPets, {
        invalidateQueries
      }, createAPIClientOptions());
      const api = createAPIClient();
      export function App() {
        api_pets_getPets.useQuery();
        console.log(api);
        useEffect(() => {
          APIClient_pets_getPets.invalidateQueries();
          console.log(APIClient);
        }, []);
      }"
    `);
  });

  it('supports context-based and explicit-options createAPIClientFn clients in one file', async () => {
    const fixture = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      fixture,
      getContextFixtureFiles(
        'APIClientContext',
        './APIClientContext',
        true,
        'api'
      )
    );
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext, useEffect } from 'react';

const api = createAPIClient();

export function App() {
  const apiContext = useContext(APIClientContext);

  api.pets.getPets.useQuery();
  useEffect(() => {
    void createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
  }, [apiContext]);
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext, useEffect } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      export function App() {
        const apiContext = useContext(APIClientContext);
        api_pets_getPets.useQuery();
        useEffect(() => {
          void qraftAPIClient(findPetsByStatus, {
            invalidateQueries
          }, apiContext!).invalidateQueries();
        }, [apiContext]);
      }"
    `);
  });

  it('keeps same-operation rewrites separate across all client modes', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles(
        'ContextAPIClientContext',
        './ContextAPIClientContext',
        true,
        'context-api'
      ),
      'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
      'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
      'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
      'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
      'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
      'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, ContextAPIClientContext } from './context-api';
import { APIClient } from './precreated-client';
import { useContext, useEffect } from 'react';

const contextApi = createAPIClient();

export function App() {
  const apiContext = useContext(ContextAPIClientContext);

  contextApi.pets.getPets.useQuery();
  useEffect(() => {
    void createAPIClient(apiContext!).pets.getPets.invalidateQueries();
  }, [apiContext]);
  APIClient.pets.getPets.getQueryKey();
}
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
      "import { ContextAPIClientContext } from './context-api';
      import { useContext, useEffect } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./context-api/services/PetsService";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPets as _getPets } from "./precreated-api/services/PetsService";
      import { createAPIClientOptions } from "./precreated-client-options";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      const contextApi_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, ContextAPIClientContext);
      const APIClient_pets_getPets = qraftAPIClient(_getPets, {
        getQueryKey
      }, createAPIClientOptions());
      export function App() {
        const apiContext = useContext(ContextAPIClientContext);
        contextApi_pets_getPets.useQuery();
        useEffect(() => {
          void qraftAPIClient(getPets, {
            invalidateQueries
          }, apiContext!).invalidateQueries();
        }, [apiContext]);
        APIClient_pets_getPets.getQueryKey();
      }"
    `);
  });

  it('supports top-level createAPIClientFn and precreated apiClient clients in one file', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles(
        'ContextAPIClientContext',
        './ContextAPIClientContext',
        true,
        'context-api'
      ),
      'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
      'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
      'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
      'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
      'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
      'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './context-api';
import { APIClient } from './precreated-client';

const api = createAPIClient();
const apiOptions = { requestFn: () => undefined };

api.pets.getPets.getQueryKey();
createAPIClient(apiOptions).pets.findPetsByStatus.invalidateQueries();
APIClient.stores.getStores.getQueryKey();
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
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPets } from "./context-api/services/PetsService";
      import { getStores } from "./precreated-api/services/StoresService";
      import { createAPIClientOptions } from "./precreated-client-options";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./context-api/services/PetsService";
      const api_pets_getPets = qraftAPIClient(getPets, {
        getQueryKey
      });
      const APIClient_stores_getStores = qraftAPIClient(getStores, {
        getQueryKey
      }, createAPIClientOptions());
      const apiOptions = {
        requestFn: () => undefined
      };
      api_pets_getPets.getQueryKey();
      qraftAPIClient(findPetsByStatus, {
        invalidateQueries
      }, apiOptions).invalidateQueries();
      APIClient_stores_getStores.getQueryKey();"
    `);
  });

  it('supports createAPIClientFn and precreated apiClient clients in one file', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles(
        'ContextAPIClientContext',
        './ContextAPIClientContext',
        true,
        'context-api'
      ),
      'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
      'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
      'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
      'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
      'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
      'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import {
  createAPIClient as createContextAPIClient,
  ContextAPIClientContext,
} from './context-api';
import { APIClient } from './precreated-client';
import { useContext, useEffect } from 'react';

const contextApi = createContextAPIClient();

export function App() {
  const apiContext = useContext(ContextAPIClientContext);

  contextApi.pets.getPets.useQuery();
  useEffect(() => {
    void createContextAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
  }, [apiContext]);
  APIClient.stores.getStores.useQuery();
}
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
      "import { ContextAPIClientContext } from './context-api';
      import { useContext, useEffect } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./context-api/services/PetsService";
      import { getStores } from "./precreated-api/services/StoresService";
      import { createAPIClientOptions } from "./precreated-client-options";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./context-api/services/PetsService";
      const contextApi_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, ContextAPIClientContext);
      const APIClient_stores_getStores = qraftAPIClient(getStores, {
        useQuery
      }, createAPIClientOptions());
      export function App() {
        const apiContext = useContext(ContextAPIClientContext);
        contextApi_pets_getPets.useQuery();
        useEffect(() => {
          void qraftAPIClient(findPetsByStatus, {
            invalidateQueries
          }, apiContext!).invalidateQueries();
        }, [apiContext]);
        APIClient_stores_getStores.useQuery();
      }"
    `);
  });

  it('keeps generated names collision-safe across mixed client modes', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles(
        'ContextAPIClientContext',
        './ContextAPIClientContext',
        true,
        'context-api'
      ),
      'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
      'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
      'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
      'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
      'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
      'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, ContextAPIClientContext } from './context-api';
import { APIClient } from './precreated-client';
import { useContext, useEffect } from 'react';

const api = createAPIClient();

// These bindings intentionally collide with generated names across modes.
const api_pets_getPets = () => null;
const APIClient_pets_getPets = () => null;

export function App() {
  const apiContext = useContext(ContextAPIClientContext);

  api.pets.getPets.getQueryKey();
  useEffect(() => {
    void createAPIClient(apiContext!).pets.getPets.invalidateQueries();
  }, [apiContext]);
  APIClient.pets.getPets.getQueryKey();
}
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
      "import { ContextAPIClientContext } from './context-api';
      import { useContext, useEffect } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPets } from "./context-api/services/PetsService";
      import { getPets as _getPets } from "./precreated-api/services/PetsService";
      import { createAPIClientOptions } from "./precreated-client-options";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      const _api_pets_getPets = qraftAPIClient(getPets, {
        getQueryKey
      });
      const _APIClient_pets_getPets = qraftAPIClient(_getPets, {
        getQueryKey
      }, createAPIClientOptions());
      // These bindings intentionally collide with generated names across modes.
      const api_pets_getPets = () => null;
      const APIClient_pets_getPets = () => null;
      export function App() {
        const apiContext = useContext(ContextAPIClientContext);
        _api_pets_getPets.getQueryKey();
        useEffect(() => {
          void qraftAPIClient(getPets, {
            invalidateQueries
          }, apiContext!).invalidateQueries();
        }, [apiContext]);
        _APIClient_pets_getPets.getQueryKey();
      }"
    `);
  });

  it('keeps callback-class rewrites separate across context and precreated modes', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles(
        'ContextAPIClientContext',
        './ContextAPIClientContext',
        true,
        'context-api'
      ),
      'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
      'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
      'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
      'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
      'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
      'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, ContextAPIClientContext } from './context-api';
import { APIClient } from './precreated-client';
import { useContext, useEffect } from 'react';

const reactApi = createAPIClient();

export function App() {
  const apiContext = useContext(ContextAPIClientContext);
  reactApi.pets.getPets.useSuspenseQuery();
  useEffect(() => {
    void createAPIClient(apiContext!).pets.findPetsByStatus.fetchQuery();
  }, [apiContext]);
  APIClient.pets.getPets.getInfiniteQueryKey();
}
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
      "import { ContextAPIClientContext } from './context-api';
      import { useContext, useEffect } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useSuspenseQuery } from "@openapi-qraft/react/callbacks/useSuspenseQuery";
      import { getPets } from "./context-api/services/PetsService";
      import { getInfiniteQueryKey } from "@openapi-qraft/react/callbacks/getInfiniteQueryKey";
      import { getPets as _getPets } from "./precreated-api/services/PetsService";
      import { createAPIClientOptions } from "./precreated-client-options";
      import { fetchQuery } from "@openapi-qraft/react/callbacks/fetchQuery";
      import { findPetsByStatus } from "./context-api/services/PetsService";
      const reactApi_pets_getPets = qraftReactAPIClient(getPets, {
        useSuspenseQuery
      }, ContextAPIClientContext);
      const APIClient_pets_getPets = qraftAPIClient(_getPets, {
        getInfiniteQueryKey
      }, createAPIClientOptions());
      export function App() {
        const apiContext = useContext(ContextAPIClientContext);
        reactApi_pets_getPets.useSuspenseQuery();
        useEffect(() => {
          void qraftAPIClient(findPetsByStatus, {
            fetchQuery
          }, apiContext!).fetchQuery();
        }, [apiContext]);
        APIClient_pets_getPets.getInfiniteQueryKey();
      }"
    `);
  });
});
