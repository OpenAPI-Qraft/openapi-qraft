# Tree-Shaking Plugin Pipeline Architecture Design

## Purpose

Define the next architecture for `@openapi-qraft/tree-shaking-plugin` before
rewriting the current transform pipeline.

The goal is not to remove existing tree-shaking capabilities. The goal is to
make the plugin core easier to reason about, test, and publish by separating
configuration compatibility, generated-source inspection, usage collection, and
AST mutation into clear layers.

The first implementation should preserve transform semantics covered by the
current unit and e2e tests, while allowing output formatting and snapshot shape
to change when the transformed code remains semantically equivalent.

## Source Of Truth

The type and runtime surface introduced around commit `ce9479fc` is the primary
behavior contract for generated clients and optimized runtime clients.

In particular, the plugin must respect the public behavior of:

- `qraftAPIClient`;
- `qraftReactAPIClient`;
- generated `createAPIClient` overloads for context-backed clients;
- generated Node-style/object-options clients;
- configured pre-created clients.

Tree-shaking snapshots are the contract for transformation semantics, not for
every detail of Babel output shape. If a snapshot contradicts the validated
client type/runtime surface, the transform and snapshot should be corrected; the
type/runtime surface should not be reinterpreted to fit the snapshot.

## Transform Contract

### Eligibility

The plugin may optimize only configured entrypoints.

A generated factory entrypoint can be optimized when the plugin proves all of
these facts:

- the configured factory module resolves through the bundler/module-access
  boundary;
- the generated source is loadable;
- the generated factory statically owns a `services` import;
- the target operation source can be resolved from those owned services;
- the usage in app code is a static member chain.

A generated factory entrypoint must not be optimized when services or a single
operation are supplied only by the caller and the generated factory does not
statically import services. In that case the plugin cannot prove whether the
argument is services, an operation, runtime options, or context.

A pre-created client entrypoint can be optimized when the plugin proves all of
these facts:

- the configured client export resolves from the configured client module;
- that export is created by the configured factory export from the configured
  factory module;
- the configured options factory export/module is known;
- the underlying generated factory statically owns services;
- the target operation source can be resolved from those owned services.

### Client Shapes

The transform should model three semantic client shapes.

`context` clients come from zero-argument generated factory calls whose factory
returns a context-backed `qraftReactAPIClient(..., Context)`.

Rules:

- hook callbacks that rely on React context must preserve context semantics;
- use `qraftReactAPIClient(operation, callbacks, Context)` for context-backed
  hook surfaces;
- context-free key helpers may use `qraftAPIClient(operation, callbacks)` when
  no runtime input is needed.

`explicitOptions` clients come from `createAPIClient(optionsExpression)`.

Rules:

- preserve the original `optionsExpression`;
- use `qraftAPIClient(operation, callbacks, optionsExpression)`;
- do not wrap hooks through React context;
- do not inspect option object keys in the plugin to decide transform
  eligibility.

`precreated` clients come from configured imported client exports.

Rules:

- use `qraftAPIClient(operation, callbacks, optionsFactory())`;
- preserve the configured options factory call as the runtime input;
- do not use `qraftReactAPIClient` for pre-created clients unless a separate
  pre-created-context contract is designed later.

### Callback And Schema Rewrites

Callbacks are optimized per operation and per valid scope.

The transform must:

- import only used callbacks;
- group callbacks for the same operation/scope when doing so preserves
  semantics;
- skip unsupported callback names;
- map `api.service.operation()` to `operationInvokeFn`;
- rewrite `.schema` directly to `operation.schema` without importing runtime
  helpers.

Callback availability must follow the valid client type surface. Generated
context object-options clients expose methods, not hooks. Generated context
zero-argument clients expose the hook/context surface plus context-free helpers
that are valid for that generated client.

### Safety

The transform must preserve original code whenever it cannot prove a rewrite is
safe.

Rules:

- if unsupported references remain, keep the original client binding/import
  alive;
- remove the original client only when all references are safely transformed;
- do not transform exported local client declarations;
- do not transform computed member access;
- do not transform destructured client aliases;
- do not transform namespace or dynamic imports of configured clients;
- do not transform optional chains until short-circuit semantics are explicitly
  designed;
- keep generated import/client names collision-safe in program and local scopes.

## Diagnostics

Replace the current `debug`-style behavior with an explicit diagnostics policy:

```ts
type DiagnosticsLevel = 'error' | 'warn' | 'off';
```

Add this option to the public config:

```ts
type QraftTreeShakeOptions = {
  diagnostics?: DiagnosticsLevel;
};
```

Default: `diagnostics: 'error'`.

Diagnostics apply only to unresolved transform candidates. Ordinary skips remain
silent.

An ordinary skip is a file or syntax shape that does not provide a transform
candidate, for example:

- no configured entrypoints;
- source gate has no relevant signals;
- no matching configured imports;
- unsupported syntax such as computed access or optional chains.

An unresolved transform candidate is a case where the app source and config
indicate that a transform should be possible, but the plugin cannot complete the
proof, for example:

- configured entrypoint module cannot be resolved;
- generated source cannot be loaded;
- generated services import is missing;
- generated services index cannot be resolved;
- pre-created client export is missing;
- pre-created client factory binding does not match config;
- operation source cannot be resolved;
- required runtime context cannot be resolved.

Behavior:

- `error`: throw a `QraftTreeShakeError` for unresolved transform candidates;
- `warn`: emit a warning with a stable reason and skip the candidate;
- `off`: skip the candidate silently.

Do not add automatic dev/build detection in this design. The plugin core should
not infer policy from `process.env.NODE_ENV` or bundler-specific mode unless a
later design proves a reliable cross-bundler contract.

## Pipeline Architecture

The target pipeline is:

```text
QraftTreeShakeOptions
-> normalizeEntrypoints()
-> shouldInspectSource()
-> parse source
-> inspectGeneratedEntrypoints()
-> collectTransformUsages()
-> buildSemanticRewritePlan()
-> applyRewritePlan()
```

### `normalizeEntrypoints`

This is the only layer that understands the external config shape.

It converts current and future public options into a single internal
`ClientEntrypoint[]` model. Existing capabilities remain supported:

- generated factory config;
- pre-created client export config;
- options factory config for pre-created clients;
- context/contextModule config;
- app-facing module specifiers.

Downstream layers should not read `createAPIClientFn` or `apiClient` directly.
They should consume normalized entrypoints.

### `shouldInspectSource`

This is a lightweight pre-parse gate. It is not a parser replacement.

Allowed signals:

- id passes include/exclude and is not in `node_modules`;
- at least one entrypoint is configured;
- source contains a configured local/export/module name or module specifier;
- source contains static member-chain hints such as `.schema`, `.useQuery`, or
  `.getQueryKey`.

Reliability rule: if the gate is uncertain, parse. The gate should reduce
obvious noise, not decide transform correctness.

### `inspectGeneratedEntrypoints`

This is the only layer that resolves and reads generated source.

It owns:

- resolving configured modules through `moduleAccess`;
- loading source through `moduleAccess`;
- following generated factory re-export chains;
- detecting generated services ownership;
- reading service import paths;
- resolving context import information when configured or reliably detected;
- validating pre-created client exports;
- validating pre-created factory binding;
- preserving configured options factory information.

It returns generated metadata or a structured skip/diagnostic reason. It does
not mutate app source.

### `collectTransformUsages`

This layer works only with parsed app source plus proven generated metadata.

It owns:

- finding generated factory local clients;
- finding pre-created client imports;
- finding inline generated factory calls;
- finding `.schema` access;
- finding supported callback calls;
- deciding insertion scope and runtime input from normalized metadata.

It must not read files, call resolvers, or guess generated layout.

### `buildSemanticRewritePlan` And `applyRewritePlan`

The design target is a semantic rewrite plan with explicit edits:

- imports to add;
- optimized clients to declare;
- call sites to rewrite;
- schema accesses to rewrite;
- original declarations/imports to remove when fully transformed.

The first implementation may keep parts of the current mutator if needed, but
the data passed into it should already use normalized runtime input rather than
historical `context` / `options` / `precreated` branching.

## Internal Data Model

The first implementation should introduce a normalized model close to this:

```ts
type ClientEntrypoint =
  | GeneratedFactoryEntrypoint
  | PrecreatedClientEntrypoint;

type GeneratedFactoryEntrypoint = {
  kind: 'generatedFactory';
  factory: ImportTarget;
  runtimeContext: RuntimeContextConfig | null;
};

type PrecreatedClientEntrypoint = {
  kind: 'precreatedClient';
  client: ImportTarget;
  factory: ImportTarget;
  optionsFactory: ImportTarget;
};

type ImportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

type RuntimeContextConfig = {
  exportName: string;
  moduleSpecifier: string | null;
};
```

Generated-source inspection should produce metadata close to this:

```ts
type GeneratedClientMetadata = {
  entrypoint: ClientEntrypoint;
  factoryFile: string;
  servicesDir: string;
  serviceImportPaths: Record<string, string>;
  runtimeContext: RuntimeContextConfig | null;
};
```

Usage collection should produce semantic usage data close to this:

```ts
type RuntimeInput =
  | { kind: 'none' }
  | { kind: 'context'; context: RuntimeContextConfig }
  | { kind: 'optionsExpression'; expression: t.Expression }
  | { kind: 'optionsFactoryCall'; target: ImportTarget };
```

The exact names may change during implementation, but these ownership boundaries
should remain.

## Debt To Delete

The first implementation should delete debt in config/model and
resolver/source-inspection layers.

Targeted deletions:

- remove `hasExplicitContext` as standalone `ClientBinding` state; context
  should come from normalized runtime context metadata;
- replace hand-built mode-specific identity keys with normalized entrypoint keys;
- stop passing broad `QraftTreeShakeOptions` into deep transform layers except
  for diagnostics and module-access setup;
- remove duplicated checks that rediscover whether a client is generated,
  explicit-options, or pre-created after normalization;
- remove hidden best-effort fallback paths in generated-source inspection;
- reduce repeated generated-info reads within one transform call.

Do not delete these capabilities:

- generated factory configuration;
- pre-created client configuration;
- options factory configuration;
- context/contextModule configuration;
- strict skip for factories without static service ownership.

## Testing Strategy

### Transform Contract Tests

The focused `packages/tree-shaking-plugin/src/__tests__/core/*` tests remain the
main transform semantics contract.

They should assert:

- direct operation imports;
- correct runtime helper selection;
- correct context/options/optionsFactory propagation;
- safe local-scope insertion;
- safe client cleanup;
- schema rewrites without runtime helpers;
- collision-safe names;
- strict skips for unresolved ownership.

Snapshot text can change when semantics are preserved, but changes must be
reviewed against the transform contract above.

### Normalization Tests

Add focused tests for config normalization:

- current `createAPIClientFn` config normalizes to `generatedFactory`;
- current `apiClient` config normalizes to `precreatedClient`;
- `context` and `contextModule` normalize into `RuntimeContextConfig`;
- options factory module fallback is normalized once at the boundary.

### Generated Metadata Tests

Add or reorganize tests for generated-source inspection:

- direct generated factory with static services import;
- generated factory barrel re-export;
- re-export cycle skip;
- source unavailable diagnostic;
- `services: none` skip;
- context import detection;
- explicit contextModule resolution from the app-facing importer;
- pre-created client export validation;
- pre-created factory mismatch skip;
- options factory target preservation.

### Diagnostics Tests

Add tests for `diagnostics`:

- ordinary no-signal skip stays silent;
- unresolved transform candidate throws by default;
- `diagnostics: 'warn'` warns and skips;
- `diagnostics: 'off'` skips silently;
- thrown/warned reasons include stable code and enough entrypoint context for
  debugging.

### E2E Tests

The `tree-shaking-bundlers` e2e fixture remains the final cross-bundler guard.
It should verify emitted bundle tokens and source-map behavior, not internal
architecture.

## Implementation Phases

1. Define transform contract and diagnostics types in tests.
2. Add `normalizeEntrypoints()` and route existing config through it.
3. Extract generated-source inspection behind a strict metadata boundary.
4. Update usage collection to consume normalized entrypoints and metadata.
5. Reduce mutator branching by passing normalized runtime input.
6. Introduce a fuller semantic rewrite plan in a follow-up phase if the first
   implementation becomes too large.

## Out Of Scope

- A generated manifest file.
- Automatic dev/build diagnostics detection.
- Optional-chain transform support.
- Computed-property transform support.
- Runtime validation of options factory contents.
- Rewriting public generated-client type surfaces.
