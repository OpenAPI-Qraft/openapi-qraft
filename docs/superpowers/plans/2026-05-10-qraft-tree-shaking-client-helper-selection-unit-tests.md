# Qraft Tree-Shaking Client Helper Selection Unit Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `createAPIClientFn` tree-shaken clients emit `qraftAPIClient` whenever the used callbacks do not require React runtime, keep `qraftReactAPIClient` only for hook callbacks, and verify that behavior entirely with unit tests.

**Architecture:** Move callback capability knowledge into `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts` as a single metadata table with two booleans: `needsOptions` and `needsReactRuntime`. `needsOptions` decides whether a generated client needs the options object at all, while `needsReactRuntime` decides whether the runtime helper must be `qraftReactAPIClient`. `mutate.ts` will consume that metadata to choose the runtime helper per generated client binding and per inline rewrite, then reuse the same choice when deciding whether to import `APIClientContext` or the lean `qraftAPIClient` runtime. The existing `apiClient` precreated path stays unchanged. E2E coverage is intentionally excluded from this plan and will be handled separately.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest inline snapshots, Yarn 4.

---

### File Structure

- `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`: callback capability table and helper predicates.
- `packages/tree-shaking-plugin/src/lib/transform/callbacks.test.ts`: direct contract tests for callback metadata.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: runtime helper selection, import emission, and inline/client rewrites.
- `packages/tree-shaking-plugin/src/core.test.ts`: snapshot regressions for baseline utility callbacks, options-bearing API callbacks, and React-hook callbacks.

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
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "groups callbacks per operation and imports operationInvokeFn directly|rewrites context-free callbacks from zero-arg createAPIClient calls|keeps APIClientContext when context-free and contextful callbacks share one client|optimizes inline explicit options clients|optimizes explicit options clients created inside callbacks|optimizes mutation callbacks across onMutate, onError, and onSuccess|aliases generated names for explicit options clients inside nested function scopes"
```

Expected: snapshot failures still showing `qraftReactAPIClient` in API-only branches.

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

qraftAPIClient(
  findPetsByStatus,
  {
    invalidateQueries,
    setQueryData,
  },
  apiContext!
);

qraftAPIClient(
  getPets,
  {
    operationInvokeFn,
  },
  createAPIClientOptions()
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
- `aliases generated names for explicit options clients inside nested function scopes`

Representative new snapshots should look like this:

Before transform (**not literally**):

```ts
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';
import { createAPIClient } from './api';

const apiContext = {
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
};

const api = createAPIClient(apiContext);
const apiReact = createAPIClient();

export function App() {
  api.pets.findPetsByStatus.invalidateQueries();
  apiReact.pets.getPets.useQuery();
}
```

After transform (**not literally**):

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
}
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

- [ ] **Step 5: Re-run the package test suite**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both pass after the snapshot refresh.

- [ ] **Step 6: Commit the transform change**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/mutate.ts packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/lib/transform/callbacks.ts packages/tree-shaking-plugin/src/lib/transform/callbacks.test.ts
git commit -m "feat: select qraft API client for non-react callbacks"
```

### Task 3: Final verification for the unit-test plan

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/callbacks.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Run the full package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both commands pass with the unit-only split in place.

- [ ] **Step 2: Hand off the unit-test plan**

If the package tests stay green, the unit-test plan is done and the e2e follow-up can be executed separately.
