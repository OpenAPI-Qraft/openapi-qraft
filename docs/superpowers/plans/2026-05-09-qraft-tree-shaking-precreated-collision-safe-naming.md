# Qraft Tree-Shaking Precreated Collision-Safe Naming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make precreated optimized client declarations use file-wide unique names so nested callback locals cannot shadow them, while keeping client creation at the current top-level insertion point.

**Architecture:** This is a naming-only phase. The tree-shaking planner already has the right inputs to make program-wide unique names: the full set of file bindings, the program scope, and the reserved import name tracker. Phase 1 switches the optimized-client name allocator from declaration-scope uniqueness to program-wide uniqueness so the emitted top-level binding cannot collide with a callback-local binding such as `APIClient_pets_getPetById` or `_APIClient_pets_getPetById`. No insertion-point logic changes, no hook placement changes, and no runtime factory changes are needed yet. The regression test stays in `core.test.ts` and proves the emitted top-level client name changes while the callback-local shadow bindings remain legal user code.

**Tech Stack:** TypeScript, Babel parser/traverse/types, Vitest, Yarn 4, inline snapshots, Changesets.

**File Structure:**
- `packages/tree-shaking-plugin/src/core.test.ts`: regression test for a precreated mutation callback that shadows the generated optimized client name.
- `packages/tree-shaking-plugin/src/lib/transform/plan.ts`: switch optimized-client naming to program-wide unique generation and remove the now-unneeded scope-local helper if it becomes dead code.
- `.changeset/qraft-tree-shaking-precreated-collision-safe-naming.md`: patch changeset for the published plugin package.

---

### Task 1: Add the regression test that proves the collision exists today

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Replace the broken snapshot test with a collision-focused regression**

Keep the current precreated fixture shape and the same user-visible shadowing pattern, but rename the test so it describes the actual failure:

```ts
it('keeps precreated optimized client names collision-safe inside shadowed callbacks', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'qraft-tree-shaking-')
  );
  await writeFixtureFiles(
    root,
    createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`)
  );
  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { APIClient } from './client';

const petParams = { path: { petId: 1 } };

export function App() {
  APIClient.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const APIClient_pets_getPetById = () => null;
      await APIClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = APIClient.pets.getPetById.getQueryData(petParams);
      APIClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));
      return { prevPet };
    },
    async onSuccess(updatedPet) {
      const _APIClient_pets_getPetById = () => null;
      APIClient.pets.getPetById.setQueryData(petParams, updatedPet);
      await APIClient.pets.findPetsByStatus.invalidateQueries();
    },
  });
}
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

  expect(result?.code).toMatchInlineSnapshot(`
    "import { qraftAPIClient } from "@openapi-qraft/react";
    import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
    import { updatePet } from "./api/services/PetsService";
    import { createAPIClientOptions } from "./client-options";
    import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
    import { getPetById } from "./api/services/PetsService";
    import { getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
    import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
    import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
    import { findPetsByStatus } from "./api/services/PetsService";
    const APIClient_pets_updatePet = qraftAPIClient(updatePet, {
      useMutation
    }, createAPIClientOptions());
    const _APIClient_pets_getPetById2 = qraftAPIClient(getPetById, {
      cancelQueries,
      getQueryData,
      setQueryData
    }, createAPIClientOptions());
    const APIClient_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
      invalidateQueries
    }, createAPIClientOptions());
    const petParams = {
      path: {
        petId: 1
      }
    };
    export function App() {
      APIClient_pets_updatePet.useMutation(undefined, {
        async onMutate(variables) {
          const APIClient_pets_getPetById = () => null;
          await _APIClient_pets_getPetById2.cancelQueries({
            parameters: petParams
          });
          const prevPet = _APIClient_pets_getPetById2.getQueryData(petParams);
          _APIClient_pets_getPetById2.setQueryData(petParams, old => ({
            ...old,
            ...variables.body
          }));
          return {
            prevPet
          };
        },
        async onSuccess(updatedPet) {
          const _APIClient_pets_getPetById = () => null;
          _APIClient_pets_getPetById2.setQueryData(petParams, updatedPet);
          await APIClient_pets_findPetsByStatus.invalidateQueries();
        }
      });
    }"
  `);
}
```

The important assertion is that the emitted top-level optimized client no longer uses `APIClient_pets_getPetById`, because that identifier is already occupied by a callback-local binding in the same file. The callback locals themselves should remain unchanged.

- [x] **Step 2: Run the focused test and confirm the current output is wrong**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "keeps precreated optimized client names collision-safe inside shadowed callbacks"
```

Expected: the test fails before the implementation change because the generated top-level client name still collides with the shadowed callback-local binding.

---

### Task 2: Switch optimized-client naming to program-wide uniqueness

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Replace the scope-local allocator with the existing program-wide allocator**

Change the `localClientName` branch in `createTransformPlan(...)` from:

```ts
const localClientName =
  localClientNamesByOperation.get(operationKey) ??
  createScopedUniqueName(
    match.client.declarationScope,
    composeLocalClientName(
      match.client.name,
      match.serviceName,
      match.operationName
    )
  );
```

to a program-wide allocation that uses the existing `fileBindingNames` and `reservedImportLocalNames` bookkeeping:

```ts
const localClientName =
  localClientNamesByOperation.get(operationKey) ??
  createProgramUniqueName(
    programScope,
    composeLocalClientName(
      match.client.name,
      match.serviceName,
      match.operationName
    ),
    fileBindingNames,
    reservedImportLocalNames
  );
```

Keep the `localClientNamesByOperation` cache so repeated references to the same operation in the same scope still reuse one generated binding. The only change in behavior should be that nested callback locals can no longer shadow the emitted optimized client declaration.

- [x] **Step 2: Remove the now-unused `createScopedUniqueName` helper if nothing else references it**

Delete the helper if `rg -n "createScopedUniqueName\\(" packages/tree-shaking-plugin/src/lib/transform/plan.ts` shows no remaining uses. Do not leave dead naming helpers behind if the file no longer needs them.

- [x] **Step 3: Refresh the inline snapshot for the regression test**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "keeps precreated optimized client names collision-safe inside shadowed callbacks" -u
```

Expected: the inline snapshot updates so the top-level optimized client now uses the file-wide unique name, which in this fixture should be a generated uid like `_APIClient_pets_getPetById2` instead of the shadowed `APIClient_pets_getPetById`.

---

### Task 3: Add the release note and validate the package

**Files:**
- Create: `.changeset/qraft-tree-shaking-precreated-collision-safe-naming.md`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`

- [x] **Step 1: Add a patch changeset for the plugin package**

Create a new changeset file with this content:

```md
---
"@openapi-qraft/tree-shaking-plugin": patch
---

Make precreated optimized client names file-wide unique so shadowed callback locals cannot collide with the emitted top-level binding.
```

- [x] **Step 2: Run the package test file**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: the full tree-shaking test file passes, including the updated regression and the existing snapshots around context-based and explicit-options clients.

- [x] **Step 3: Run the package typecheck**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: clean typecheck with no remaining references to the removed helper and no signature changes outside `plan.ts`.

- [x] **Step 4: Commit the focused fix**

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts .changeset/qraft-tree-shaking-precreated-collision-safe-naming.md
git commit -m "fix: make precreated tree-shaking names collision-safe"
```
