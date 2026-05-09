# Qraft Tree-Shaking Client Helper Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emit `qraftAPIClient` for tree-shaken micro-clients that only use ordinary or utility callbacks, while keeping `qraftReactAPIClient` only for hook-bearing clients and covering the split with unit and bundler e2e regressions.

**Architecture:** Add a second callback classifier in `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts` that distinguishes React-hook callbacks from ordinary callbacks. `mutate.ts` will use that classifier in two places: when choosing which runtime helper import to add, and when emitting each optimized client declaration. `callbackNeedsRuntimeContext(...)` remains the guard for zero-arg factory calls that can only be rewritten for `getQueryKey` / `getInfiniteQueryKey` / `getMutationKey`, so we do not widen the inline-call contract accidentally. The unit suite will update the existing snapshots that already model explicit-options, zero-arg, and mixed-scope clients, and the e2e bundle matrix will get one new utility-only scenario instead of a broader rewrite of the current mixed fixture.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest, inline snapshots, Yarn 4, bundler e2e fixtures.

**File Structure:**
- `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`: add a hook/runtime classifier alongside the existing callback context classifier.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: choose `qraftAPIClient` vs `qraftReactAPIClient` per optimized client and per import batch; omit `APIClientContext` when the utility path is selected.
- `packages/tree-shaking-plugin/src/core.test.ts`: update the existing snapshots that currently assume `qraftReactAPIClient` for utility-only or mixed ordinary-method clients.
- `packages/tree-shaking-plugin/README.md`: document the new helper-selection behavior and the utility-only zero-arg case.
- `e2e/projects/tree-shaking-bundlers/src/barrel-utility-relative.ts`: new utility-only fixture that exercises both named and inline zero-arg client creation.
- `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`: add a utility-mode scenario and wire its include/exclude tokens.
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`: add utility-mode expectations for helper imports and `APIClientContext`.

---

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

- [ ] **Step 5: Run the focused unit subset and refresh the snapshots**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "optimizes inline explicit options clients|rewrites context-free callbacks from zero-arg createAPIClient calls|keeps APIClientContext when context-free and contextful callbacks share one client|groups callbacks per operation and imports operationInvokeFn directly|optimizes explicit options clients created inside callbacks" -u
```

Expected: all updated snapshots now show `qraftAPIClient` for ordinary-method clients and keep `qraftReactAPIClient` only where a hook callback is still present.

---

### Task 2: Teach the transform runtime to pick the helper per client

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [ ] **Step 1: Add a dedicated React-hook classifier for callbacks**

Extend the callback metadata with a helper that answers "does this callback require `qraftReactAPIClient`?" The classifier should return `true` for the hook callbacks only:

```ts
const hookCallbacks = new Set([
  'useInfiniteQuery',
  'useIsFetching',
  'useIsMutating',
  'useMutation',
  'useMutationState',
  'useQueries',
  'useQuery',
  'useSuspenseInfiniteQuery',
  'useSuspenseQueries',
  'useSuspenseQuery',
]);

export function callbackNeedsReactRuntime(callbackName: string): boolean {
  if (!isSupportedCallbackName(callbackName)) return true;
  return hookCallbacks.has(callbackName);
}
```

Keep `callbackNeedsRuntimeContext(...)` unchanged. It still answers the separate question "can this callback be called from a zero-arg factory call?", which is why `getQueryKey`, `getMutationKey`, and `getInfiniteQueryKey` stay the only zero-arg inline cases.

- [ ] **Step 2: Choose the runtime import based on the actual callback mix**

Update `insertOptimizedClients(...)` so it imports `qraftAPIClient` for utility-only optimized clients and `qraftReactAPIClient` only when at least one optimized declaration contains a hook callback. Keep the precreated-client import path unchanged. This is the part that lets one file import both helpers when it mixes ordinary methods and hooks.

- [ ] **Step 3: Emit the matching helper when building each optimized declaration**

Update `createOptimizedClientDeclaration(...)` so it uses `runtimeLocalNames.api` for ordinary-method clients and `runtimeLocalNames.react` only when the callback list includes a hook. For the API helper path, omit the `APIClientContext` argument entirely when the client came from a zero-arg `createAPIClient()` call.

The intended shape is:

```ts
qraftAPIClient(getPetById, {
  setQueryData,
  invalidateQueries
}, apiContext!);

qraftReactAPIClient(getPets, {
  useQuery
}, APIClientContext);
```

and for zero-arg utility-only clients:

```ts
qraftAPIClient(findPetsByStatus, {
  getQueryKey
});
```

- [ ] **Step 4: Run the focused package checks before touching docs**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "optimizes inline explicit options clients|rewrites context-free callbacks from zero-arg createAPIClient calls|keeps APIClientContext when context-free and contextful callbacks share one client|groups callbacks per operation and imports operationInvokeFn directly|optimizes explicit options clients created inside callbacks"
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: the unit subset passes with the new helper split, and typecheck stays clean without new casts or signature drift.

---

### Task 3: Add an e2e fixture for utility-only clients

**Files:**
- Create: `e2e/projects/tree-shaking-bundlers/src/barrel-utility-relative.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [ ] **Step 1: Add a compact fixture that exercises both named and inline utility clients**

Create a new entry file that mirrors the existing barrel-relative fixture, but only uses utility callbacks:

```ts
import { createBarrelAPIClient } from './generated-api';

const api = createBarrelAPIClient();

export const result = [
  api.pets.findPetsByStatus.getQueryKey(),
  createBarrelAPIClient().pets.findPetsByStatus.getMutationKey(),
];
```

This fixture should prove that both the named binding and the inline factory call can be optimized without bringing in React-specific wiring.

- [ ] **Step 2: Add a dedicated utility mode to the bundler scenario matrix**

Update `scripts/shared.mjs` so the scenario list gains one utility-only entry, for example:

```js
utilityScenario({
  name: 'barrel-utility-relative',
  entry: 'src/barrel-utility-relative.ts',
  include: [
    'qraftAPIClient',
    '@openapi-qraft/react/callbacks/getQueryKey',
    '@openapi-qraft/react/callbacks/getMutationKey',
    'findPetsByStatus',
  ],
  exclude: [
    'APIClientContext',
    'qraftReactAPIClient',
  ],
});
```

Also add the helper that defines `mode: 'utility'` with `include: [/qraftAPIClient(?:__|\()/]` and `exclude: [/qraftReactAPIClient(?:__|\()/]` in `assert-dist.mjs`.

- [ ] **Step 3: Run the local bundler matrix and confirm the new mode stays React-free**

Run:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: every bundler emits `qraftAPIClient` for the new utility scenario, and none of the bundles contain `qraftReactAPIClient` or `APIClientContext` for that scenario.

---

### Task 4: Update the README contract to match the new transform behavior

**Files:**
- Modify: `packages/tree-shaking-plugin/README.md`

- [ ] **Step 1: Add a short note in `createAPIClientFn` or `Transformation Examples`**

Document that the plugin now emits `qraftAPIClient` for optimized clients that use only ordinary or utility callbacks, and that `qraftReactAPIClient` is reserved for hook-bearing clients. Call out the zero-arg utility-only case explicitly so the reader does not assume every `createAPIClient()` rewrite needs React context.

- [ ] **Step 2: Update the example output so it matches the new runtime split**

Refresh the existing `createAPIClientFn` example or add a compact adjacent example that shows:

```ts
const utilityClient = qraftAPIClient(findPetsByStatus, {
  getQueryKey
});

const hookClient = qraftReactAPIClient(getPets, {
  useQuery
}, APIClientContext);
```

- [ ] **Step 3: Sanity-check the wording**

Run:

```bash
rg -n "qraftAPIClient|qraftReactAPIClient|APIClientContext" packages/tree-shaking-plugin/README.md
```

Expected: the new explanatory text is present, and the examples still match the runtime split described in the code.

---

### Task 5: Final verification and commit the implementation

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify: `packages/tree-shaking-plugin/README.md`
- Create: `e2e/projects/tree-shaking-bundlers/src/barrel-utility-relative.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [ ] **Step 1: Run the package tests after the e2e fixture lands**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both commands pass with the updated helper split and the refreshed snapshots.

- [ ] **Step 2: Run the bundler matrix again after any README or fixture tweaks**

Run:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: the new utility scenario passes across Vite, Rollup, Webpack, Rspack, and esbuild.

- [ ] **Step 3: Commit the implementation changes**

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/lib/transform/callbacks.ts packages/tree-shaking-plugin/src/lib/transform/mutate.ts packages/tree-shaking-plugin/README.md e2e/projects/tree-shaking-bundlers/src/barrel-utility-relative.ts e2e/projects/tree-shaking-bundlers/scripts/shared.mjs e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs
git commit -m "feat: split qraft tree-shaking helper selection"
```
