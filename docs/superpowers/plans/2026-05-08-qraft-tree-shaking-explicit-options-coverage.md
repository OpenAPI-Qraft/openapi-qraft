# Qraft Tree-Shaking Explicit Options Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover the explicit `requestFn` and `queryClient` branches in the `tree-shaking-bundlers` fixture so the external e2e loop proves those overloads still tree-shake correctly.

**Architecture:** This plan stays relative-path only so it isolates branch coverage from resolver diversity. Two small entrypoints exercise the generated client in context-style and precreated-style form, each with explicit options calls that must survive bundling. `scenarios.mjs` owns the new matrix rows and `assert-dist.mjs` verifies both the constructor choice and the option-branch tokens.

**Tech Stack:** Node.js, Yarn 4, Vite, Rollup, Webpack, Rspack, esbuild, and the existing tree-shaking fixture scripts.

**File Structure:**
- `e2e/projects/tree-shaking-bundlers/src/context-explicit-options-relative.ts`: new context-style entrypoint that calls the generated client with explicit options.
- `e2e/projects/tree-shaking-bundlers/src/precreated-explicit-options-relative.ts`: new precreated-style entrypoint that calls the precreated client with explicit options.
- `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`: add the new scenarios and their expected tokens.
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`: assert the explicit-option branches and the constructor token choices.

---

### Task 1: Add the new explicit-options entrypoints and make the assertions fail first

**Files:**
- Create: `e2e/projects/tree-shaking-bundlers/src/context-explicit-options-relative.ts`
- Create: `e2e/projects/tree-shaking-bundlers/src/precreated-explicit-options-relative.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [ ] **Step 1: Add a context-style entrypoint that exercises both option branches**

Create `src/context-explicit-options-relative.ts` so it imports `createRelativeAPIClient` and exports both `createRelativeAPIClient({ requestFn: () => Promise.reject(new Error('stub')) })` and `createRelativeAPIClient({ queryClient: {} })`. Keep the file tiny and export the results so bundlers cannot drop either call.

- [ ] **Step 2: Add a precreated-style entrypoint that exercises both option branches**

Create `src/precreated-explicit-options-relative.ts` so it imports `createRelativePrecreatedAPIClient` and exports both `createRelativePrecreatedAPIClient({ requestFn: async () => ({}) })` and `createRelativePrecreatedAPIClient({ queryClient: {} })`.

- [ ] **Step 3: Add scenario rows for the two new entrypoints**

Add `context-explicit-options-relative` and `precreated-explicit-options-relative` to `scenarios.mjs`. Keep them relative-only; alias and extension diversity are already covered elsewhere in the matrix.

- [ ] **Step 4: Tighten the output assertions around constructor choice and explicit-option branches**

Update `assert-dist.mjs` so the context-style scenario must include `qraftReactAPIClient`, `requestFn`, and `queryClient`, while excluding `qraftAPIClient`. The precreated-style scenario must include `qraftAPIClient`, `requestFn`, and `queryClient`, while excluding `qraftReactAPIClient`. Keep the existing "unused context symbol must stay out" check for the precreated case.

- [ ] **Step 5: Run the local e2e workflow and confirm the new matrix is green**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: all bundlers pass for both new scenarios and the bundle text still reflects the intended branch selection.

- [ ] **Step 6: Commit the explicit-options coverage**

```bash
git add e2e/projects/tree-shaking-bundlers
git commit -m "test: cover explicit tree-shaking options branches"
```

### Task 2: Refresh the baseline after the new scenarios land

**Files:**
- Modify: `e2e/projects/tree-shaking-bundlers/dist/**`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`

- [ ] **Step 1: Re-run the local e2e workflow from a clean state**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: the new explicit-options scenarios and the pre-existing matrix all pass together.

- [ ] **Step 2: Refresh only the checked-in outputs that changed**

If the new scenarios change bundle text, update the checked-in fixture outputs under `e2e/projects/tree-shaking-bundlers/dist`. Keep the one-file bundle contract intact.

- [ ] **Step 3: Commit the refreshed baseline**

```bash
git add e2e/projects/tree-shaking-bundlers
git commit -m "test: refresh explicit options e2e baseline"
```
