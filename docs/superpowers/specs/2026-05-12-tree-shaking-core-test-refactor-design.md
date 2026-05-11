# Tree-Shaking Core Test Refactor Design

## Goal

Refactor `packages/tree-shaking-plugin/src/core.test.ts` from one large catch-all file into a readable test suite with reusable fixtures, explicit behavioral domains, and a small coverage matrix for the tree-shaking transform.

The refactor should preserve the existing exact snapshot contract while making it easier to add missing regression coverage for client modes, callback classes, mixed-source identity, context detection, and unsupported syntax.

## Current Problems

`core.test.ts` is now large enough that coverage gaps are hard to see. It mixes resolver tests, source-map tests, context-client snapshots, explicit-options snapshots, precreated-client snapshots, mixed-mode regressions, schema rewrites, collision tests, and fixture helpers in one file.

Recent mixed-client fixes also showed two specific weaknesses:

- Context inference and operation import identity can regress without a narrow test group around generated-source identity.
- Variable names inside fixtures can blur client-mode semantics, for example using a context-like name for an explicit options object.

The file has strong inline snapshots and realistic source snippets. The refactor should keep that strength.

## Target File Structure

Create real Vitest test files under a core-focused test folder, without a central aggregator file:

```text
packages/tree-shaking-plugin/src/__tests__/
  core/
    harness.ts
    fixtures.ts
    assertions.ts
    create-api-client-fn.test.ts
    explicit-options.test.ts
    precreated-api-client.test.ts
    mixed-client-modes.test.ts
    schema-and-imports.test.ts
    resolution-and-module-access.test.ts
    unsupported-and-safety.test.ts
    source-maps.test.ts
```

The existing `core.test.ts` should be removed after its tests have moved. If the project or Vitest setup requires keeping the path temporarily, it may be left only during migration, not as a long-term aggregator.

## Shared Test Utilities

`harness.ts` should own transform execution helpers:

- `transformQraftTreeShaking(...)`
- `createTransformPlan(...)` convenience setup where needed
- source-map transform wiring
- fixture-root/module-access wiring

`fixtures.ts` should own reusable generated API file builders:

- context-based generated API fixtures
- precreated generated API fixtures
- service files for `pets` and `stores`
- client options modules
- filesystem fixture writer
- fixture module resolver/load helper

`assertions.ts` should contain only small assertion helpers that keep tests clearer. It should not hide the emitted transform shape. Inline snapshots remain in the test files.

## Behavioral Test Files

`create-api-client-fn.test.ts` covers zero-arg context-based clients, custom factory names, factory barrels, no-context factories, exported-client skip behavior, and generated context detection.

`explicit-options.test.ts` covers named and inline `createAPIClient(options)` clients, sibling scopes, nested scopes, prefix preservation (`void` / `await`), mutation callback flows, and options naming cleanup.

`precreated-api-client.test.ts` covers configured `apiClient` imports, default exports, separate/same options modules, partial transforms, precreated collision safety, invalid config, namespace/dynamic import skips, and operation invoke behavior.

`mixed-client-modes.test.ts` covers files containing more than one client mode:

- context-based `createAPIClientFn` plus explicit-options `createAPIClientFn`
- context-based `createAPIClientFn` plus precreated `apiClient`
- explicit-options `createAPIClientFn` plus precreated `apiClient`
- all three modes in one file
- same operation name across different generated roots
- same local client names in different scopes

`schema-and-imports.test.ts` covers `.schema` rewrites, import aliasing, operation import dedupe, same operation names across generated roots, and helper import ordering.

`resolution-and-module-access.test.ts` covers module access precedence, legacy resolver compatibility, resolver fallback, no filesystem fallback when `moduleAccess.load` returns `null`, same-named wrong-module imports, and unresolved specifiers.

`unsupported-and-safety.test.ts` covers inputs that should not transform or should only partially transform:

- unsupported remaining references
- computed properties
- optional chaining behavior
- destructuring aliases
- namespace client access
- dynamic import shapes
- exported clients

`source-maps.test.ts` covers incoming source-map traceability and any future source-map-specific transform regressions.

## Coverage Matrix

Do not build a full Cartesian product. Add representative coverage for these dimensions:

- Client mode: context, explicit options, precreated, mixed modes.
- Call shape: named client, inline client, top-level call, React-like component call, nested callback call.
- Callback class: key-only, query-client data read/write, fetch/prefetch/ensure, infinite, suspense, mutation, global query-client state.
- Source identity: same operation from different generated roots, same local operation export name, same local client variable name in separate scopes.
- Syntax safety: static member access, optional member access, computed member access, destructuring, namespace access.

The existing tests already heavily cover `useQuery`, `getQueryKey`, `invalidateQueries`, `setQueryData`, `getQueryData`, `cancelQueries`, and `useMutation`. New coverage should prioritize callbacks with no current direct references:

- `ensureQueryData`
- `fetchQuery`
- `prefetchQuery`
- `getQueryState`
- `getInfiniteQueryKey`
- `getInfiniteQueryData`
- `prefetchInfiniteQuery`
- `useSuspenseQuery`
- `useInfiniteQuery`
- `useQueries`
- `useMutationState`
- `isFetching`
- `isMutating`

Each new callback-class test should use a realistic source snippet, not a synthetic list of method calls with no user context.

## Realistic Fixture Rules

React-like context usage should look like real React code:

```ts
const apiContext = useContext(APIClientContext);

useEffect(() => {
  void createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
}, [apiContext]);
```

Mutation tests should use canonical mutation callback structure where it clarifies behavior:

- `onMutate`
- `onError`
- `onSuccess`

Top-level calls are still valid and should remain when the test intentionally covers top-level transform behavior.

## Naming Cleanup Rules

Clean up fixture variable names while moving tests:

- Values passed to `createAPIClient(...)` as options should be named `apiOptions`, `clientOptions`, `queryClientOptions`, or `nodeClientOptions`, not `apiContext`.
- Values returned by `useContext(...)` may be named `apiContext`.
- Zero-arg context clients should use names like `contextApi` or `reactApi`.
- Explicit-options clients should use names like `optionsApi` or `nodeApi`.
- Precreated imports should use `APIClient` when testing configured public names, or `precreatedApi` when the exact import name is not the point.
- Mutation fixtures should prefer semantic names such as `petParams`, `previousPet`, and `rollbackContext`.

When a strange name is part of a collision or aliasing regression, keep it and add a short English intent comment in the fixture source.

## Migration Strategy

Use a two-phase implementation.

Phase 1 is a mechanical split:

1. Add shared helpers.
2. Move one behavioral group at a time.
3. Keep snapshots semantically identical except for import ordering or naming changes intentionally caused by fixture cleanup.
4. Keep package tests green after each large move.
5. Remove `core.test.ts` after the last group moves.

Phase 2 is a coverage pass:

1. Add representative callback-class regressions.
2. Add mixed-mode regressions for callback classes beyond `useQuery`, `getQueryKey`, and `invalidateQueries`.
3. Add unsupported syntax and safety regressions.
4. Add context-detection variants for inferred third argument, custom context name, explicit `contextModule`, and aliased context import.
5. Refresh inline snapshots only when emitted output is semantically correct.

## Failure Policy

If a moved existing test fails, treat it as a migration bug and fix the test move or helper extraction.

If a new test reveals a local production gap, fix production in the same implementation plan when the fix is narrow.

If a new test reveals a broader production gap outside the refactor scope, do not hide it silently. Either keep it as an active failing regression if the team wants to fix it immediately, or record a separate follow-up design/plan with an explicit reason.

## Verification

The main verification commands are:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

During migration, targeted Vitest commands for individual new test files are expected before running the full package test.

## Non-Goals

- Do not change public plugin options.
- Do not change e2e fixtures as part of this core-test refactor.
- Do not replace inline snapshots with hidden helper assertions.
- Do not build a large test DSL that makes failures harder to understand.
