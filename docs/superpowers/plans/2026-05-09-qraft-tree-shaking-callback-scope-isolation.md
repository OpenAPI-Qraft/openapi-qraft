# Qraft Tree-Shaking Callback Scope Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the tree-shaking plugin generates independent optimized client declarations for the same operation when it appears in sibling callback scopes, instead of reusing a declaration across `onMutate`, `onError`, and `onSuccess`.

**Architecture:** The fix stays inside the tree-shaking plugin. `plan.ts` needs to remember which callback/function scope owns each usage, `types.ts` needs to carry that scope identity through the transform plan, and `mutate.ts` needs to group optimized-client declarations by that scope before inserting them. The regression test should prove that two sibling callbacks can each own their own optimized client declaration for the same operation without sharing one declaration across scopes.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest, Yarn 4, inline snapshots.

**File Structure:**
- `packages/tree-shaking-plugin/src/core.test.ts`: regression test for sibling callback scopes using the same operation.
- `packages/tree-shaking-plugin/src/lib/transform/types.ts`: add the scope identity field to `OperationUsage`.
- `packages/tree-shaking-plugin/src/lib/transform/plan.ts`: compute callback-scope identity and key optimized-client names by scope, not only by `client/service/operation`.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: partition declaration insertion by callback scope so sibling callbacks do not share one optimized declaration.

---

### Task 1: Add a regression test that fails on shared declarations across sibling callbacks

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Add a mutation fixture that uses the same operation in sibling callbacks**

Use the current explicit-options callback fixture shape, but keep the important part visible in both branches:

```ts
const api = createAPIClient();

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };
  const onUpdate = () => {};

  api.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const miniQraft = createAPIClient(apiContext!);
      await miniQraft.pets.getPetById.cancelQueries({
        parameters: petParams,
      });

      const prevPet = miniQraft.pets.getPetById.getQueryData(petParams);

      miniQraft.pets.getPetById.setQueryData(petParams, (oldData) => ({
        ...oldData,
        ...variables.body,
      }));

      return { prevPet };
    },
    async onError(_error, _variables, context) {
      if (context?.prevPet) {
        createAPIClient(apiContext!).pets.getPetById.setQueryData(
          petParams,
          context.prevPet
        );
      }
    },
    async onSuccess(updatedPet) {
      const miniQraft = createAPIClient(apiContext!);
      miniQraft.pets.getPetById.setQueryData(petParams, updatedPet);
      await miniQraft.pets.findPetsByStatus.invalidateQueries();
      onUpdate();
    },
  });
}
```

Assert that the emitted code contains two callback-local optimized declarations for `getPetById`, one inside `onMutate` and one inside `onSuccess`, instead of a single declaration reused across both scopes.

- [x] **Step 2: Run the targeted test and confirm the current snapshot is wrong**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "optimizes mutation callbacks across onMutate, onError, and onSuccess"
```

Expected: the test fails with a snapshot mismatch showing the declaration is shared across sibling callbacks or otherwise not emitted in both scopes.

---

### Task 2: Thread callback-scope identity through the transform plan

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`

- [x] **Step 1: Add scope identity to `OperationUsage`**

Extend `OperationUsage` with a field that identifies the owning callback/function scope for the usage, for example a string key derived from the nearest function parent. Keep the field on the plan data, not on the AST, so the mutator can group declarations later without re-walking the source.

- [x] **Step 2: Compute the scope key while scanning call expressions**

In `plan.ts`, derive a stable scope key for each matched usage from the nearest function parent of the call site. Top-level usages should keep a program-level key so existing behavior stays unchanged. Sibling callbacks must get different keys even when they reference the same operation.

- [x] **Step 3: Key optimized-client naming by scope, not just by operation**

Change the `localClientNamesByOperation` bookkeeping so it includes the scope key alongside `client`, `serviceName`, and `operationName`. That keeps same-scope reuse intact while preventing sibling callbacks from collapsing to one shared local client name.

- [x] **Step 4: Re-run the regression test to confirm the planner now separates sibling scopes**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "optimizes mutation callbacks across onMutate, onError, and onSuccess"
```

Expected: the snapshot should move closer to the desired shape, but the mutator may still need a scope-aware insertion pass before the test is fully green.

---

### Task 3: Split optimized-client insertion by callback scope

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [x] **Step 1: Group declaration emission by the new scope key**

Update `insertOptimizedClients` so explicit-options usages are partitioned by callback scope before declarations are created. Keep repeated same-scope references deduped, but never dedupe across sibling callback scopes.

- [x] **Step 2: Insert declarations into the owning callback body**

Make sure each partition is inserted at the statement list that owns that callback scope, not at the first matching declaration from another sibling callback. The important behavior is that `onMutate` and `onSuccess` each own their own optimized client declaration, even when the generated identifier text is identical.

- [x] **Step 3: Keep the existing reuse behavior within one callback**

Do not change same-scope reuse. If the same operation is referenced twice inside one callback body, it should still share one optimized declaration inside that callback.

- [x] **Step 4: Re-run the targeted test until it passes, then refresh the inline snapshot**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "optimizes mutation callbacks across onMutate, onError, and onSuccess" -u
```

Expected: the snapshot now shows separate callback-local declarations instead of one declaration being reused across sibling callbacks.

---

### Task 4: Validate the package and commit the fix

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [x] **Step 1: Run the package typecheck**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: clean typecheck with the new scope key threaded through the plan and mutator.

- [x] **Step 2: Run the full package test file**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: the new regression passes and the existing snapshot coverage stays green.

- [x] **Step 3: Commit the focused fix**

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/lib/transform/types.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts packages/tree-shaking-plugin/src/lib/transform/mutate.ts docs/superpowers/plans/2026-05-09-qraft-tree-shaking-callback-scope-isolation.md
git commit -m "fix: isolate tree-shaking callback scopes"
```
