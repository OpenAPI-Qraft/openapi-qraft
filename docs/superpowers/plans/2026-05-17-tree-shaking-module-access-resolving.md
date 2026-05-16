# Tree-Shaking Module Access Resolving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` or `superpowers:executing-plans`.

## Source Documents

- Design spec:
  `docs/superpowers/specs/2026-05-17-tree-shaking-module-access-resolving-design.md`
- Existing architecture spec:
  `docs/superpowers/specs/2026-05-16-tree-shaking-plugin-pipeline-architecture-design.md`
- Current e2e runner memory:
  `cd e2e && corepack yarn e2e:tree-shaking-bundlers-local`

## Goal

Refactor `@openapi-qraft/tree-shaking-plugin` module access so resolving and
source loading have one explicit contract:

```text
resolve: native resolve -> user resolve
load:    native load -> user load -> adapter-local source fallback
```

Adapter-local source fallback is non-public and best-effort. Core transform must
continue to use only `moduleAccess.resolve/load`.

## Task 1: Lock Resolver/Loader Strategy Contract

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/common.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/agnostic.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/rollup-like.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/webpack-like.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/rspack.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/esbuild.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`

**Implementation:**

- Introduce named resolve/load strategies so tests and diagnostics can identify
  `native`, `user`, and `adapter-fallback` stages.
- Keep `QraftModuleAccess` public shape as `resolve/load`; optional trace
  metadata may be added as implementation detail on adapter-created objects.
- Preserve current resolver caching and rejected-load retry behavior.
- Standardize adapter order:
  - agnostic: user resolve/load only;
  - Vite/Rollup: native resolve -> user resolve; user load -> adapter fallback;
  - webpack: native resolve -> user resolve; `loadModule` -> user load ->
    adapter fallback;
  - Rspack: reconstructed native resolve -> user resolve; `loadModule` -> user
    load -> adapter fallback;
  - esbuild: native resolve -> user resolve; user load -> adapter fallback.

**Tests:**

- Native resolve wins over user resolve.
- User resolve runs after native miss/error.
- Webpack/Rspack native load wins over user load.
- User load runs before adapter-local source fallback.
- Rejected source loading is not permanently cached.
- Exact query/hash id is passed to user load.
- Adapter-local file read strips query/hash only locally.

## Task 2: Preserve Exact IDs Through Source Loading

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/state.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts`

**Implementation:**

- Stop normalizing resolved ids before calling `moduleAccess.load`.
- Use exact ids for loading source.
- Use canonical ids only for identity matching, cycle detection, and emitted
  import path/path-composition decisions.
- Avoid passing query/hash ids into `path.dirname(...)`-based import rendering.
- Keep operation import resolution behavior semantically unchanged.

**Tests:**

- Generated metadata loads exact resolved ids containing query/hash.
- Source ownership matching still uses canonical ids.
- Missing source diagnostics still trigger when exact-id load returns null.

## Task 3: Attach Module Access Trace To Diagnostics

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/common.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/state.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts`

**Implementation:**

- Record compact trace entries for resolve/load attempts:
  - kind: `resolve` or `load`;
  - request target;
  - stages with `hit`, `miss`, or `error`;
  - resolved id or short error message when useful.
- Add optional trace data to unresolved diagnostics.
- Format trace only for unresolved diagnostics under existing
  `diagnostics: 'error' | 'warn'`; keep `diagnostics: 'off'` silent.
- Do not print trace for successful transforms by default.

**Tests:**

- `QraftTreeShakeError.reason` contains trace for unavailable generated source.
- Warning output includes stage trace.
- `diagnostics: 'off'` remains silent.

## Task 4: Update Public Documentation

**Files:**

- Modify: `packages/tree-shaking-plugin/README.md`

**Implementation:**

- Document `moduleAccess.resolve` as user fallback, not override.
- Document `moduleAccess.load` as the only public custom/virtual source
  provider.
- State that adapter-local source fallback is non-public, best-effort, and not
  configurable.
- Mention Rspack resolver drift risk and optional `@rspack/resolver`
  expectations without adding new public API.

## Task 5: Add Targeted E2E Coverage

**Files:**

- Modify: `e2e/projects/tree-shaking-bundlers/src/*`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify adapter configs only if required:
  - `e2e/projects/tree-shaking-bundlers/vite.config.ts`
  - `e2e/projects/tree-shaking-bundlers/rollup.config.mjs`
  - `e2e/projects/tree-shaking-bundlers/webpack.config.mjs`
  - `e2e/projects/tree-shaking-bundlers/rspack.config.mjs`
  - `e2e/projects/tree-shaking-bundlers/scripts/build-esbuild.mjs`

**Implementation:**

- Add the smallest number of scenarios needed to cover:
  - query/hash exact id through `moduleAccess.load`;
  - omitted `index` import through alias resolution;
  - alias plus re-export barrel ownership traversal;
  - virtual/load-only generated module;
  - Rspack-specific alias/re-export drift.
- Prefer extending `assert-dist.mjs` semantic token checks over fragile full
  bundle text snapshots.

## Verification

Run after each meaningful milestone:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/resolvers.test.ts
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/generated-metadata.test.ts src/lib/transform/diagnostics.test.ts src/__tests__/core/resolution-and-module-access.test.ts
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
git diff --check
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

## Completion Criteria

- Unit tests lock the adapter contract table.
- Core transform loads source through exact ids.
- Diagnostics explain resolve/load misses.
- README matches the public API contract.
- Multi-bundler e2e passes.
