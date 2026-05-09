# Qraft Tree-Shaking Client Helper Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `createAPIClientFn` tree-shaken clients emit `qraftAPIClient` whenever the used callbacks do not require React runtime, and keep `qraftReactAPIClient` only for clients that actually use React-hook callbacks. `callbacks.ts` should be the source of truth for both callback options and React-runtime requirements.

**Architecture:** Move callback capability knowledge into `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts` as a single metadata table with two booleans: `needsOptions` and `needsReactRuntime`. `needsOptions` decides whether the generated client must carry the original options expression or options factory result, while `needsReactRuntime` decides whether the runtime helper must be `qraftReactAPIClient`. `mutate.ts` will consume that metadata to choose the runtime helper per generated client binding and per inline rewrite, then reuse the same choice when deciding whether to import `APIClientContext` or the lean `qraftAPIClient` runtime. The existing `apiClient` precreated path stays unchanged.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest inline snapshots, Yarn 4, bundler e2e fixtures.

---

### File Structure

- `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`: callback capability table and helper predicates.
- `packages/tree-shaking-plugin/src/lib/transform/callbacks.test.ts`: direct contract tests for callback metadata.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: runtime helper selection, import emission, and inline/client rewrites.
- `packages/tree-shaking-plugin/src/core.test.ts`: snapshot regressions for zero-arg, explicit-options, mixed, and nested createAPIClientFn rewrites.
- `e2e/projects/tree-shaking-bundlers/src/*.ts`: utility-only and mixed createAPIClientFn bundle fixtures.
- `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`: scenario registration for the new utility-only and mixed bundle cases.
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`: bundle-token expectations for `qraftAPIClient`-only and mixed helper output.

### Task 1: Make callback capabilities explicit in `callbacks.ts`

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/callbacks.test.ts`

- [ ] **Step 1: Write the failing metadata contract test**

Add a focused test that makes the new split visible:

```ts
import { describe, expect, it } from 'vitest';
import {
  callbackNeedsOptions,
  callbackNeedsReactRuntime,
  supportedCallbacks,
} from './callbacks.js';

describe('callback capability metadata', () => {
  it('marks hook callbacks as React-runtime-bearing and utility callbacks as React-free', () => {
    expect(supportedCallbacks.useQuery).toEqual({
      needsOptions: true,
      needsReactRuntime: true,
    });
    expect(supportedCallbacks.getQueryKey).toEqual({
      needsOptions: false,
      needsReactRuntime: false,
    });
    expect(supportedCallbacks.invalidateQueries).toEqual({
      needsOptions: true,
      needsReactRuntime: false,
    });
    expect(supportedCallbacks.setQueryData).toEqual({
      needsOptions: true,
      needsReactRuntime: false,
    });
    expect(supportedCallbacks.operationInvokeFn).toEqual({
      needsOptions: true,
      needsReactRuntime: false,
    });
  });

  it('exposes helpers for both capability checks', () => {
    expect(callbackNeedsReactRuntime('useQuery')).toBe(true);
    expect(callbackNeedsReactRuntime('getQueryKey')).toBe(false);
    expect(callbackNeedsOptions('getQueryKey')).toBe(false);
    expect(callbackNeedsOptions('invalidateQueries')).toBe(true);
    expect(callbackNeedsOptions('operationInvokeFn')).toBe(true);
  });
});
```

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/lib/transform/callbacks.test.ts
```

Expected: fail because the table still only tracks `needsRuntimeContext`.

- [ ] **Step 2: Replace the old one-flag table with a two-flag capability table**

Update the metadata shape and keep the existing callback entries, but give every row both flags:

```ts
type CallbackMetadata = {
  needsOptions: boolean;
  needsReactRuntime: boolean;
};

export const supportedCallbacks = {
  cancelQueries: { needsOptions: true, needsReactRuntime: false },
  ensureInfiniteQueryData: { needsOptions: true, needsReactRuntime: false },
  ensureQueryData: { needsOptions: true, needsReactRuntime: false },
  fetchInfiniteQuery: { needsOptions: true, needsReactRuntime: false },
  fetchQuery: { needsOptions: true, needsReactRuntime: false },
  getInfiniteQueryData: { needsOptions: true, needsReactRuntime: false },
  getInfiniteQueryKey: { needsOptions: false, needsReactRuntime: false },
  getInfiniteQueryState: { needsOptions: true, needsReactRuntime: false },
  getMutationCache: { needsOptions: true, needsReactRuntime: false },
  getMutationKey: { needsOptions: false, needsReactRuntime: false },
  getQueriesData: { needsOptions: true, needsReactRuntime: false },
  getQueryData: { needsOptions: true, needsReactRuntime: false },
  getQueryKey: { needsOptions: false, needsReactRuntime: false },
  getQueryState: { needsOptions: true, needsReactRuntime: false },
  invalidateQueries: { needsOptions: true, needsReactRuntime: false },
  isFetching: { needsOptions: true, needsReactRuntime: false },
  isMutating: { needsOptions: true, needsReactRuntime: false },
  operationInvokeFn: { needsOptions: true, needsReactRuntime: false },
  prefetchInfiniteQuery: { needsOptions: true, needsReactRuntime: false },
  prefetchQuery: { needsOptions: true, needsReactRuntime: false },
  refetchQueries: { needsOptions: true, needsReactRuntime: false },
  removeQueries: { needsOptions: true, needsReactRuntime: false },
  resetQueries: { needsOptions: true, needsReactRuntime: false },
  setInfiniteQueryData: { needsOptions: true, needsReactRuntime: false },
  setQueriesData: { needsOptions: true, needsReactRuntime: false },
  setQueryData: { needsOptions: true, needsReactRuntime: false },
  useInfiniteQuery: { needsOptions: true, needsReactRuntime: true },
  useIsFetching: { needsOptions: true, needsReactRuntime: true },
  useIsMutating: { needsOptions: true, needsReactRuntime: true },
  useMutation: { needsOptions: true, needsReactRuntime: true },
  useMutationState: { needsOptions: true, needsReactRuntime: true },
  useQueries: { needsOptions: true, needsReactRuntime: true },
  useQuery: { needsOptions: true, needsReactRuntime: true },
  useSuspenseInfiniteQuery: { needsOptions: true, needsReactRuntime: true },
  useSuspenseQueries: { needsOptions: true, needsReactRuntime: true },
  useSuspenseQuery: { needsOptions: true, needsReactRuntime: true },
} as const satisfies Readonly<Record<string, CallbackMetadata>>;
```

Keep the existing name guard and add two helpers:

```ts
export function callbackNeedsOptions(callbackName: string): boolean {
  if (!isSupportedCallbackName(callbackName)) return true;
  return supportedCallbacks[callbackName].needsOptions;
}

export function callbackNeedsReactRuntime(callbackName: string): boolean {
  if (!isSupportedCallbackName(callbackName)) return true;
  return supportedCallbacks[callbackName].needsReactRuntime;
}
```

If you want a pure selector for `mutate.ts`, add one more helper:

```ts
export function clientNeedsReactRuntime(
  callbackNames: readonly string[]
): boolean {
  return callbackNames.some((callbackName) =>
    callbackNeedsReactRuntime(callbackName)
  );
}
```

- [ ] **Step 3: Rerun the focused metadata test**

Run the same command again.

Expected: pass.

- [ ] **Step 4: Commit the metadata split**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/callbacks.ts packages/tree-shaking-plugin/src/lib/transform/callbacks.test.ts
git commit -m "feat: split tree-shaking callback capabilities"
```

### Task 2: Select the runtime helper per generated client in `mutate.ts`

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Capture the current snapshot failures before changing the transform**

Run the focused core tests that should flip from React helper to API helper:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "groups callbacks per operation and imports operationInvokeFn directly|rewrites context-free callbacks from zero-arg createAPIClient calls|keeps APIClientContext when context-free and contextful callbacks share one client|optimizes inline explicit options clients|optimizes mutation callbacks across onMutate, onError, and onSuccess"
```

Expected: snapshot failures still showing `qraftReactAPIClient` in utility-only branches.

- [ ] **Step 2: Add a local runtime-helper selector and carry it through declaration emission**

Introduce a tiny local type in `mutate.ts` so the import decision and the emitted call stay in sync:

```ts
type RuntimeHelperKind = 'api' | 'react';

function selectRuntimeHelper(
  callbackNames: readonly { callbackName: string }[]
): RuntimeHelperKind {
  return callbackNames.some((callback) =>
    callbackNeedsReactRuntime(callback.callbackName)
  )
    ? 'react'
    : 'api';
}
```

Use that selector in `createOptimizedClientDeclaration(...)` and in the code that inserts runtime imports so a single `createAPIClientFn` file can import both helpers when it needs both. Keep the `apiClient` precreated path unchanged.

The emitted shapes should become:

```ts
qraftAPIClient(findPetsByStatus, {
  getQueryKey,
});

qraftAPIClient(findPetsByStatus, {
  invalidateQueries,
  setQueryData,
});

qraftAPIClient(
  findPetsByStatus,
  {
    operationInvokeFn,
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

The important part is that the runtime helper now follows the callback set, not the presence of a `createAPIClientFn` binding itself.

- [ ] **Step 3: Update the inline rewrite branch to use the same selector**

`rewriteInlineClientCalls(...)` should call the same helper decision for each inline usage, so a zero-arg utility-only call rewrites to `qraftAPIClient(...)` and does not drag `APIClientContext` into the file.

- [ ] **Step 4: Refresh the core snapshots to the new exact emitted structure**

Update the affected snapshots in `packages/tree-shaking-plugin/src/core.test.ts`:

- `groups callbacks per operation and imports operationInvokeFn directly`
- `rewrites context-free callbacks from zero-arg createAPIClient calls`
- `keeps APIClientContext when context-free and contextful callbacks share one client`
- `optimizes inline explicit options clients`
- `optimizes explicit options clients created inside callbacks`
- `optimizes mutation callbacks across onMutate, onError, and onSuccess`

Representative new snapshots should look like this:

```ts
"import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';
import { qraftAPIClient, qraftReactAPIClient } from \"@openapi-qraft/react\";
import { invalidateQueries } from \"@openapi-qraft/react/callbacks/invalidateQueries\";
import { setQueryData } from \"@openapi-qraft/react/callbacks/setQueryData\";
import { findPetsByStatus } from \"./api/services/PetsService\";
import { useQuery } from \"@openapi-qraft/react/callbacks/useQuery\";
import { getPets } from \"./api/services/PetsService\";
import { APIClientContext } from \"./api/APIClientContext\";
import { useContext } from \"react\";
const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
  invalidateQueries,
  setQueryData
}, {
  // new, top level precreated options, normally passed to createAPIClient({...}) as arg
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
});
const api_pets_getPets = qraftReactAPIClient(getPets, {
  useQuery
}, APIClientContext);
export function App() {
  api_pets_findPetsByStatus.invalidateQueries();
  api_pets_getPets.useQuery();
}"
```

and:

```ts
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';
import { qraftAPIClient } from \"@openapi-qraft/react\";
import { operationInvokeFn } from \"@openapi-qraft/react/callbacks/operationInvokeFn\";
import { APIClientContext } from \"./api/APIClientContext\";
import { useContext } from \"react\";
import { findPetsByStatus } from \"./api/services/PetsService\";
const apiContext = { // new, top level precreated options
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
};
const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
  operationInvokeFn
}, apiContext);
function App() {
  void qraftAPIClient(findPetsByStatus, {
    operationInvokeFn
  }, apiContext)();
  const utilityClient_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
    operationInvokeFn
  }, apiContext);
  void utilityClient_pets_findPetsByStatus();
  api_pets_findPetsByStatus();
}"
```

and:

```ts
"import { qraftAPIClient, qraftReactAPIClient } from \"@openapi-qraft/react\";
import { useContext } from \"react\";
import { getQueryKey } from \"@openapi-qraft/react/callbacks/getQueryKey\";
import { invalidateQueries } from \"@openapi-qraft/react/callbacks/invalidateQueries\";
import { findPetsByStatus } from \"./api/services/PetsService\";
import { useQuery } from \"@openapi-qraft/react/callbacks/useQuery\";
import { getPets } from \"./api/services/PetsService\";
import { APIClientContext } from \"./api/APIClientContext\";
const api_pets_getPets = qraftReactAPIClient(getPets, {
  useQuery
}, APIClientContext);
export function App() {
  const apiContext = useContext(APIClientContext);
  const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
    getQueryKey,
    invalidateQueries
  }, apiContext!);
  api_pets_findPetsByStatus.getQueryKey();
  api_pets_findPetsByStatus.invalidateQueries();
  api_pets_getPets.useQuery();
  api_pets_getPets.getQueryKey();
}"
```

For the nested-options case, the nested-options snapshot should keep the outer `updatePet` client on `qraftReactAPIClient`, but the inner `getPetById` declaration inside `onMutate` and the other utility-only callbacks in `onError` / `onSuccess` should flip to `qraftAPIClient`.

The exact formatting can stay aligned with the current printer output, but every branch that only uses non-React callbacks must flip to `qraftAPIClient`, including `invalidateQueries`, `setQueryData`, and direct operation invocation.

- [ ] **Step 5: Re-run the package test suite**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both pass after the snapshot refresh.

- [ ] **Step 6: Commit the transform change**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/mutate.ts packages/tree-shaking-plugin/src/core.test.ts
git commit -m "feat: select qraft API client for non-react callbacks"
```

### Task 3: Add bundler e2e coverage for API-only and mixed helper output

**Files:**

- Add: `e2e/projects/tree-shaking-bundlers/src/barrel-utility-only.ts`
- Add: `e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [ ] **Step 1: Add the new fixture entries before changing the assertions**

Create one utility-only entry and one mixed entry that both come from `createBarrelAPIClient` so the helper split is easy to read:

```ts
// src/barrel-utility-only.ts
import { createBarrelAPIClient } from './generated-api';

const api = createBarrelAPIClient();

export const result = [
  api.pets.findPetsByStatus.invalidateQueries(),
  api.pets.findPetsByStatus.setQueryData({ path: { petId: 1 } }, { id: 1 }),
  api.pets.getPets(),
];
```

```ts
// src/barrel-mixed-helper-selection.ts
import { createBarrelAPIClient } from './generated-api';

const api = createBarrelAPIClient();

export const result = [
  api.pets.findPetsByStatus.invalidateQueries(),
  api.pets.findPetsByStatus.setQueryData({ path: { petId: 1 } }, { id: 1 }),
  api.pets.getPets.useQuery(),
];
```

Add both files to the `scenarios` array in `scripts/shared.mjs`.

- [ ] **Step 2: Extend the scenario mode expectations for API-only output**

Teach `assert-dist.mjs` about the new mode so the utility-only bundle explicitly excludes `qraftReactAPIClient` and the mixed bundle proves both helpers can coexist:

```js
const modeExpectations = {
  context: () => ({
    include: [/qraftReactAPIClient(?:__|\()/],
    exclude: [/qraftAPIClient(?:__|\()/],
  }),
  precreated: () => ({
    include: [/qraftAPIClient(?:__|\()/],
    exclude: [/qraftReactAPIClient(?:__|\()/],
  }),
  mixed: () => ({
    include: [/qraftReactAPIClient(?:__|\()/, /qraftAPIClient(?:__|\()/],
    exclude: [],
  }),
  apiOnly: () => ({
    include: [/qraftAPIClient(?:__|\()/],
    exclude: [/qraftReactAPIClient(?:__|\()/],
  }),
};
```

Add a source-map assertion for the utility-only scenario so the emitted `qraftAPIClient(` token maps back to `src/barrel-utility-only.ts`.

- [ ] **Step 3: Run the bundler matrix and confirm the new exact bundle shape**

Run:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

This local runner copies `e2e/projects/tree-shaking-bundlers` into `/Users/radist/w/qraft-e2e`, regenerates the fixture with `npm run codegen`, builds the bundlers through `scripts/build.mjs`, and then runs `scripts/assert-dist.mjs` against the generated outputs.

If you need faster local iteration inside the fixture, run the project directly:

```bash
cd e2e/projects/tree-shaking-bundlers
npm run codegen
node ./scripts/build.mjs
node ./scripts/assert-dist.mjs
```

If you need a NodeNext-only sanity check while working on import resolution, use the dedicated n2n project:

```bash
cd e2e/projects/typescript-nodenext-nodenext
npm run e2e:pre-build
npm run build
npm run e2e:post-build
```

Expected:

- `barrel-utility-only` includes `qraftAPIClient(` and excludes `qraftReactAPIClient(`
- `barrel-mixed-helper-selection` includes both helpers in the same bundle
- the existing context and precreated scenarios still pass unchanged

- [ ] **Step 4: Commit the e2e coverage**

```bash
git add e2e/projects/tree-shaking-bundlers/src/barrel-utility-only.ts e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts e2e/projects/tree-shaking-bundlers/scripts/shared.mjs e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs
git commit -m "test: cover qraft API client helper selection in e2e"
```

### Final Verification

After the three tasks are complete, run the full package tests plus the local e2e bundle check once more:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

If all three pass, the plan is done and the implementation can be handed off for review.
