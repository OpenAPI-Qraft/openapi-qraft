# Qraft Tree-Shaking CreateAPIClientFn Scope Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `createAPIClientFn` output into scope-local tree-shake-optimal clients so each lexical scope gets only the helper set it actually needs, with utility-only scopes using `qraftAPIClient`, hook-bearing scopes using `qraftReactAPIClient`, and nested callback scopes remaining independently optimizable.

**Architecture:** Callback capability metadata already lives in `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`, so this plan does not redesign that table. The refactor stays inside the transform pipeline: `plan.ts` continues to assign a stable `scopeKey` to each usage, while `mutate.ts` becomes responsible for materializing one optimized client binding per lexical scope instead of deduping sibling scopes by callback shape. `apiClient` mode is out of scope because it already has its own callback-call transformation path. No import-merging pass is added.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest inline snapshots, Yarn 4.

---

### File Structure

- `packages/tree-shaking-plugin/src/lib/transform/plan.ts`: keep scope-aware usage collection stable and expose enough data to split declarations by lexical scope.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: emit one optimized client per scope bucket, choose `qraftAPIClient` vs `qraftReactAPIClient` per bucket, and keep nested callback scopes independent.
- `packages/tree-shaking-plugin/src/core.test.ts`: regression snapshots for sibling-scope splitting, mixed hook/utility scopes, and nested explicit-options clients.

### Task 1: Lock the regression in `core.test.ts`

**Files:**

- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Add the failing snapshot for sibling scopes**

Add a focused regression that uses the `PetUpdateItem` / `PetUpdateForm` example and asserts that the same source operation is emitted as separate bindings in separate lexical scopes:

```ts
it('splits explicit options clients across sibling callback scopes', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

function PetUpdateItem({ petId }: { petId: number }) {
  return api.pets.updatePet.useIsMutating(api.pets.updatePet.getMutationKey());
}

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api.pets.updatePet.useMutation(undefined, {
    mutationKey: api.pets.updatePet.getMutationKey(),
    async onMutate(variables) {
      const getQueryData = () => api.pets.updatePet.getMutationKey();
      const apiClient_pets_getPetById = () => null;
      const apiClient = createAPIClient(apiContext!);

      await apiClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient.pets.getPetById.getQueryData(petParams);

      apiClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      return { prevPet, getQueryData, apiClient_pets_getPetById };
    },
  });
}
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toMatchInlineSnapshot(`
    "import { APIClientContext } from './api';
    import { useContext } from 'react';
    import { qraftAPIClient } from "@openapi-qraft/react";
    import { qraftReactAPIClient } from "@openapi-qraft/react";
    import { useIsMutating } from "@openapi-qraft/react/callbacks/useIsMutating";
    import { updatePet } from "./api/services/PetsService";
    import { getMutationKey } from "@openapi-qraft/react/callbacks/getMutationKey";
    import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
    import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
    import { getPetById } from "./api/services/PetsService";
    import { getQueryData as _getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
    import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
    const api_pets_updatePet1 = qraftReactAPIClient(updatePet, {
      useIsMutating,
      getMutationKey,
    }, APIClientContext);
    const api_pets_updatePet2 = qraftReactAPIClient(updatePet, {
      getMutationKey,
      useMutation
    }, APIClientContext);
    function PetUpdateItem({
      petId
    }: {
      petId: number;
    }) {
      return api_pets_updatePet1.useIsMutating(api_pets_updatePet1.getMutationKey());
    }
    function PetUpdateForm({
      petId
    }: {
      petId: number;
    }) {
      const apiContext = useContext(APIClientContext);
      const petParams = {
        path: {
          petId
        }
      };
      api_pets_updatePet2.useMutation(undefined, {
        mutationKey: api_pets_updatePet2.getMutationKey(),
        async onMutate(variables) {
          const getQueryData = () => api_pets_updatePet2.getMutationKey();
          const apiClient_pets_getPetById = () => null;
          const _apiClient_pets_getPetById = qraftAPIClient(getPetById, {
            cancelQueries,
            getQueryData: _getQueryData,
            setQueryData
          }, apiContext!);
          await _apiClient_pets_getPetById.cancelQueries({
            parameters: petParams
          });
          const prevPet = _apiClient_pets_getPetById.getQueryData(petParams);
          _apiClient_pets_getPetById.setQueryData(petParams, old => ({
            ...old,
            ...variables.body
          }));
          return {
            prevPet,
            getQueryData,
            apiClient_pets_getPetById
          };
        }
      });
    }"
  `);
});
```

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "splits explicit options clients across sibling callback scopes"
```

Expected: fail until the transform emits separate scope-local clients.

- [x] **Step 2: Commit the regression first**

```bash
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test: lock scope split regression for createAPIClientFn"
```

### Task 2: Emit one optimized client per lexical scope in `mutate.ts`

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`

- [x] **Step 1: Add a scope-bucket helper and stop treating callback shape as a dedupe key**

Make the transform group usages by lexical scope first, then materialize a client binding for each scope bucket. The emitted binding name should still stay scope-stable, but the grouping must not collapse sibling scopes just because they reuse the same operation.

```ts
type ScopeUsageBucket = {
  scopeKey: string;
  usages: OperationUsage[];
};

function groupUsagesByScope(usages: OperationUsage[]): ScopeUsageBucket[] {
  const buckets = new Map<string, OperationUsage[]>();

  for (const usage of usages) {
    const next = buckets.get(usage.scopeKey) ?? [];
    next.push(usage);
    buckets.set(usage.scopeKey, next);
  }

  return [...buckets.entries()].map(([scopeKey, scopeUsages]) => ({
    scopeKey,
    usages: scopeUsages,
  }));
}
```

Use that helper in the declaration emitter so each scope bucket gets its own `createOptimizedClientDeclaration(...)` calls, and remove any remaining code path that tries to reuse one declaration because two scopes happen to need the same callback set.

- [x] **Step 2: Keep helper selection local to the emitted bucket**

Inside `createOptimizedClientDeclaration(...)`, derive the runtime helper from the callback names present in that bucket only:

```ts
const runtimeHelperKind = callbacks.some((callback) =>
  callbackNeedsReactRuntime(callback.callbackName)
)
  ? 'react'
  : 'api';

const runtimeImportLocalName =
  usage.client.mode.type === 'precreated' || runtimeHelperKind === 'api'
    ? runtimeLocalNames.api
    : runtimeLocalNames.react;
```

That ensures a utility-only bucket emits `qraftAPIClient(...)` even if another scope in the same file still needs `qraftReactAPIClient(...)`.

- [x] **Step 3: Preserve nested callback scopes as independent buckets**

When the outer callback body creates its own `createAPIClient(...)` binding, nested callback bodies like `onMutate`, `onError`, and `onSuccess` must be evaluated separately, so a nested utility-only client can flip to `qraftAPIClient` without affecting the outer hook-bearing binding.

Use the same `scopeKey` that `plan.ts` already derives from the nearest function parent so nested callback bodies and sibling top-level components do not share a declaration bucket.

- [x] **Step 4: Verify the transform branch with the focused core snapshot**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "splits explicit options clients across sibling callback scopes"
```

Expected: the snapshot now shows separate `api_pets_updatePet` and `_api_pets_updatePet` bindings, and the nested `getPetById` client uses `qraftAPIClient`.

- [x] **Step 5: Commit the transform refactor**

Combined with snapshot refresh in commit `a23a26b5`.

### Task 3: Refresh the remaining unit snapshots and run package checks

**Files:**

- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Refresh the other snapshots that depend on the new split**

Updated snapshots: `optimizes explicit options clients created inside callbacks` and `splits explicit options clients across sibling callback scopes` — replaced `api_pets_updatePet1`/`api_pets_updatePet2` with `api_pets_updatePet`/`_api_pets_updatePet`.

- [x] **Step 2: Run the focused package checks**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Both pass: 52 tests pass, typecheck clean.

- [x] **Step 3: Commit the snapshot refresh**

Committed as `a23a26b5`: `feat: use Babel UID for sibling scope client naming, drop manual index`
