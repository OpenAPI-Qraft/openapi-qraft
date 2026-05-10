# Tree-Shaking Core Test Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce duplicated `core.test.ts` transform snapshots while adding the missing mixed-client-mode regressions.

**Architecture:** Keep the cleanup test-only and keep `packages/tree-shaking-plugin/src/core.test.ts` as the only edited test file. First add the missing mixed-mode coverage so deduplication does not remove important cross-mode guarantees. Then merge or shrink overlapping tests by behavioral intent while preserving separate contracts for `createAPIClientFn` context clients, `createAPIClientFn` explicit-options clients, and precreated `apiClient` clients.

**Tech Stack:** Vitest, inline snapshots, existing fixture helpers in `core.test.ts`, Babel transform snapshots, TypeScript.

---

## File Structure

- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
  - Add mixed-mode regression tests before removing duplicates.
  - Merge overlapping transform snapshot tests.
  - Keep source-map, resolver/moduleAccess, naming collision, and false-positive tests separate.
- Do not modify production transform files.
- Do not modify e2e fixtures.
- Do not split `core.test.ts` in this plan. Reordering/grouping inside the file is allowed only when it keeps the diff readable.

## Failure Policy

This plan is a test-suite refactor only. If a newly added or changed test fails because of an inline snapshot mismatch, update or inspect the snapshot as the task says. If a newly added or changed test fails for any other reason, do not fix production code in this plan. Mark that specific test with `it.skip(...)`, leave a short English comment above it explaining the uncovered behavior, and continue the deduplication work. Production fixes for those skipped regressions belong in a later implementation plan.

## Coverage Map

Keep these contracts distinct:

- `createAPIClientFn` context-based:
  - zero-arg client can become `qraftReactAPIClient(..., APIClientContext)` for contextful hooks.
  - context-free callbacks and schema access can become operation-level imports without runtime context.
- `createAPIClientFn` explicit-options:
  - named local clients and inline `createAPIClient(apiContext!)` calls are first-class transform targets.
  - explicit-options clients may appear inside React effects, mutation callbacks, and nested scopes.
  - top-level/non-React call sites are still a separate transform contract and must stay covered.
- `apiClient` precreated:
  - imported precreated clients are resolved through configured client/factory/options metadata.
  - precreated clients stay separate from context-generated factories.
- Infrastructure:
  - source maps, resolver/moduleAccess behavior, collision-safe naming, partial transforms, and negative controls are not ordinary duplicate snapshots.

### Task 1: Add Mixed `createAPIClientFn` Variant Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Add the failing test after `supports two factory functions that share the same generated services`**

Insert this test immediately after the existing `supports two factory functions that share the same generated services` test:

```ts
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 2: Run the focused test and update the inline snapshot**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "supports context-based and explicit-options createAPIClientFn clients in one file" -u
```

Expected: PASS and Vitest writes the inline snapshot.

- [ ] **Step 3: Inspect the generated snapshot**

Confirm the snapshot includes all of these signals:

```ts
import { APIClientContext } from './api';
import { qraftReactAPIClient } from "@openapi-qraft/react";
import { qraftAPIClient } from "@openapi-qraft/react";
const api_pets_getPets = qraftReactAPIClient(getPets, {
  useQuery
}, APIClientContext);
useEffect(() => {
  void qraftAPIClient(findPetsByStatus, {
    invalidateQueries
  }, apiContext!).invalidateQueries();
}, [apiContext]);
```

If either helper path is missing, stop and investigate before continuing.

- [ ] **Step 4: Run the full core test file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): cover mixed createAPIClientFn variants"
```

### Task 2: Add All-Modes Mixed Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Add the failing test before `imports an operation directly for a precreated named API client`**

Insert this test immediately before `imports an operation directly for a precreated named API client`:

```ts
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 2: Run the focused test and update the inline snapshot**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "supports createAPIClientFn and precreated apiClient clients in one file" -u
```

Expected: PASS and Vitest writes the inline snapshot.

- [ ] **Step 3: Inspect the generated snapshot**

Confirm the snapshot includes all of these signals:

```ts
import { ContextAPIClientContext } from './context-api';
import { qraftAPIClient } from "@openapi-qraft/react";
import { qraftReactAPIClient } from "@openapi-qraft/react";
import { getPets } from "./context-api/services/PetsService";
import { findPetsByStatus } from "./context-api/services/PetsService";
import { getStores } from "./precreated-api/services/StoresService";
import { createAPIClientOptions } from "./precreated-client-options";
const contextApi_pets_getPets = qraftReactAPIClient(getPets, {
  useQuery
}, ContextAPIClientContext);
useEffect(() => {
  void qraftAPIClient(findPetsByStatus, {
    invalidateQueries
  }, apiContext!).invalidateQueries();
}, [apiContext]);
const APIClient_stores_getStores = qraftAPIClient(getStores, {
  useQuery
}, createAPIClientOptions());
```

If precreated operations come from `./context-api` or context operations come from `./precreated-api`, stop and investigate before continuing.

- [ ] **Step 4: Run the full core test file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): cover mixed createAPIClientFn and apiClient modes"
```

### Task 3: Add Additional Mixed-Mode Edge Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Add a same-operation-through-three-modes test**

Insert this test near the mixed-mode tests from Tasks 1 and 2:

```ts
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
    void createContextAPIClient(apiContext!).pets.getPets.invalidateQueries();
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 2: Add a top-level mixed modes test**

Insert this test near the mixed-mode tests:

```ts
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
import { createAPIClient, ContextAPIClientContext } from './context-api';
import { APIClient } from './precreated-client';

const api = createAPIClient();
const apiContext = ContextAPIClientContext;

api.pets.getPets.getQueryKey();
createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 3: Add a partial-transform mixed modes test**

Insert this test near the existing partial-transform tests:

```ts
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 4: Add a collision-across-modes test**

Insert this test near the existing collision tests:

```ts
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 5: Run the new additional mixed-mode tests and update snapshots**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "keeps same-operation rewrites separate across all client modes|supports top-level createAPIClientFn and precreated apiClient clients in one file|keeps original clients independently for partial mixed-mode transforms|keeps generated names collision-safe across mixed client modes" -u
```

Expected: PASS and Vitest writes inline snapshots.

If any test fails for a reason other than inline snapshot mismatch, apply the Failure Policy: mark only that test as `it.skip(...)`, keep a short English comment above it, and do not change production code.

- [ ] **Step 6: Inspect the generated snapshots**

Confirm the snapshots show these behaviors:

- Same operation names are imported from the correct generated root for each mode.
- Top-level/non-React mixed usage rewrites without relying on React hooks.
- Partial mixed transforms preserve the original `api` and `APIClient` imports/bindings independently.
- Collision handling aliases generated names instead of removing user bindings.

- [ ] **Step 7: Run and commit**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): cover mixed client mode edge cases"
```

Expected: Vitest PASS and commit succeeds. If skipped tests were required by the Failure Policy, include them in the commit and mention the skipped behaviors in the commit body.

### Task 4: Merge Multi-Operation Context Snapshots

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Replace the two multi-operation tests with one combined test**

Replace these existing tests:

- `creates separate optimized clients for multiple operations from the same service`
- `creates separate optimized clients for operations from different services`

with this combined test:

```ts
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 2: Run the focused test and update the inline snapshot**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "creates separate optimized clients for multiple operations across services" -u
```

Expected: PASS and Vitest writes one snapshot containing `api_pets_getPets`, `api_pets_createPet`, and `api_stores_getStores`.

- [ ] **Step 3: Verify removed test names are gone**

Run:

```bash
rg -n "creates separate optimized clients for multiple operations from the same service|creates separate optimized clients for operations from different services" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: no output.

- [ ] **Step 4: Run the full core test file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): merge multi-operation client snapshots"
```

### Task 5: Merge Prefix Preservation Snapshots

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Replace named and inline prefix tests with one combined test**

Replace these existing tests:

- `preserves void and await prefixes for named client calls`
- `preserves void and await prefixes for inline client calls`

with this combined top-level/non-React transform test:

```ts
  it('preserves void and await prefixes for named and inline client calls', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';

const api = createAPIClient();
const apiContext = APIClientContext;

async function run() {
  void api.pets.findPetsByStatus.invalidateQueries();
  await api.pets.findPetsByStatus.invalidateQueries();
  void createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
  await createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 2: Run the focused test and update the inline snapshot**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "preserves void and await prefixes for named and inline client calls" -u
```

Expected: PASS and Vitest writes one snapshot containing both named optimized calls and inline `qraftAPIClient(...).invalidateQueries()` calls with `void` and `await` in a top-level/non-React scenario.

- [ ] **Step 3: Verify removed test names are gone**

Run:

```bash
rg -n "preserves void and await prefixes for named client calls|preserves void and await prefixes for inline client calls" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: no output.

- [ ] **Step 4: Run the full core test file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): merge prefix preservation snapshots"
```

### Task 6: Consolidate Zero-Arg No-Context Callback Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Keep the context-based zero-arg test as the canonical local-scope regression**

Find `rewrites context-free callbacks from zero-arg createAPIClient calls`. Keep this test because it proves:

```ts
void createAPIClient().pets.findPetsByStatus.getQueryKey();
const utilityClient = createAPIClient();
void utilityClient.pets.findPetsByStatus.getQueryKey();
api.pets.findPetsByStatus.getQueryKey();
```

Do not remove this test in this task.

- [ ] **Step 2: Merge no-context factory variants into one test**

Replace these tests:

- `transforms zero-arg no-options callbacks on a no-context factory`
- `transforms both zero-arg no-options and options calls to a no-context factory`

with one test named:

```ts
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

    expect(result?.code).toMatchInlineSnapshot();
  });
```

- [ ] **Step 3: Run the focused test and update the inline snapshot**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "transforms zero-arg and options calls to a no-context factory" -u
```

Expected: PASS and Vitest writes one snapshot containing `apiUtility_pets_getPets` without options and `apiWithClient_pets_getPets` with `{ queryClient: {} }`.

- [ ] **Step 4: Verify removed test names are gone**

Run:

```bash
rg -n "transforms zero-arg no-options callbacks on a no-context factory|transforms both zero-arg no-options and options calls to a no-context factory" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: no output.

- [ ] **Step 5: Run and commit**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): consolidate no-context factory snapshots"
```

Expected: Vitest PASS and commit succeeds.

### Task 7: Shrink Explicit-Options Callback Duplication

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Remove the weaker explicit-options callback test if covered by stronger regressions**

Inspect `optimizes explicit options clients created inside callbacks`.

Remove it only if these tests are still present after Tasks 1 and 2:

```bash
rg -n "supports context-based and explicit-options createAPIClientFn clients in one file|splits explicit options clients across sibling callback scopes|optimizes mutation callbacks across onMutate, onError, and onSuccess|aliases generated names for explicit options clients inside nested function scopes" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: all four names are present.

Then delete the whole `optimizes explicit options clients created inside callbacks` test block.

- [ ] **Step 2: Run a focused replacement set**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "supports context-based and explicit-options createAPIClientFn clients in one file|splits explicit options clients across sibling callback scopes|optimizes mutation callbacks across onMutate, onError, and onSuccess|aliases generated names for explicit options clients inside nested function scopes"
```

Expected: PASS.

- [ ] **Step 3: Verify the removed test name is gone**

Run:

```bash
rg -n "optimizes explicit options clients created inside callbacks" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: no output.

- [ ] **Step 4: Run and commit**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): remove duplicate explicit-options callback snapshot"
```

Expected: Vitest PASS and commit succeeds.

### Task 8: Consolidate Precreated Options Import Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Keep direct and client-module option source tests**

Keep these tests:

```ts
it('imports precreated client options from a separate module', ...)
it('imports precreated client options from the same module as the client', ...)
```

They cover the two primary option-source contracts.

- [ ] **Step 2: Remove the re-export duplicate if fixture-relative barrel coverage remains**

Keep `imports precreated client options from a fixture-relative module` because it protects a distinct barrel import-path case.

Remove `supports precreated client options re-exported through client.ts` if `imports precreated client options from the same module as the client` still proves importing options from `./client`.

- [ ] **Step 3: Run focused precreated options tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "imports precreated client options from a separate module|imports precreated client options from a fixture-relative module|imports precreated client options from the same module as the client"
```

Expected: PASS.

- [ ] **Step 4: Verify the removed test name is gone**

Run:

```bash
rg -n "supports precreated client options re-exported through client.ts" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: no output.

- [ ] **Step 5: Run and commit**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): trim duplicate precreated options snapshot"
```

Expected: Vitest PASS and commit succeeds.

### Task 9: Final Verification and Summary

**Files:**
- Verify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Run package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: PASS.

- [ ] **Step 2: Run package typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS.

- [ ] **Step 3: Count test-case names before final summary**

Run:

```bash
rg -n "^  it\\(" packages/tree-shaking-plugin/src/core.test.ts
```

Expected:

- New mixed-mode tests are present.
- Removed duplicate names are absent.
- Source-map, resolver/moduleAccess, collision, partial-transform, and negative-control tests are still present.
- Any `it.skip(...)` added under the Failure Policy is visible in the final summary.

- [ ] **Step 4: Inspect final diff range**

Run:

```bash
git show --stat --oneline HEAD~8..HEAD
git diff HEAD~8..HEAD -- packages/tree-shaking-plugin/src/core.test.ts
```

Expected:

- Only `packages/tree-shaking-plugin/src/core.test.ts` changed across implementation commits.
- The number of duplicate full inline snapshots is lower than before deduplication, even after the added mixed-mode snapshots.
- No production transform code changed.

## Self-Review

Spec coverage:

- The plan implements the original deduplication spec, not only the later mixed-mode addition.
- The plan adds missing coverage before deleting duplicate snapshots, including same-operation, top-level mixed-mode, partial mixed-mode, and collision-across-modes regressions.
- The plan preserves separate contracts for context-based `createAPIClientFn`, explicit-options `createAPIClientFn`, and precreated `apiClient`.
- The plan leaves source-map, resolver/moduleAccess, naming collision, partial transform, and false-positive tests intact.
- The plan states that non-snapshot failures in new or changed tests should be skipped rather than fixed in production code.

Placeholder scan:

- No placeholder implementation steps remain.
- Every code-changing step includes exact test code or exact deletion criteria.
- Every verification step includes exact commands and expected results.

Type consistency:

- `createFixture(...)`, `getContextFixtureFiles(...)`, `PRECREATED_API_INDEX_TS`, `PRECREATED_BASE_FILES`, `SERVICES_INDEX_TS`, `PETS_SERVICE_TS`, `STORES_SERVICE_TS`, `DEFAULT_PRECREATED_CLIENT_OPTIONS_TS`, `writeFixtureFiles(...)`, `transformQraftTreeShaking(...)`, `fs`, `os`, and `path` already exist in `core.test.ts`.
- The all-modes test uses `ContextAPIClientContext` consistently as the generated context symbol.
- The precreated all-modes config uses `clientModule: './precreated-client'`, `createAPIClientFnModule: './precreated-api'`, and `createAPIClientFnOptionsModule: './precreated-client-options'`, matching the files created in the fixture.
- Task 5 intentionally stays top-level/non-React because React-like mixed-mode coverage is already handled by Tasks 1 and 2.
