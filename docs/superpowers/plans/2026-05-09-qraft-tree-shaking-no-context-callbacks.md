# Qraft Tree-Shaking No-Context Callback Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the tree-shaking transform recognize context-based API client calls that use only `getQueryKey`, `getInfiniteQueryKey`, or `getMutationKey`, including both inline `createAPIClient().pets...` call sites and named zero-arg locals like `const utilityClient = createAPIClient()` that currently fall through and keep the original factory import alive.

**Architecture:** Add one small shared callback-classification helper so the transform has one source of truth for which callbacks need runtime context and which do not. The mutator then uses that classification in two places: it omits the `APIClientContext` argument and import when every callback for a generated client is context-free, and it allows inline `createAPIClient()` calls to be rewritten even when the factory call has no runtime options. Existing behavior for `useQuery`, `useMutation`, `operationInvokeFn`, and precreated clients stays unchanged. Named zero-arg locals inside a function follow the same rule when they are only used for utility callbacks.

**Tech Stack:** TypeScript, Babel parser/traverse/types, Vitest, Yarn 4, inline snapshots.

**File Structure:**

- `packages/tree-shaking-plugin/src/core.test.ts`: add regression coverage for zero-arg `createAPIClient()` usage with `getQueryKey`-style callbacks.
- `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`: new shared callback-classification helper for context-free callbacks.
- `packages/tree-shaking-plugin/src/lib/transform/plan.ts`: allow zero-arg inline factory calls to enter the transform plan when they are used only with context-free callbacks.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: use the shared helper to emit 2-arg `qraftReactAPIClient(...)` calls when context is unnecessary and to accept zero-arg inline factory calls for those callbacks.

---

### Task 1: Add a regression test that captures the current failure

**Files:**

- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Add a focused regression for zero-arg `createAPIClient()` usage in inline and named local form**

Add a test that exercises both the inline call and the named local binding in the same file so the transform must handle each path:

```ts
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
    "import { qraftReactAPIClient } from "@openapi-qraft/react";
    import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
    import { findPetsByStatus } from "./api/services/PetsService";
    const api_pets_findPetsByStatus = qraftReactAPIClient(findPetsByStatus, {
      getQueryKey
    });
    function App() {
      void qraftReactAPIClient(findPetsByStatus, {
        getQueryKey
      }).getQueryKey();
      const utilityClient_pets_findPetsByStatus = qraftReactAPIClient(findPetsByStatus, {
        getQueryKey
      });
      void utilityClient_pets_findPetsByStatus.getQueryKey();
      api_pets_findPetsByStatus.getQueryKey();
    }"
  `);
});
```

This snapshot should prove three things at once:

- the inline `createAPIClient().pets...` call is no longer ignored,
- the named `const utilityClient = createAPIClient()` binding is also eliminated and replaced with its own optimized client declaration in the same function scope when it is only used for utility callbacks,
- the original `createAPIClient` import disappears when it is fully transformed,
- the emitted client call does not need `APIClientContext` when the only callback is `getQueryKey`.

- [x] **Step 2: Run the focused test and confirm it fails before code changes**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "rewrites context-free callbacks from zero-arg createAPIClient calls"
```

Expected: fail with the inline call still left as an untouched `createAPIClient().pets.findPetsByStatus.getQueryKey()` expression and/or with `APIClientContext` still present in the generated call for the named `utilityClient` or the inline call.

### Task 2: Add a shared callback classification helper

**Files:**

- Create: `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [x] **Step 1: Introduce a shared helper for callbacks that do not need runtime context**

Add a small helper module with a single source of truth for the three no-context callbacks:

```ts
const noContextCallbacks: ReadonlySet<string> = new Set([
  'getInfiniteQueryKey',
  'getMutationKey',
  'getQueryKey',
]);

export function callbackNeedsRuntimeContext(callbackName: string) {
  return !noContextCallbacks.has(callbackName);
}
```

Keep the helper boring: a plain `Set<string>` and a boolean predicate are enough. Import it into both `plan.ts` and `mutate.ts` so the named-client and inline-client rewrite paths can ask the same question without duplicating the string list.

- [x] **Step 2: Update the mutator to use the helper when building optimized client declarations**

Change `createOptimizedClientDeclaration(...)` so it only pushes the third `APIClientContext` argument when at least one callback for that generated client needs runtime context. For a client whose callback list contains only `getQueryKey`, `getInfiniteQueryKey`, or `getMutationKey`, emit:

```ts
qraftReactAPIClient(findPetsByStatus, {
  getQueryKey,
});
```

and do not import `APIClientContext` for that client.

- [x] **Step 3: Update named zero-arg client bindings so `const utilityClient = createAPIClient()` is transformed and removed**

Change the named-client plan and mutation paths so a zero-arg `createAPIClient()` binding inside a function is still collected into the transform plan when it is only used with context-free callbacks. The emitted optimized declaration should replace the original `utilityClient` binding in the same function scope, not keep `createAPIClient` alive, and the removal logic should delete the dead `const utilityClient = createAPIClient();` statement after the rewritten binding is inserted.

- [x] **Step 4: Update inline rewrite logic to allow zero-arg factory calls for context-free callbacks**

Change `matchInlineClientCall(...)` in the plan phase so it accepts both of these forms:

```ts
createAPIClient({ queryClient: {} }).pets.getPets.useQuery();
createAPIClient().pets.findPetsByStatus.getQueryKey();
```

Keep the existing one-argument requirement for callbacks that still need runtime context or options. For no-context callbacks, treat a zero-argument factory call as valid and emit the same 2-argument `qraftReactAPIClient(...)` shape as the named-client path.

- [x] **Step 5: Run the focused test and update the snapshot**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "rewrites context-free callbacks from zero-arg createAPIClient calls" -u
```

Expected: the snapshot now shows both the inline call and the named `utilityClient` binding rewritten, with the `utilityClient` declaration staying in the same function scope and the generated client declarations omitting `APIClientContext`.

### Task 3: Validate the broader transform behavior

**Files:**

- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [x] **Step 1: Add one mixed-behavior regression so contextful callbacks keep the old path**

Add a second test that uses a no-context callback and a contextful callback on the same client, for example:

```ts
it('keeps APIClientContext when the same client also uses a contextful callback', async () => {
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

  expect(result?.code).toContain('APIClientContext');
  expect(result?.code).toContain('getQueryKey');
  expect(result?.code).toContain('useQuery');
});
```

This guards against an over-aggressive change that strips context from the whole client as soon as one no-context callback appears.

- [x] **Step 2: Run the targeted test subset**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "rewrites context-free callbacks from zero-arg createAPIClient calls|keeps APIClientContext when the same client also uses a contextful callback"
```

Expected: both tests pass, and the mixed case still imports and passes `APIClientContext` only because `useQuery` is present.

- [x] **Step 3: Run the package test and typecheck sweep**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both commands pass without introducing any new `as` casts beyond what the file already uses, and no preexisting transform tests regress.
