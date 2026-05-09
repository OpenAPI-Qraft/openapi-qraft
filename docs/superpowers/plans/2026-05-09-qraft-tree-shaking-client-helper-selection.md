# Qraft Tree-Shaking Client Helper Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emit `qraftAPIClient` for tree-shaken micro-clients that only use ordinary or utility callbacks, keep `qraftReactAPIClient` only for hook-bearing clients, and cover the split plus a no-context Node.js-style factory with unit and bundler e2e regressions.

**Architecture:** Add a second callback classifier in `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts` that distinguishes React-hook callbacks from ordinary callbacks. `mutate.ts` will use that classifier in two places: when choosing which runtime helper import to add, and when emitting each optimized client declaration. `callbackNeedsRuntimeContext(...)` remains the guard for zero-arg factory calls that can only be rewritten for `getQueryKey` / `getInfiniteQueryKey` / `getMutationKey`, so we do not widen the inline-call contract accidentally. The unit suite will update the existing snapshots that already model explicit-options, zero-arg, and mixed-scope clients, and the e2e bundle matrix will cover both a utility-only scenario and a no-context Node.js-style factory that is useful for memory-sensitive runtimes such as lambdas.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest, inline snapshots, Yarn 4, bundler e2e fixtures.

**File Structure:**

- ***

### Task 1: Lock the new helper-selection contract into the existing unit snapshots

**Files:**

- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Update the explicit-options snapshot so ordinary methods emit `qraftAPIClient`**

Adjust `optimizes inline explicit options clients` so the generated code keeps the explicit `apiContext!` expression but swaps the helper from `qraftReactAPIClient` to `qraftAPIClient` for the ordinary-method micro-clients:

```ts
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
    }, apiContext!).setQueryData(
      { path: { petId: 1 } },
      { id: 1 }
    );
    qraftAPIClient(findPetsByStatus, {
      invalidateQueries
    }, apiContext!).invalidateQueries();
  }"
`);
```

The same test should also continue to prove that ordinary callbacks like `setQueryData` and `invalidateQueries` do not force a React helper.

- [ ] **Step 2: Update the zero-arg utility snapshot so the transform drops React context entirely**

Adjust `rewrites context-free callbacks from zero-arg createAPIClient calls` so the optimized declaration and the inline call both use `qraftAPIClient`, and the snapshot no longer imports `APIClientContext`:

```ts
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
```

This is the regression that proves zero-arg utility-only `createAPIClient()` calls are still valid, but now emit the leaner runtime helper.

- [ ] **Step 3: Update the mixed-scope snapshots so one file can emit both runtime helpers**

Adjust `keeps APIClientContext when context-free and contextful callbacks share one client` and `groups callbacks per operation and imports operationInvokeFn directly` so the ordinary-method branch uses `qraftAPIClient` while the hook branch still uses `qraftReactAPIClient`:

```ts
expect(result?.code).toMatchInlineSnapshot(`
  "import { qraftAPIClient, qraftReactAPIClient } from "@openapi-qraft/react";
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
```

For `groups callbacks per operation and imports operationInvokeFn directly`, the ordinary-operation declaration should also move to `qraftAPIClient(...)` and keep `operationInvokeFn` in the callback object.

- [ ] **Step 4: Update the nested-client snapshot so runtime-created ordinary clients stop using the React helper**

Adjust `optimizes explicit options clients created inside callbacks` so the nested `getPetById` client becomes `qraftAPIClient(...)`, while the outer `updatePet` client stays on `qraftReactAPIClient(...)` because it still owns `useMutation`.

- [ ] **Step 3: Emit the matching helper when building each optimized declaration**

The intended shape is:

```ts
qraftAPIClient(
  getPetById,
  {
    setQueryData,
    invalidateQueries,
  },
  apiContext!
);

qraftReactAPIClient(
  getPets,
  {
    useQuery,
  },
  APIClientContext
);
```

and for zero-arg utility-only clients:

```ts
qraftAPIClient(findPetsByStatus, {
  getQueryKey,
});
```

- [ ] **Step 1: Add a compact fixture that exercises both named and inline utility clients**

Create a new entry file that mirrors the existing barrel-relative fixture, but only uses utility callbacks:

```ts
import { createBarrelAPIClient, createNodeAPIClient } from './generated-api';

const api = createBarrelAPIClient();
const nodeApiUtility = createNodeAPIClient();

export const result = [
  nodeApiUtility.pets.findPetsByStatus.getQueryKey(),
  nodeApiUtility.pets.findPetsByStatus.schema,
  createNodeAPIClient().pets.findPetsByStatus.getQueryKey(),
  createNodeAPIClient().pets.findPetsByStatus.schema,
  api.pets.findPetsByStatus.getQueryKey(),
  createBarrelAPIClient().pets.findPetsByStatus.getMutationKey(),
  // etc, maybe
];
```

- [ ] **Step 4: Add a mixed-case Node.js regression alongside the existing utility-only fixture**

```ts
// Not litrally, just an example (!!!!!!!)
import {
  createBarrelAPIClient,
  createNodeAPIClient,
  createRelativeAPIClient,
} from './generated-api';

const nodeApi = createNodeAPIClient({ ...apiClientTypeCompatibleOptions });
const barrelApi = createBarrelAPIClient();
const relativeApi = createRelativeAPIClient();

export const result = [
  nodeApi.pets.findPetsByStatus(),
  nodeApi.pets.findPetsByStatus.invalidateQueries(),
  nodeApi.pets.findPetsByStatus.schema,
  barrelApi.pets.getPets.invalidateQueries(),
  relativeApi.pets.createPet.invalidateQueries(),
];
```

---

Expected: both commands pass with the updated helper split and the refreshed snapshots.

- [ ] **Step 2: Run the bundler matrix again after any README or fixture tweaks**

Run:

```bash
### todo::add typechecking task in the test project
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```
