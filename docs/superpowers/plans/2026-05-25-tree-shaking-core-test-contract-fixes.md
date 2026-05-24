# Tree-Shaking Core Test Contract Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clarify reviewed tree-shaking core snapshots and align test fixtures with the generated client surfaces they claim to model.

**Architecture:** Do not change production transform behavior for the one-argument object-literal case. Keep that test as synthetic transform-shape coverage, make its intent explicit, and limit functional test fixture changes to precreated direct invocation and React context value clarity.

**Tech Stack:** TypeScript, Babel AST traversal, Vitest inline snapshots, `@openapi-qraft/tree-shaking-plugin`.

---

## File Structure

- Modify `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
  - Keep the existing `createAPIClient({ useQuery })` positive snapshot.
  - Rename or annotate the test so future reviewers do not treat it as generated-client runtime-validity evidence.

- Modify `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`
  - Make the shared precreated fixture include `operationInvokeFn` when direct invocation is part of the fixture surface.

- Modify `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
  - Refresh only snapshots affected by the precreated fixture fidelity change.

- Modify `packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts`
  - Replace `APIClientContext`-as-options source code with `useContext(APIClientContext)`.

- Review `packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md`
  - Leave unchanged when fixture ownership guidance remains accurate after the shared fixture change.

## Task 1: Clarify Synthetic One-Arg Object-Literal Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`

- [ ] **Step 1: Rename and annotate the synthetic snapshot test**

Find the test currently named:

```ts
it('optimizes clients with a single object literal even without known option keys', async () => {
```

Replace the test heading with this comment and name:

```ts
  // Synthetic transform-shape coverage: this does not assert that `{ useQuery }`
  // is a valid generated-client runtime options object. It verifies that a
  // single expression argument keeps callback import/alias wiring stable.
  it('optimizes synthetic one-arg object literals without validating options shape', async () => {
```

Do not change the source snippet or inline snapshot in this test.

- [ ] **Step 2: Run the focused renamed test**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts -t "optimizes synthetic one-arg object literals without validating options shape"
```

Expected: PASS with the existing snapshot output unchanged.

- [ ] **Step 3: Commit Task 1**

```bash
git add packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts
git commit -m "test: clarify synthetic one-arg client snapshot"
```

## Task 2: Precreated Fixture Direct Invoke Fidelity

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`

- [ ] **Step 1: Update the shared precreated fixture**

Change `PRECREATED_API_INDEX_TS` in `fixtures.ts` from a `useQuery`-only callback set to a callback set that includes `operationInvokeFn`:

```ts
export const PRECREATED_API_INDEX_TS = `
import { qraftAPIClient } from '@openapi-qraft/react';
import {
  operationInvokeFn,
  useQuery,
} from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { operationInvokeFn, useQuery } as const;

export function createAPIClient(options?: {
  baseUrl: string;
  queryClient: unknown;
  requestFn: (...args: unknown[]) => Promise<unknown>;
}) {
  return qraftAPIClient(services, defaultCallbacks, options);
}
`;
```

- [ ] **Step 2: Update the default precreated options fixture**

Change `DEFAULT_PRECREATED_CLIENT_OPTIONS_TS` to model a request-capable client:

```ts
export const DEFAULT_PRECREATED_CLIENT_OPTIONS_TS = `
export const createAPIClientOptions = () => ({
  baseUrl: 'http://localhost',
  queryClient: {},
  requestFn: async () => ({ data: undefined, error: undefined })
});
`;
```

- [ ] **Step 3: Run the focused precreated test**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/precreated-api-client.test.ts
```

Expected: PASS or inline snapshot mismatch caused only by changed fixture import text. When Vitest reports a snapshot mismatch, inspect the diff. When it is only emitted fixture-driven output, run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/precreated-api-client.test.ts -u
```

Expected after update: PASS.

- [ ] **Step 4: Review affected snapshots**

Inspect:

```bash
git diff -- packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts
```

Expected: fixture now models `operationInvokeFn`; snapshots still use `qraftAPIClient` for precreated mode; no unrelated snapshot churn.

- [ ] **Step 5: Commit Task 2**

```bash
git add packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts
git commit -m "test: align precreated direct invoke fixture"
```

## Task 3: Explicit Options React Fixture Clarity

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts`

- [ ] **Step 1: Replace the context object with a context value**

In the `preserves void and await prefixes for named and inline client calls` source fixture, change:

```ts
import { createAPIClient, APIClientContext } from './api';

async function run() {
  const api = createAPIClient();
  const apiOptions = APIClientContext;
```

to:

```ts
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

async function run() {
  const api = createAPIClient();
  const apiOptions = useContext(APIClientContext);
```

- [ ] **Step 2: Update the expected inline snapshot**

The snapshot should preserve the new import and local context value:

```ts
"import { APIClientContext } from './api';
import { useContext } from 'react';
import { qraftAPIClient } from \"@openapi-qraft/react\";
import { invalidateQueries } from \"@openapi-qraft/react/callbacks/invalidateQueries\";
import { findPetsByStatus } from \"./api/services/PetsService\";
async function run() {
  const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
    invalidateQueries
  }, APIClientContext);
  const apiOptions = useContext(APIClientContext);
  void api_pets_findPetsByStatus.invalidateQueries();
  await api_pets_findPetsByStatus.invalidateQueries();
  void qraftAPIClient(findPetsByStatus, {
    invalidateQueries
  }, apiOptions!).invalidateQueries();
  await qraftAPIClient(findPetsByStatus, {
    invalidateQueries
  }, apiOptions!).invalidateQueries();
}"
```

When formatting differs, refresh the inline snapshot from actual Vitest output.

- [ ] **Step 3: Run the focused explicit-options test**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/explicit-options.test.ts -t "preserves void and await prefixes"
```

Expected: PASS.

- [ ] **Step 4: Commit Task 3**

```bash
git add packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts
git commit -m "test: use React context value in explicit options fixture"
```

## Task 4: Guide Check And Full Verification

**Files:**
- Review: `packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md`
- Verify: `packages/tree-shaking-plugin/src/__tests__/core/*.test.ts`

- [ ] **Step 1: Check core test guide ownership wording**

Run:

```bash
sed -n '1,140p' packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md
```

Expected: the guide still accurately says `fixtures.ts` owns generated API source strings and fixture builders. When the fixture ownership text remains accurate, do not edit the guide.

- [ ] **Step 2: Run focused core tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/explicit-options.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run full package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
```

Expected: all package tests pass.

- [ ] **Step 4: Run typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: exit 0.

- [ ] **Step 5: Run lint**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
```

Expected: exit 0 with no warnings.

- [ ] **Step 6: Check formatting whitespace**

Run:

```bash
git diff --check
```

Expected: no output and exit 0.

- [ ] **Step 7: Commit verification/doc-only guide changes**

When `AGENTS.md` changed, commit it separately:

```bash
git add packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md
git commit -m "docs: update tree-shaking core test guide"
```

When `AGENTS.md` did not change, do not create an empty commit.
