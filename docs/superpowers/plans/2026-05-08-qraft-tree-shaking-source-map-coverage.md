# Qraft Tree-Shaking E2E Source Map Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source-map assertions to the `tree-shaking-bundlers` fixture so the external e2e loop verifies original positions while keeping the one-file bundle contract.

**Architecture:** The fixture still emits one primary JS file per bundler and scenario. This plan only adds the `.js.map` sidecar as a validation target and keeps chunk and asset assertions out of scope. `assert-dist.mjs` becomes the source-map checker, `shared.mjs` can host any helper needed to locate map files, and the bundler configs enable sourcemaps without changing the output topology.

**Tech Stack:** Node.js, Yarn 4, Vite, Rollup, Webpack, Rspack, esbuild, and `@jridgewell/trace-mapping`.

**File Structure:**
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`: read bundle maps and verify that representative generated call sites trace back to the expected original source files.
- `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`: bundle and map path helpers.
- `e2e/projects/tree-shaking-bundlers/vite.config.ts`, `rollup.config.mjs`, `webpack.config.mjs`, `rspack.config.mjs`, `scripts/build-esbuild.mjs`: emit sourcemaps while preserving the one-file bundle contract.
- `e2e/projects/tree-shaking-bundlers/package.json`: add `@jridgewell/trace-mapping` for the map assertions.
- `yarn.lock`: record the new dependency resolution if the fixture package gains a direct dev dependency.

---

### Task 1: Make source-map coverage a first-class e2e assertion

**Files:**
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/package.json`
- Modify: `yarn.lock`
- Modify: `e2e/projects/tree-shaking-bundlers/vite.config.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/rollup.config.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/webpack.config.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/rspack.config.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/build-esbuild.mjs`

- [x] **Step 1: Add a failing assertion that reads `.js.map` and traces back to the original source**

Update `assert-dist.mjs` so it loads the source map for `barrel-context-relative` and `barrel-precreated-relative`, then uses `originalPositionFor(new TraceMap(map), { line, column })` to verify that one emitted call site maps back to `src/barrel-context-relative.ts` and `src/barrel-precreated-relative.ts`.

- [x] **Step 2: Enable sourcemaps in every bundler config without changing the output shape**

Turn on source-map emission in Vite, Rollup, Webpack, Rspack, and esbuild. Keep the existing one-entry, one-JS-file layout intact and do not add assertions for chunks or assets.

- [x] **Step 3: Re-run the local e2e workflow to prove the new contract is stable**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: the fixture still produces one JS file per scenario, the `.js.map` files exist, and the new source-map assertions pass.

- [x] **Step 4: Commit the source-map coverage change**

```bash
git add e2e/projects/tree-shaking-bundlers
git commit -m "test: add tree-shaking source-map coverage"
```

### Task 2: Refresh the checked-in baseline if bundle text changes

**Files:**
- Modify: `e2e/projects/tree-shaking-bundlers/dist/**`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [x] **Step 1: Re-run the local e2e workflow from a clean state**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: all current scenarios pass with the source-map assertions in place.

- [x] **Step 2: Update only the checked-in bundle outputs that actually changed**

If the emitted bundle text changes because of sourcemap-enabled builds, refresh the checked-in fixture outputs under `e2e/projects/tree-shaking-bundlers/dist`. Do not introduce any extra checks for chunks or assets.

- [x] **Step 3: Commit the final baseline**

```bash
git add e2e/projects/tree-shaking-bundlers
git commit -m "test: refresh tree-shaking source-map baseline"
```
