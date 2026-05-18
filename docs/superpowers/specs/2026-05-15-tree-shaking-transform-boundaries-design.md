# Tree-Shaking Transform Boundaries Design

## Purpose

Define the allowed and forbidden transformation boundaries for
`@openapi-qraft/tree-shaking-plugin` before auditing the existing test matrix or
changing transform behavior.

The plugin is not a type checker. It should only rewrite calls when it can
statically prove the generated factory owns the operation source and can safely
carry runtime options or context into the optimized operation client.

## Shared Boundary

The transform may optimize only when the generated factory module contains a
static `services` import that the plugin can resolve.

If the factory was generated with `services: none`, services or a single
operation are passed by the caller as the first argument. The plugin must not
guess whether that argument is a services object, an operation, runtime options,
or a context value. These factories are out of scope for tree-shaking.

Callback generation mode does not define transform eligibility. Factories with
`callbacks: all`, `callbacks: none`, or a specific callback list can be
optimized as long as the factory statically owns `services`.

## `createAPIClientFn` Contract

For configured `createAPIClientFn` factories:

- `services: all` factories can be optimized.
- `services: none` factories must not be optimized.
- `callbacks: all`, `callbacks: none`, and specific callback lists can all be
  optimized when services are statically imported.
- `createAPIClient(runtimeOptions)` can be optimized only when the factory owns
  services; the runtime expression is preserved as the optimized client's third
  argument.
- `createAPIClient(services)` and `createAPIClient(operation)` are not
  optimized when the factory does not import services.

Runtime helper selection:

- If the tree-shaking config for the factory explicitly provides `context`,
  hook callbacks use `qraftReactAPIClient`.
- If no context is configured, hook callbacks use `qraftAPIClient`.
- Non-hook callbacks always use `qraftAPIClient`.
- Passing runtime options does not by itself select `qraftReactAPIClient`.

Examples:

```ts
// Context configured.
createAPIClient().pets.getPets.useQuery();
// -> qraftReactAPIClient(getPets, { useQuery }, APIClientContext)

// No context configured.
createAPIClient(options).pets.getPets.useQuery();
// -> qraftAPIClient(getPets, { useQuery }, options)

createAPIClient(options).pets.getPets.getQueryData();
// -> qraftAPIClient(getPets, { getQueryData }, options)
```

## `apiClient` Contract

For configured pre-created `apiClient` clients:

- The referenced generated factory must statically import services.
- If the factory was generated with `services: none`, the pre-created client is
  not optimized.
- The configured options factory is treated as the runtime options source.
  The plugin does not inspect whether it contains `queryClient`, `requestFn`, or
  context.
- All `apiClient` transformations use `qraftAPIClient`.
- `qraftReactAPIClient` is never used in `apiClient` mode.

Example:

```ts
APIClient.pets.getPets.useQuery();
// -> qraftAPIClient(getPets, { useQuery }, createAPIClientOptions()).useQuery()
```

## Test Matrix

The test matrix should cover generated factory and client modes, not every
callback. Representative callbacks are only used to distinguish helper classes:
hook, non-hook, context-free helper, operation invoke, and schema access.

### `create-api-client-fn.test.ts`

- `services: all` with configured context and a hook callback emits
  `qraftReactAPIClient(..., APIClientContext)`.
- `services: all` with no configured context, runtime options, and a hook
  callback emits `qraftAPIClient(..., runtimeOptions)`.
- `services: all` with runtime options and a non-hook callback emits
  `qraftAPIClient(..., runtimeOptions)`.
- `services: none` with an explicit services argument is skipped.
- `services: none` with an explicit operation argument is skipped.
- Callback generation mode does not get an exhaustive callback matrix; it needs
  representative coverage that `callbacks: all`, `callbacks: none`, and specific
  callback lists do not block transforms when services are imported.

### `precreated-api-client.test.ts`

- `apiClient` with a `services: all` factory and hook callback emits
  `qraftAPIClient`.
- `apiClient` with a `services: all` factory and non-hook callback emits
  `qraftAPIClient`.
- `apiClient` with a `services: none` factory is skipped.
- The emitted optimized client calls the configured options factory and does not
  inspect its contents.

### `mixed-client-modes.test.ts`

Mixed files should prove helper selection remains isolated:

- context `createAPIClientFn` hook usage emits `qraftReactAPIClient`;
- explicit-options `createAPIClientFn` hook usage emits `qraftAPIClient`;
- pre-created `apiClient` hook usage emits `qraftAPIClient`.

### `schema-and-imports.test.ts`

- `.schema` rewrites remain operation-import rewrites and do not depend on
  callback/runtime helper selection.
- `services: none` factories are skipped for schema access when operation source
  cannot be resolved from factory-owned services.

## Out Of Scope

- Parameter shape and const-parameter type coverage.
- Exhaustive callback-by-callback transform snapshots.
- Illegal type usage assertions from `*.types-test.ts` unless they define a
  transform boundary.
- Runtime validation of options factory contents.
