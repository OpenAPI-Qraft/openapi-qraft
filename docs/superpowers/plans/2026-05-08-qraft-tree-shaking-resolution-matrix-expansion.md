# Qraft Tree-Shaking Resolution Matrix Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the `tree-shaking-bundlers` resolution matrix with one nested-boundary `.mjs` case and one multi-factory case, then refresh the baseline without changing the one-file bundle contract.

**Architecture:** This plan is intentionally narrow. It adds a small nested boundary under `src/extension-boundary/` to probe extension-sensitive resolution, and a separate multi-factory module to keep the tree-shaking plugin honest when more than one generated factory appears in the same bundle. `scenarios.mjs` defines the new matrix rows, `assert-dist.mjs` checks the expected tokens, and the final step refreshes the checked-in `dist` baseline if bundle text changes.

**Tech Stack:** Node.js, Yarn 4, Vite, Rollup, Webpack, Rspack, esbuild, and the existing e2e fixture scripts.

**File Structure:**
- `e2e/projects/tree-shaking-bundlers/src/extension-boundary/package.json`: nested boundary marker for the extension-sensitive scenario.
- `e2e/projects/tree-shaking-bundlers/src/extension-boundary/nested-entry.mjs`: entrypoint that crosses the nested boundary.
- `e2e/projects/tree-shaking-bundlers/src/extension-boundary/bridge.ts`: helper module used by the nested boundary case.
- `e2e/projects/tree-shaking-bundlers/src/extension-boundary/mixed-factories.mjs`: entrypoint that imports multiple generated factories in one module.
- `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`: add the two new scenarios.
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`: assert the narrow token set for each new scenario.

---

### Task 1: Add the new matrix cases and make the assertions fail first

**Files:**
- Create: `e2e/projects/tree-shaking-bundlers/src/extension-boundary/package.json`
- Create: `e2e/projects/tree-shaking-bundlers/src/extension-boundary/nested-entry.mjs`
- Create: `e2e/projects/tree-shaking-bundlers/src/extension-boundary/bridge.ts`
- Create: `e2e/projects/tree-shaking-bundlers/src/extension-boundary/mixed-factories.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [ ] **Step 1: Add the nested-boundary entrypoint**

Create `src/extension-boundary/package.json` with `{ "type": "module" }`, then create `src/extension-boundary/bridge.ts` and `src/extension-boundary/nested-entry.mjs` so the entrypoint crosses that nested boundary before it calls one generated API client.

- [ ] **Step 2: Add the multi-factory entrypoint**

Create `src/extension-boundary/mixed-factories.mjs` so it imports more than one generated factory in the same file and exports the results from both a context-style and a precreated-style call. Keep the example small and deliberate.

- [ ] **Step 3: Add the two scenario rows**

Add `extension-boundary-nested-entry` and `extension-boundary-mixed-factories` to `scenarios.mjs`. Keep the matrix narrow and do not add a `.cjs` case in this plan.

- [ ] **Step 4: Tighten the assertions for both new scenarios**

Update `assert-dist.mjs` so the nested-boundary scenario proves the intended source file and path form survive bundling, and the multi-factory scenario proves the expected factory tokens remain while unrelated service groups still disappear.

- [ ] **Step 5: Run the local e2e workflow and confirm the new cases are green**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: the new matrix cases pass across all bundlers.

- [ ] **Step 6: Commit the matrix expansion**

```bash
git add e2e/projects/tree-shaking-bundlers
git commit -m "test: expand tree-shaking resolution matrix"
```

### Task 2: Refresh the baseline after the new matrix lands

**Files:**
- Modify: `e2e/projects/tree-shaking-bundlers/dist/**`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`

- [ ] **Step 1: Re-run the local e2e workflow from a clean state**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: all existing scenarios plus the two new resolution-matrix cases pass together.

- [ ] **Step 2: Refresh only the checked-in bundle outputs that actually changed**

If the emitted bundle text changes after the matrix expansion, update the checked-in fixture outputs under `e2e/projects/tree-shaking-bundlers/dist`. Do not add chunk or asset assertions.

- [ ] **Step 3: Commit the refreshed baseline**

```bash
git add e2e/projects/tree-shaking-bundlers
git commit -m "test: refresh tree-shaking matrix baseline"
```
