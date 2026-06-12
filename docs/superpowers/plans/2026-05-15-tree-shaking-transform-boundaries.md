# Tree-Shaking Transform Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `@openapi-qraft/tree-shaking-plugin` tests and transform behavior with the approved `createAPIClientFn` / `apiClient` boundary contract.

**Architecture:** Keep the existing plan/mutate split. Tighten transform planning so generated services ownership decides whether a factory is eligible, and make runtime helper selection depend on client mode plus explicit tree-shaking context config instead of callback type alone.

**Tech Stack:** TypeScript, Babel AST, Vitest inline snapshots, Yarn workspace scripts.

---

## File Structure

- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
  - Extend `ClientBinding` metadata so the mutate phase can distinguish explicit context-enabled generated factories from no-context/options factories.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
  - Preserve the existing `services` import requirement.
  - Record whether a `createAPIClientFn` config explicitly supplies context.
  - Keep `services: none` factories unresolved, including explicit `services` and operation arguments.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
  - Select `qraftReactAPIClient` only for context-mode generated clients with explicit context config and hook callbacks.
  - Use `qraftAPIClient` for explicit-options generated clients and every `apiClient` pre-created client.
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
  - Update existing context tests to pass explicit `context` config where they expect `qraftReactAPIClient`.
  - Add red tests for explicit-options hook usage emitting `qraftAPIClient`.
  - Add `services: none` operation-argument skip coverage.
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
  - Add `services: none` pre-created client skip coverage.
  - Keep hook pre-created output pinned to `qraftAPIClient`.
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`
  - Pin one mixed-mode snapshot where context hook uses `qraftReactAPIClient`, explicit-options hook uses `qraftAPIClient`, and pre-created hook uses `qraftAPIClient`.
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`
  - Add `services: none` schema skip coverage for unresolved generated factories.

## Task 1: Pin `createAPIClientFn` Runtime Helper Boundaries

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`

- [x] **Step 1: Add a failing explicit-options hook test**

Add this test near the existing context/argument boundary tests:

```ts
  it('uses qraftAPIClient for hook callbacks on explicit runtime options clients without configured context', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const requestOptions = { requestFn: async () => new Response() };
const api = createAPIClient(requestOptions);

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      const requestOptions = {
        requestFn: async () => new Response()
      };
      const api_pets_getPets = qraftAPIClient(getPets, {
        useQuery
      }, requestOptions);
      export function App() {
        return api_pets_getPets.useQuery();
      }"
    `);
  });
```

- [x] **Step 2: Verify the explicit-options hook test fails**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts -t "explicit runtime options clients"
```

Expected: FAIL because current output imports or emits `qraftReactAPIClient` for `useQuery`.

- [x] **Step 3: Add an explicit context-config test or update an existing context test**

Update the existing `"imports an operation directly for a context API client"` options object to make the context contract explicit:

```ts
      {
        createAPIClientFn: [
          {
            name: 'createAPIClient',
            module: './api',
            context: 'APIClientContext',
          },
        ],
      }
```

Expected snapshot remains:

```ts
const api_pets_getPets = qraftReactAPIClient(getPets, {
  useQuery
}, APIClientContext);
```

- [x] **Step 4: Add a services-none operation argument skip test**

Add this test next to the existing explicit services argument skip test:

```ts
  it('skips generic generated factories that receive a single operation as an argument', async () => {
    const fixture = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(fixture, {
      'src/api/createAPIClient.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';
import { getQueryKey } from '@openapi-qraft/react/callbacks/index';

const defaultCallbacks = { getQueryKey } as const;

export function createAPIClient(operation, callbacks = defaultCallbacks) {
  return qraftAPIClient(operation, callbacks);
}
`,
      'src/api/services/PetsService.ts': PETS_SERVICE_TS,
    });
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api/createAPIClient';
import { getPets } from './api/services/PetsService';

const api = createAPIClient(getPets);

export function App() {
  return api.getQueryKey();
}
`,
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createAPIClient', module: './api/createAPIClient' },
        ],
      }
    );

    expect(result).toBeNull();
  });
```

- [x] **Step 5: Run focused createAPIClientFn tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts
```

Expected: explicit-options hook test still fails until Task 2; skip tests pass.

## Task 2: Implement Runtime Helper Selection Contract

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [x] **Step 1: Extend `ClientBinding` with explicit context metadata**

In `types.ts`, update the `ClientBinding` shape to include:

```ts
  hasExplicitContext: boolean;
```

The property belongs at the top level of `ClientBinding`, next to `factory`, because it applies to both `context` and `options` modes discovered from the same generated factory config.

- [x] **Step 2: Populate `hasExplicitContext` for local createAPIClientFn clients**

In `plan.ts`, when pushing a `ClientBinding` for a local generated factory client, set:

```ts
          hasExplicitContext: Boolean(createImport.factory.context),
```

Do this in both client creation branches:

```ts
if (args.length === 0) {
  const mode = { type: 'context' } as const;
  clients.push({
    name: variablePath.node.id.name,
    clientSourceKey: getClientSourceKey(
      createImportPath,
      createImport.factory,
      mode
    ),
    createImportPath,
    factory: createImport.factory,
    hasExplicitContext: Boolean(createImport.factory.context),
    bindingNode: variablePath.node.id,
    declarationScope: variablePath.parentPath.scope,
    localInitPath: variablePath,
    mode,
  });
  return;
}
```

```ts
if (args.length === 1 && isExpression(args[0])) {
  const mode = {
    type: 'options',
    optionsExpression: t.cloneNode(args[0], true),
  } as const;
  clients.push({
    name: variablePath.node.id.name,
    clientSourceKey: getClientSourceKey(
      createImportPath,
      createImport.factory,
      mode
    ),
    createImportPath,
    factory: createImport.factory,
    hasExplicitContext: Boolean(createImport.factory.context),
    bindingNode: variablePath.node.id,
    declarationScope: variablePath.parentPath.scope,
    localInitPath: variablePath,
    mode,
  });
}
```

- [x] **Step 3: Populate `hasExplicitContext` for pre-created clients**

In `findPrecreatedClients(...)`, set:

```ts
        hasExplicitContext: false,
```

when pushing the pre-created `ClientBinding`. Pre-created clients never select `qraftReactAPIClient`.

- [x] **Step 4: Change runtime helper selection in `mutate.ts`**

Replace the runtime helper selection for optimized client declarations with a mode-aware helper:

```ts
function selectOptimizedClientRuntimeHelper(
  usage: OperationUsage,
  callbacks: Array<{ callbackName: string }>
): RuntimeHelperKind {
  if (usage.client.mode.type !== 'context') return 'api';
  if (!usage.client.hasExplicitContext) return 'api';
  return selectRuntimeHelper(callbacks);
}
```

Then change `createOptimizedClientDeclaration(...)` from:

```ts
  const runtimeHelperKind = selectRuntimeHelper(callbacks);
```

to:

```ts
  const runtimeHelperKind = selectOptimizedClientRuntimeHelper(
    usage,
    callbacks
  );
```

Keep this existing line unchanged:

```ts
  const runtimeImportLocalName =
    usage.client.mode.type === 'precreated' || runtimeHelperKind === 'api'
      ? runtimeLocalNames.api
      : runtimeLocalNames.react;
```

- [x] **Step 5: Run the focused failing test**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts -t "explicit runtime options clients"
```

Expected: PASS.

- [x] **Step 6: Run createAPIClientFn tests and update snapshots intentionally**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts
```

Expected: Some existing context tests may fail because they relied on inferred context instead of explicit config. Update only tests that should be context-configured by adding `context: 'APIClientContext'` or the fixture-specific context name to their `createAPIClientFn` config. Do not update snapshots to `qraftReactAPIClient` for no-context explicit-options clients.

## Task 3: Pin `apiClient` Services Ownership Boundaries

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`

- [x] **Step 1: Add services-none pre-created client skip test**

Add this test near existing pre-created skip/safety tests:

```ts
  it('skips a precreated client whose generated factory does not import services', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(root, {
      'src/api/index.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(services, options) {
  return qraftAPIClient(services, defaultCallbacks, options);
}
`,
      'src/api/services/PetsService.ts': `
export const getPets = { schema: { method: 'get', url: '/pets' } };
`,
      'src/client-options.ts': `
export const createAPIClientOptions = () => ({ queryClient: {} });
`,
      'src/client.ts': `
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';
import { getPets } from './api/services/PetsService';

export const APIClient = createAPIClient({ pets: { getPets } }, createAPIClientOptions());
`,
    });
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
```

- [x] **Step 2: Run focused pre-created tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/precreated-api-client.test.ts -t "does not import services|precreated named API client"
```

Expected: PASS. The existing named pre-created hook test should continue emitting `qraftAPIClient`.

## Task 4: Pin Mixed-Mode Helper Isolation

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`

- [x] **Step 1: Add or update a mixed-mode test for helper selection**

Add a new test or extend the existing `"keeps callback-class rewrites separate across context and precreated modes"` test so the input includes all three calls:

```ts
const contextApi = createAPIClient();
const explicitOptions = { requestFn: async () => new Response() };
const explicitApi = createAPIClient(explicitOptions);

export function App() {
  contextApi.pets.getPets.useQuery();
  explicitApi.pets.findPetsByStatus.useQuery();
  APIClient.stores.getStores.useQuery();
}
```

Expected emitted shape:

```ts
const contextApi_pets_getPets = qraftReactAPIClient(getPets, {
  useQuery
}, ContextAPIClientContext);
const explicitApi_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
  useQuery
}, explicitOptions);
const APIClient_stores_getStores = qraftAPIClient(getStores, {
  useQuery
}, createAPIClientOptions());
```

The test config for the context factory must include explicit context:

```ts
createAPIClientFn: [
  {
    name: 'createAPIClient',
    module: './context-api',
    context: 'ContextAPIClientContext',
  },
],
```

- [x] **Step 2: Run focused mixed-mode tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/mixed-client-modes.test.ts
```

Expected: PASS after snapshot updates that match the approved helper selection contract.

## Task 5: Pin Schema Skip Boundary

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`

- [x] **Step 1: Add schema skip imports**

Ensure the file imports the fixture helpers it needs:

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PETS_SERVICE_TS, writeFixtureFiles } from './fixtures.js';
```

- [x] **Step 2: Add schema skip test**

Add:

```ts
  it('skips schema access for generic factories that do not import services', async () => {
    const fixture = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(fixture, {
      'src/api/createAPIClient.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';

export function createAPIClient(services) {
  return qraftAPIClient(services, {});
}
`,
      'src/api/services/PetsService.ts': PETS_SERVICE_TS,
    });
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api/createAPIClient';
import { getPets } from './api/services/PetsService';

const api = createAPIClient({ pets: { getPets } });
api.pets.getPets.schema;
`,
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createAPIClient', module: './api/createAPIClient' },
        ],
      }
    );

    expect(result).toBeNull();
  });
```

- [x] **Step 3: Run schema tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/schema-and-imports.test.ts
```

Expected: PASS.

## Task 6: Full Verification And Commit

**Files:**
- All modified files from previous tasks.

- [x] **Step 1: Run full package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
```

Expected: all tree-shaking-plugin tests pass.

- [x] **Step 2: Run typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: no TypeScript errors.

- [x] **Step 3: Run lint**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
```

Expected: no ESLint errors.

- [x] **Step 4: Run diff whitespace check**

Run:

```bash
git diff --check
```

Expected: no output.

- [x] **Step 5: Review final diff**

Run:

```bash
git diff -- packages/tree-shaking-plugin/src/lib/transform packages/tree-shaking-plugin/src/__tests__/core
```

Expected:

- tests pin services ownership and helper selection boundaries;
- `qraftReactAPIClient` appears only for explicit context-configured generated factory hook transforms;
- explicit-options generated factory hook transforms use `qraftAPIClient`;
- pre-created hook transforms use `qraftAPIClient`;
- `services: none` generated factories are skipped.

- [x] **Step 6: Commit implementation**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/plan.ts \
  packages/tree-shaking-plugin/src/lib/transform/mutate.ts \
  packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts
git commit -m "test: pin tree-shaking transform boundaries"
```

Expected: one implementation commit after the already committed design/spec.

## Self-Review

- Spec coverage: This plan covers `createAPIClientFn`, `apiClient`, mixed helper selection, schema boundary, and verification from the approved spec.
- Placeholder scan: No placeholder markers or unspecified implementation steps remain.
- Type consistency: `hasExplicitContext` is introduced in `ClientBinding`, populated in plan creation, and consumed by mutate runtime helper selection.
