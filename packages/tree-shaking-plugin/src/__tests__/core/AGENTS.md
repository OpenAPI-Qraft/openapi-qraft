# Core Transform Test Guide

This directory contains focused tests for `transformQraftTreeShaking`. Keep tests in the narrowest file that matches the behavior under test, and prefer extending an existing representative case over adding a near-duplicate snapshot.

## Where To Put Tests

- `create-api-client-fn.test.ts`
  - Use for `entrypoints` with `kind: 'clientFactory'` that are context-based, zero-arg, no-context, custom factory names, generated context inference, factory barrels, and operation-level rewrites for generated factory clients.
  - Put context-client callback coverage here when the file only uses `kind: 'clientFactory'` entrypoints.

- `explicit-options.test.ts`
  - Use for `createAPIClient(options)` clients where the argument is a Node.js-like/options object, including inline options, named options, sibling callback scopes, nested scopes, mutation lifecycle callbacks, and `void`/`await` preservation.
  - Name options objects as `apiOptions`, `queryClientOptions`, or similarly explicit names. Reserve `apiContext` for real React context values from `useContext(...)`.

- `precreated-api-client.test.ts`
  - Use for `entrypoints` with `kind: 'precreatedClient'` imported from another module, including named/default exports, options module resolution, partial transforms, invalid config skips, namespace/dynamic import skips, and precreated collision safety.

- `mixed-client-modes.test.ts`
  - Use when one source file combines multiple `entrypoints` client modes, such as context `kind: 'clientFactory'`, explicit-options `kind: 'clientFactory'`, and configured `kind: 'precreatedClient'`.
  - Keep React-like context usage realistic: `createAPIClient(apiContext!)` should usually be inside `useEffect` or another callback when `apiContext` comes from `useContext(...)`.
  - Keep explicit top-level calls only in cases whose title is explicitly about top-level behavior.

- `schema-and-imports.test.ts`
  - Use for `.schema` rewrites, operation import identity, same-name operation aliasing, and import-source separation between generated roots.

- `resolution-and-module-access.test.ts`
  - Use for diagnostics behavior when generated modules cannot be resolved or loaded through module access.
  - Also use for resolver behavior, `moduleAccess.resolve`, `moduleAccess.load`, fixture-relative resolution, legacy 4th-argument resolver compatibility, and empty/mismatched config safety.
  - Direct imports of the raw production transform are allowed here only when testing legacy resolver/module-access entrypoints.

- `unsupported-and-safety.test.ts`
  - Use for unsupported syntax and safety behavior: raw client references, exported clients, computed properties, destructuring aliases, optional chains, and other cases where an unsafe rewrite must not happen.

- `source-maps.test.ts`
  - Use for source-map composition and traceability checks only.

- `harness.test.ts`
  - Use for tests of local test infrastructure in `harness.ts` and `fixtures.ts`, not transform behavior.

## Shared Helpers

- `fixtures.ts` owns generated API source strings, fixture file builders, fixture writes, and module access helpers.
- `harness.ts` owns transform execution setup, fixture-root detection, source-map forwarding, and `createTransformState` re-export.
- Do not copy fixture or resolver helpers into individual test files. Add shared helper capability only when at least two test files need it, or when it prevents a fixture from drifting away from the generated API shape used elsewhere.

## Snapshot And Skip Policy

- Inline snapshots are the primary contract for emitted transform shape. Keep them exact and readable.
- If a new or changed test exposes a real production gap that is not a snapshot-only mismatch and the fix is outside the current task scope, use `it.skip(...)` with a short English comment describing the production gap.
- Skips must remain rare and intentional. Before adding one, verify the fixture is valid and the failing behavior is not caused by test setup.

## Maintenance Rule

Update this file in the same change whenever any of these happen:

- A test file in this directory is added, renamed, deleted, or changes ownership of a behavior category.
- A new client mode, callback class, resolver path, safety category, or source-map category gets a dedicated home.
- Shared helper responsibilities move between `fixtures.ts`, `harness.ts`, or a new helper file.
- A new `it.skip(...)` / `describe.skip(...)` is introduced, removed, or its reason changes.
- A test is moved because this guide pointed to the wrong file.
