import type { SourceMapInput } from '@jridgewell/trace-mapping';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { describe, expect, it, vi } from 'vitest';
import {
  createFixtureModuleAccess,
  createPrecreatedFixtureFiles,
  DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
  getContextFixtureFiles,
  PETS_SERVICE_TS,
  PRECREATED_API_INDEX_TS,
  SERVICES_INDEX_TS,
  STORES_SERVICE_TS,
  writeFixtureFiles,
} from './__tests__/core/fixtures.js';
import {
  createFixture,
  createTransformPlan,
  transformQraftTreeShaking,
} from './__tests__/core/harness.js';
import { transformQraftTreeShaking as transformQraftTreeShakingImpl } from './core.js';

describe('transformQraftTreeShaking', () => {
  it('uses module access from options by default when creating a transform plan', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(fixtureModuleAccess.load);

    const plan = await createTransformPlan(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      {
        createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load,
        },
      }
    );

    expect(plan.clients).toHaveLength(1);
    expect(plan.namedUsages).toHaveLength(1);
    expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
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

const api = createAPIClient();

api.pets.getPets.useQuery();
console.log(api);

APIClient.pets.getPets.useQuery();
console.log(APIClient);
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
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./context-api/services/PetsService";
      import { ContextAPIClientContext } from "./context-api/ContextAPIClientContext";
      import { getPets as _getPets } from "./precreated-api/services/PetsService";
      import { createAPIClientOptions } from "./precreated-client-options";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, ContextAPIClientContext);
      const APIClient_pets_getPets = qraftAPIClient(_getPets, {
        useQuery
      }, createAPIClientOptions());
      const api = createAPIClient();
      api_pets_getPets.useQuery();
      console.log(api);
      APIClient_pets_getPets.useQuery();
      console.log(APIClient);"
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
          createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
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
        createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
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
        createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
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

  it('supports context-based and explicit-options createAPIClientFn clients in one file', async () => {
    const fixture = await createFixture();
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

const api = createAPIClient();
const apiContext = ContextAPIClientContext;

// These bindings intentionally collide with generated names across modes.
const api_pets_getPets = () => null;
const APIClient_pets_getPets = () => null;

api.pets.getPets.getQueryKey();
createAPIClient(apiContext!).pets.getPets.invalidateQueries();
APIClient.pets.getPets.getQueryKey();
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
      const apiContext = ContextAPIClientContext;

      // These bindings intentionally collide with generated names across modes.
      const api_pets_getPets = () => null;
      const APIClient_pets_getPets = () => null;
      _api_pets_getPets.getQueryKey();
      qraftAPIClient(getPets, {
        invalidateQueries
      }, apiContext!).invalidateQueries();
      _APIClient_pets_getPets.getQueryKey();"
    `);
  });
});

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
