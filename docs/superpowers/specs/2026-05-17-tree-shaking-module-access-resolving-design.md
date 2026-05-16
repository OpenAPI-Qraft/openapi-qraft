# Tree-Shaking Module Access Resolving Design

## Purpose

Define the next `moduleAccess.resolve/load` contract for
`@openapi-qraft/tree-shaking-plugin`.

The current implementation works for the covered cases, but the resolving layer
mixes several concepts:

- native bundler resolving;
- user-provided fallback resolving;
- native source loading;
- user-provided source loading;
- adapter-local best-effort source fallback;
- normalized ids used for comparison;
- exact ids needed by virtual or query/hash loaders.

This design intentionally allows breaking changes. The plugin is not public yet,
and the resolver/load layer should become easier to explain, test, and debug
before the feature is published.

## Goals

- Make adapter behavior explicit for Vite, Rollup, webpack, Rspack, esbuild, and
  direct core/unit-test usage.
- Standardize user hook semantics.
- Keep the core transform independent from filesystem access.
- Preserve support for generated clients behind barrels, aliases, omitted
  `index` segments, and explicit `.js` imports that resolve to `.ts` source.
- Make virtual/load-only generated modules possible through public hooks.
- Add diagnostics that show which resolving/loading stages were tried.
- Treat Rspack as a drift-prone adapter and test it accordingly.

## Non-Goals

- Reimplement each bundler's full module graph in the plugin.
- Resolve named export origins from a single `resolve(...)` call.
- Support arbitrary dynamic imports, namespace imports, computed properties, or
  runtime-dependent generated-client shapes.
- Add filesystem reads to transform core.

## Terms

`native resolve`
: The bundler adapter's own module resolution API.

`user resolve`
: A user-provided fallback resolver. It is not an override for successful native
  resolution.

`native load`
: A bundler adapter API that can return transformed or loader-pipeline source
  for a resolved module id.

`user load`
: A user-provided fallback source provider. It can provide source for virtual
  modules or for custom generated-source stores.

`adapter-local source fallback`
: Best-effort adapter implementation detail used only after native/user loading
  misses. It may read ordinary files when an adapter can do so, but it is not a
  public API and is not configurable.

`exact id`
: The id returned by `resolve(...)`, including query/hash suffixes.

`canonical id`
: A normalized id used for identity comparison, import ownership checks, and
  cache keys where query/hash should not distinguish the generated source file.

## Core Contract

The transform core depends only on `QraftModuleAccess`:

```ts
type QraftModuleAccess = {
  resolve(specifier: string, importer: string): Promise<string | null> | string | null;
  load(resolvedId: string): Promise<string | null> | string | null;
};
```

Rules:

- core never reads the filesystem directly;
- core resolves a configured/imported module before loading it;
- core loads source only through `moduleAccess.load(exactResolvedId)`;
- core may derive canonical ids for matching, but must preserve exact ids for
  source loading;
- `resolve(...)` proves only which module id a specifier points to;
- export ownership still requires loading and traversing source;
- if ownership or generated-source loading cannot be proven, the transform must
  skip or report according to `diagnostics`.

## User Hook Semantics

`moduleAccess.resolve` is a fallback.

The adapter must call user resolve only when native resolve is unavailable,
misses, errors, or returns a module that is not inspectable by the plugin.

Successful native resolution wins. This keeps the plugin aligned with the real
bundler graph by default.

`moduleAccess.load` is a fallback source provider.

The adapter must call user load after native loading misses or is unsupported,
and before any adapter-local source fallback.

This is a breaking standardization. The resulting contract is:

```text
resolve: native resolve -> user resolve
load:    native load -> user load -> adapter-local source fallback
```

For adapters without a native arbitrary source-loading API, `native load` is
`unsupported`, so the effective load order becomes:

```text
load: user load -> adapter-local source fallback
```

User hooks are therefore escape hatches, not primary overrides. If a user needs
to replace a real filesystem module with alternate source, they should make the
native stage miss by resolving to a virtual/custom id or use a bundler-level
plugin before the tree-shaking plugin.

Adapter-local source fallback is intentionally not configurable public API. It
may read from the host filesystem for ordinary generated files, but users should
not model it as a feature surface. If it misses or is unavailable, the adapter
continues as a load miss and `diagnostics` decides whether that miss throws,
warns, or stays silent.

## Adapter Contract

| Adapter | Resolve order | Load order | Native resolve | Native load | Adapter-local fallback | Unsupported / weak spots |
| --- | --- | --- | --- | --- | --- | --- |
| Agnostic core/unit tests | user | user | none | none | none | no automatic source access |
| Vite | `this.resolve(..., { skipSelf: true })` -> user | user -> adapter-local source fallback | Rollup-compatible plugin context | none | best-effort ordinary file read | virtual modules need user load unless source is available through the adapter fallback |
| Rollup | `this.resolve(..., { skipSelf: true })` -> user | user -> adapter-local source fallback | Rollup plugin context | none | best-effort ordinary file read | `this.load` is intentionally not part of the current contract until proven safe |
| webpack | `loaderContext.getResolve({ dependencyType: 'esm' })` -> user | `loadModule(id)` -> user -> adapter-local source fallback | webpack resolver | webpack loader pipeline | best-effort input filesystem read | fallback reads raw files and may diverge from loader output |
| Rspack | `@rspack/resolver` built from `compiler.options.resolve` -> user | `loadModule(id)` -> user -> adapter-local source fallback | reconstructed Rspack resolver | Rspack loader pipeline | best-effort input filesystem read | reconstructed resolve can drift from actual Rspack plugin behavior |
| esbuild | `build.resolve(...)` -> user | user -> adapter-local source fallback | esbuild build context | none | best-effort ordinary file read | virtual/onLoad-only modules need user load |

### Vite/Rollup

Vite and Rollup should use native resolving for identity, aliases, extension
resolution, and barrel paths.

They currently do not have a standardized adapter-native arbitrary load stage in
this plugin. Until such a stage is proven against real fixtures, user load is
the only public way to provide virtual generated source. Adapter-local source
fallback remains an implementation detail for ordinary generated files.

### webpack

webpack should prefer `loadModule(id)` for source because it is closest to the
real loader pipeline.

Adapter-local source fallback is allowed only after `loadModule` and user load
miss. It is a weak fallback for plain generated files, not a substitute for
bundler source loading.

### Rspack

Rspack should keep using `loadModule(id)` first for source.

Resolving is the main risk. The adapter currently reconstructs resolution with
`@rspack/resolver` and `compiler.options.resolve`, which may diverge from actual
Rspack behavior when plugins or undocumented defaults participate.

The design accepts this as the current implementation path, but the docs and
tests must label it as a drift-prone adapter. If a more native Rspack resolve
API becomes available, this adapter should move to it.

### esbuild

esbuild has `build.resolve(...)` but no generic `build.load(...)` equivalent for
arbitrary ids. The adapter can read ordinary generated files from disk, but
virtual/onLoad-only generated clients require `moduleAccess.load`.

## Exact Id And Canonical Id

Do not strip query/hash globally before loading source.

The loader boundary receives exact ids:

```text
resolve("./api", "src/App.tsx") -> "/repo/src/api.ts?raw#factory"
load("/repo/src/api.ts?raw#factory")
```

Only adapter-local source fallback may strip query/hash when reading from disk:

```text
fs.readFile(stripQueryAndHash("/repo/src/api.ts?raw#factory"))
```

The transform may compute canonical ids for comparisons:

```text
canonicalId("/repo/src/api.ts?raw#factory") -> "/repo/src/api.ts"
```

This keeps virtual/custom source providers working while preserving stable
identity checks for generated files.

## Generated Source Traversal

Resolving a module id is not enough to prove operation ownership.

The generated-source inspection layer remains responsible for:

- resolving configured factory/client modules;
- loading generated source;
- following `export { ... } from ...` and `export * from ...` chains;
- reading generated services imports;
- resolving the services index;
- resolving operation source paths from generated service exports.

The planner/mutator must not call resolvers directly to guess generated layout.

## Diagnostics Contract

Resolving/loading diagnostics should be structured enough to explain why a
configured transform candidate was skipped or failed.

For each unresolved candidate, diagnostics should include a compact trace:

```text
resolve "./api" from "/repo/src/App.tsx":
  native: miss
  user: miss

load "/repo/src/generated-api/index.ts":
  native: miss
  user: miss
  fs: hit
```

The trace should be attached to the existing diagnostics flow:

- `diagnostics: 'error'` throws with the trace in the reason;
- `diagnostics: 'warn'` prints the trace in the warning;
- `diagnostics: 'off'` suppresses the trace.

The trace should not be printed for successful transforms by default. It exists
to make unresolved configured candidates actionable.

## Test Contract

### Unit Tests

Resolver tests should lock the adapter contract table.

Required cases:

- native resolve wins over user resolve;
- user resolve is called only after native miss/error/external/uninspectable;
- native load wins over user load for webpack/Rspack;
- user load runs before adapter-local source fallback;
- rejected source loading is not permanently cached;
- exact query/hash id is passed to user load;
- adapter-local source fallback strips query/hash locally when it reads files;
- agnostic module access does not read files;
- Rspack `tsConfig` normalization remains covered.

Core/generated-metadata tests should lock transform-facing behavior:

- source inspection loads exact resolved ids;
- canonical ids are used only for matching/ownership;
- missing source produces diagnostics with resolve/load trace;
- operation source resolution does not guess when generated services ownership
  is not proven.

### E2E Tests

The multi-bundler fixture should add targeted scenarios instead of broad
snapshot churn.

Required scenarios:

- query/hash resolved generated client where user load receives the exact id;
- omitted `index` import resolved through bundler aliases;
- alias plus re-export barrel ownership traversal;
- virtual/load-only generated module through `moduleAccess.load`;
- Rspack alias/re-export scenario verified separately because its resolve path
  is most likely to drift.

E2E assertions should focus on emitted bundle semantics:

- optimized operation import exists;
- unused full generated client is absent when fully transformed;
- correct helper (`qraftAPIClient` vs `qraftReactAPIClient`) remains selected;
- source-map assertions continue to map rewritten call sites to original source
  when relevant.

## Migration Shape

This should be implemented as a resolving-layer refactor, not as incidental
patches inside transform planning.

Recommended implementation order:

1. Add trace-capable strategy result types in resolver common code.
2. Standardize adapter order to `native -> user -> adapter-local fallback`
   according to this design.
3. Preserve exact ids through source loading and isolate canonical id helpers.
4. Thread trace data into unresolved diagnostics.
5. Add unit tests for adapter contract.
6. Add targeted e2e scenarios, with Rspack checked explicitly.
7. Update README module-access documentation.

## Acceptance Criteria

- Adapter behavior is documented in one table.
- User hooks have one meaning across all adapter entrypoints.
- Core transform still has no filesystem dependency.
- Exact ids are preserved for user load.
- Adapter-local source fallback is non-public, best-effort, and traceable.
- Rspack drift risk is documented and tested.
- Existing tree-shaking semantic tests pass.
- Multi-bundler e2e passes after targeted fixture additions.

## Self-Review

- The design allows breaking changes and does not preserve current inconsistent
  user-load precedence where it conflicts with the new contract.
- The design does not pretend `resolve(...)` can identify named export origins.
- The design keeps source traversal in generated metadata/source inspection.
- The design avoids adding filesystem behavior to core.
- The design gives virtual modules a supported path through exact-id user load.
