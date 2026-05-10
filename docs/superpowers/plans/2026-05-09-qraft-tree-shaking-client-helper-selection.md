# Qraft Tree-Shaking Client Helper Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `createAPIClientFn` tree-shaken clients emit `qraftAPIClient` whenever the used callbacks do not require React runtime, keep `qraftReactAPIClient` only for hook callbacks, and add a separate no-context Node.js e2e case that proves the React runtime stays out of Lambda-like bundles.

**Architecture:** Move callback capability knowledge into `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts` as a single metadata table with two booleans: `needsOptions` and `needsReactRuntime`. `needsOptions` decides whether a generated client needs the options object at all, while `needsReactRuntime` decides whether the runtime helper must be `qraftReactAPIClient`. `mutate.ts` will consume that metadata to choose the runtime helper per generated client binding and per inline rewrite, then reuse the same choice when deciding whether to import `APIClientContext` or the lean `qraftAPIClient` runtime. The existing `apiClient` precreated path stays unchanged. For e2e, keep one mixed React/client bundle case and add one separate Node no-context case so the absence of React is proven in a Lambda-style entrypoint rather than inferred from `getQueryKey`.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest inline snapshots, Yarn 4, bundler e2e fixtures.

---

### File Structure

- `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`: callback capability table and helper predicates.
- `packages/tree-shaking-plugin/src/lib/transform/callbacks.test.ts`: direct contract tests for callback metadata.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: runtime helper selection, import emission, and inline/client rewrites.
- `packages/tree-shaking-plugin/src/core.test.ts`: snapshot regressions for baseline utility callbacks, options-bearing API callbacks, and React-hook callbacks.
- `e2e/projects/tree-shaking-bundlers/package.json`: codegen entry for the no-context Node helper.
- `e2e/projects/tree-shaking-bundlers/src/node-api-helper-selection.ts`: no-context Node fixture using `createNodeAPIClient`.
- `e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts`: mixed helper fixture that keeps both `qraftAPIClient` and `qraftReactAPIClient` visible in one bundle.
- `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`: scenario registration for the new Node and mixed bundle cases, plus `createNodeAPIClient` wiring in the transform config.
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
- `invalidateQueries`, `setQueryData`, and `operationInvokeFn` stay on `qraftAPIClient`
- `getQueryKey` method can still be called on any client that was created without options
- `useQuery` (any React hooks) stays on `qraftReactAPIClient`
- mixed clients can emit both helpers in one module

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

### Task 3: Add bundler e2e coverage for the Node no-context helper and the mixed helper split

**Files:**

- Modify: `e2e/projects/tree-shaking-bundlers/package.json`
- Add: `e2e/projects/tree-shaking-bundlers/src/node-api-helper-selection.ts`
- Add: `e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [ ] **Step 1: Add the new fixture entries before changing the assertions**

Add `createNodeAPIClient` to the fixture codegen command without a `context:` argument so the generated `src/generated-api/index.ts` exports a real no-context helper:

```json
"codegen": "openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript ./openapi.yaml --clean -o src/generated-api --openapi-types-import-path '../schema.ts' --openapi-types-file-name schema.ts --explicit-import-extensions --create-api-client-fn createBarrelAPIClient filename:create-barrel-api-client context:BarrelAPIClientContext --create-api-client-fn createNodeAPIClient filename:create-node-api-client --create-api-client-fn createRelativeAPIClient filename:create-relative-api-client context:RelativeAPIClientContext --create-api-client-fn createRelativeExtAPIClient filename:create-relative-ts-api-client context:RelativeExtAPIClientContext --create-api-client-fn createAliasAPIClient filename:create-alias-api-client context:AliasAPIClientContext --create-api-client-fn createAliasDirectAPIClient filename:create-alias-direct-api-client context:AliasDirectAPIClientContext --create-api-client-fn createBarrelPrecreatedAPIClient filename:create-barrel-precreated-api-client --create-api-client-fn createRelativePrecreatedAPIClient filename:create-relative-precreated-api-client --create-api-client-fn createRelativeExtPrecreatedAPIClient filename:create-relative-ts-precreated-api-client --create-api-client-fn createAliasDirectPrecreatedAPIClient filename:create-alias-direct-precreated-api-client"
```

Add a Node fixture that exercises both the zero-arg and explicit-options forms of the no-context helper:

```ts
// src/node-api-helper-selection.ts
import type { CreateAPIClientOptions } from '@openapi-qraft/react';
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';
import { createNodeAPIClient } from './generated-api';

const nodeOptions = {
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
} satisfies CreateAPIClientOptions;

const nodeApiUtility = createNodeAPIClient();
const nodeApi = createNodeAPIClient(nodeOptions);

export const result = [
  nodeApiUtility.pets.findPetsByStatus.getQueryKey(),
  nodeApi.pets.findPetsByStatus.invalidateQueries(),
  nodeApi.pets.findPetsByStatus.setQueryData({ path: { petId: 1 } }, { id: 1 }),
];
```

Add `createNodeAPIClient` to the `createAPIClientFn` export in `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs` without a `context` field, so the transform treats it as a no-context factory and can emit `qraftAPIClient` for it.

Add a second fixture that keeps the mixed helper split easy to read:

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

Teach `assert-dist.mjs` about the new no-context mode so the Node-only bundle explicitly excludes `qraftReactAPIClient` and the mixed bundle proves both helpers can coexist:

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
    exclude: [/qraftReactAPIClient(?:__|\()/, /APIClientContext/],
  }),
};
```

Add a source-map assertion for the Node-only scenario so the emitted `qraftAPIClient(` token maps back to `src/node-api-helper-selection.ts`.

Add two source-map assertions for the mixed scenario so both `qraftAPIClient(` and `qraftReactAPIClient(` map back to `src/barrel-mixed-helper-selection.ts`.

- [ ] **Step 3: Run the bundler matrix and confirm the new exact bundle shape**

Run:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

This local runner copies `e2e/projects/tree-shaking-bundlers` into `/Users/radist/w/qraft-e2e`, regenerates the fixture with `npm run codegen`, builds the bundlers through `scripts/build.mjs`, and then runs `scripts/assert-dist.mjs` against the generated outputs.

If you need faster local iteration inside the fixture, run the project directly:

```bash
cd e2e/projects/tree-shaking-bundlers
npm run e2e:pre-build
npm exec tsc -- --noEmit
npm run build
npm run e2e:post-build
```

Expected:

- `node-api-helper-selection` includes `qraftAPIClient(` and excludes `qraftReactAPIClient(` and `APIClientContext`
- `barrel-mixed-helper-selection` includes both helpers in the same bundle
- the existing context and precreated scenarios still pass unchanged

- [ ] **Step 4: Commit the e2e coverage**

```bash
git add e2e/projects/tree-shaking-bundlers/package.json e2e/projects/tree-shaking-bundlers/src/node-api-helper-selection.ts e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts e2e/projects/tree-shaking-bundlers/scripts/shared.mjs e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs
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
