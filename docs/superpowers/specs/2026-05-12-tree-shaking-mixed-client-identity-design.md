# Tree-Shaking Mixed Client Identity Design

## Purpose

Two skipped mixed-mode regressions in `packages/tree-shaking-plugin/src/core.test.ts` expose the same class of production bug: the transform pipeline does not consistently distinguish operation usages that come from different client sources when `createAPIClientFn` and precreated `apiClient` modes are used in one file.

The fix should make both skipped tests pass:

- `keeps same-operation rewrites separate across all client modes`
- `supports createAPIClientFn and precreated apiClient clients in one file`

## Scope

This is a production transform fix with focused unit snapshot coverage. It should not change public plugin options, e2e fixtures, generated API shape, or callback metadata.

The implementation should update the existing planner/mutator model rather than adding a narrow special case for the skipped tests.

## Root Cause

The transform currently builds several lookup keys from combinations like client local name, service name, operation name, callback name, and scope key. That is not enough in mixed-mode files:

- a context/options client and a precreated client can reference operations with the same export name, such as `getPets`;
- those operations can come from different generated roots, such as `./context-api` and `./precreated-api`;
- aliased factory imports, such as `createAPIClient as createContextAPIClient`, still represent the configured factory and should participate in normal context/options planning.

The pipeline needs a source-aware identity for client usages and operation usages.

## Design

Introduce or derive a stable source-aware key for every client usage. The key should distinguish:

- `createAPIClientFn` context clients by resolved factory file and factory context configuration;
- `createAPIClientFn` explicit-options clients by the same factory identity plus the usage mode;
- precreated `apiClient` clients by resolved precreated client/factory identity and options source.

The exact representation can be a helper function rather than a stored field if that keeps types simpler, but the same identity rule must be reused across planning and mutation.

Use the source-aware key in these places:

- operation grouping keys;
- usage lookup keys;
- local optimized client name allocation;
- schema source keys where the same collision risk applies;
- mutator lookup keys for named call rewriting;
- scope-split detection for non-precreated clients.

This should prevent context `getPets` and precreated `getPets` from sharing an operation import or optimized client name just because their export names match.

## Expected Output Shape

When two generated roots export the same operation name, the output should keep both imports distinct through collision-safe aliases:

```ts
import { getPets } from "./context-api/services/PetsService";
import { getPets as _getPets } from "./precreated-api/services/PetsService";
```

Context clients should still use `qraftReactAPIClient` when a React/runtime-context callback is present:

```ts
const contextApi_pets_getPets = qraftReactAPIClient(getPets, {
  useQuery
}, ContextAPIClientContext);
```

Precreated clients should still use `qraftAPIClient` with the configured options factory:

```ts
const APIClient_pets_getPets = qraftAPIClient(_getPets, {
  getQueryKey
}, createAPIClientOptions());
```

Inline explicit-options calls should keep passing their original options expression:

```ts
qraftAPIClient(findPetsByStatus, {
  invalidateQueries
}, apiContext!).invalidateQueries();
```

## Testing

Unskip and make these tests pass:

- `keeps same-operation rewrites separate across all client modes`
- `supports createAPIClientFn and precreated apiClient clients in one file`

Their existing inline snapshots are intended as the expected post-fix contract. Minor Babel UID naming differences are acceptable only if they preserve the same structure and distinguish the generated roots clearly.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

## Non-Goals

- Do not add e2e coverage in this step.
- Do not redesign the full transform pipeline.
- Do not change public configuration names or generated API contracts.
- Do not add broad callback matrix tests.
- Do not remove unrelated tests.
