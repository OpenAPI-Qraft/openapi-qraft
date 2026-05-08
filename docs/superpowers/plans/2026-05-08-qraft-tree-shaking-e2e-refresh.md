# Qraft Tree-Shaking E2E Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the external `tree-shaking-bundlers` e2e contract so the installed package, generated fixture sources, and dist assertions match the refactored tree-shaking pipeline.

**Architecture:** This spec is the final integration checkpoint. It treats `/Users/radist/w/qraft-e2e` as the isolated validation workspace and uses the repo-local publish/update/build flow from `e2e/bin/tree-shaking-bundlers-local-e2e.sh`. Only touch generated fixture outputs or assertion scripts when the emitted contract really changes. Prior specs should already have landed, so this one is about keeping the external fixture honest.

**Tech Stack:** Bash, npm, Yarn 4, Verdaccio-driven package publication, the `tree-shaking-bundlers` fixture, and the existing e2e scripts under `e2e/`.

---

### Task 1: Capture the actual external fixture drift

**Files:**
- Modify if needed: `e2e/projects/tree-shaking-bundlers/src/*.ts`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/src/generated-api/*.ts`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/package.json`

- [ ] **Step 1: Run the local tree-shaking e2e workflow once to observe the current contract**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: the local workspace at `/Users/radist/w/qraft-e2e` is rebuilt from the current repository state and any fixture drift becomes visible in the output or generated diff.

- [ ] **Step 2: Inspect the changed dist and fixture files**

If the output changes, update the checked-in fixture files under `e2e/projects/tree-shaking-bundlers` rather than hand-editing the generated `dist/` tree.

### Task 2: Align the fixture and assertions with the new output contract

**Files:**
- Modify if needed: `e2e/projects/tree-shaking-bundlers/src/*.ts`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/src/generated-api/*.ts`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`

- [ ] **Step 1: Update the scenario inputs or assertion logic only where the emitted output truly changed**

Keep the fixture focused on the tree-shaking contract. If a refactor changes import ordering, helper placement, or inline-client names, pin that in `assert-dist.mjs` and `scenarios.mjs` together so the test failure stays precise.

- [ ] **Step 2: Re-run the local e2e workflow until it is clean**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: the local external workspace publishes, updates, builds, and unpublishes without a contract mismatch.

- [ ] **Step 3: Re-run the package unit suite and typecheck before closing the loop**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: the package remains green after the e2e fixture refresh.

- [ ] **Step 4: Commit the refreshed contract**

```bash
git add e2e/projects/tree-shaking-bundlers packages/tree-shaking-plugin
git commit -m "test: refresh tree-shaking e2e contract"
```

---
