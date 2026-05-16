# Tree-Shaking Session 4 Debt Docs And Final Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete obsolete tree-shaking plugin debt left after Sessions 1-3, update public docs, and run final verification.

**Architecture:** This session is intentionally cleanup-oriented. It should remove compatibility branches only when the normalized model already handles the behavior, update README/test routing docs, and avoid changing transform semantics except for confirmed debt deletion.

**Tech Stack:** TypeScript, Vitest, ESLint, README docs, multi-bundler e2e fixture.

---

## Source Documents

- Master plan: `docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md`
- Design spec: `docs/superpowers/specs/2026-05-16-tree-shaking-plugin-pipeline-architecture-design.md`
- Session 3 prerequisite: `docs/superpowers/plans/2026-05-16-tree-shaking-session-3-planner-mutator-normalized-model.md`

Use the master plan as the source for exact README text and final verification:

- Task 7: `Documentation And Full Verification`
- Self-review section

## Scope

Implement:

- README `diagnostics?: 'error' | 'warn' | 'off'` documentation;
- core test guide update when ownership changed;
- deletion of dead branches made obsolete by normalized entrypoints/runtime inputs;
- final package and e2e verification.

Do not implement:

- new transform features;
- new public generated-client APIs;
- optional-chain/computed-access rewrites;
- broad formatter-only churn.

## Files

- Modify: `packages/tree-shaking-plugin/README.md`
- Modify when ownership changed: `packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md`
- Modify when dead after Sessions 1-3: `packages/tree-shaking-plugin/src/core.ts`
- Modify when dead after Sessions 1-3: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify when dead after Sessions 1-3: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify when dead after Sessions 1-3: `packages/tree-shaking-plugin/src/lib/transform/types.ts`

## Task 1: Debt Deletion Sweep

- [x] **Step 1: Find legacy branches and helpers**

Run:

```bash
rg -n "debugSkip|hasExplicitContext|entrypoints|diagnostics" packages/tree-shaking-plugin/src packages/tree-shaking-plugin/README.md
```

Expected: results show which legacy config reads, diagnostics paths, and runtime-helper flags remain.

- [x] **Step 2: Classify each hit**

Use this classification:

- keep public `entrypoints` only at config normalization/public API boundaries;
- delete internal reads of old top-level public config options after Session 1.5;
- delete internal reads of rejected pre-normalized config shapes;
- delete internal reads of `options.entrypoints` after normalization;
- delete `hasExplicitContext` after `runtimeInput` fully replaces it;
- delete `debugSkip` after diagnostics reporter handles unresolved candidates and ordinary skips.

- [x] **Step 3: Delete obsolete internal branches**

Edit only the files where Step 2 found dead internal paths. Preserve the current public `entrypoints` boundary.

Required result:

```bash
rg -n "hasExplicitContext|debugSkip" packages/tree-shaking-plugin/src
```

Expected: no matches, unless a match is in a historical test name or migration comment that explains why it still exists.

- [x] **Step 4: Verify transform behavior after deletion**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/explicit-options.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/mixed-client-modes.test.ts src/__tests__/core/schema-and-imports.test.ts src/__tests__/core/unsupported-and-safety.test.ts
```

Expected: PASS without new snapshot changes. If snapshots change, verify they are semantic no-ops or revert the debt deletion that caused the semantic drift.

- [x] **Step 5: Commit debt deletion**

Run:

```bash
git add packages/tree-shaking-plugin/src
git commit -m "refactor: remove legacy tree-shaking transform branches"
```

Expected: one cleanup commit, or no commit if Step 2 found no removable debt.

## Task 2: Documentation And Test Routing

- [x] **Step 1: Read final documentation task**

Run:

```bash
sed -n '/## Task 7: Documentation And Full Verification/,/## Self-Review/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
```

Expected: the session implementer sees the exact README diagnostics wording and verification commands.

- [x] **Step 2: Update README diagnostics docs**

In `packages/tree-shaking-plugin/README.md`, document:

```md
- `diagnostics` - controls unresolved transform candidates:
  - `'error'` (default) throws when configured source looks transformable but
    generated metadata or operation ownership cannot be proven.
  - `'warn'` prints a warning and skips the candidate.
  - `'off'` skips unresolved candidates silently.
```

Ensure public-facing wording documents only `diagnostics`; no legacy boolean diagnostics alias is part of the supported public or internal config surface.

- [x] **Step 3: Update core test ownership guide**

Open `packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md`.

If Sessions 1-3 changed diagnostics or metadata test ownership, add:

```md
- `resolution-and-module-access.test.ts`
  - Use for diagnostics behavior when generated modules cannot be resolved or loaded through module access.
```

If test ownership did not change, leave this file untouched.

- [x] **Step 4: Commit docs**

Run:

```bash
git add packages/tree-shaking-plugin/README.md packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md
git commit -m "docs: document tree-shaking diagnostics"
```

If `AGENTS.md` did not change, run:

```bash
git add packages/tree-shaking-plugin/README.md
git commit -m "docs: document tree-shaking diagnostics"
```

Expected: one docs commit.

## Task 3: Final Verification

- [x] **Step 1: Run package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
```

Expected: all tree-shaking-plugin tests pass.

- [x] **Step 2: Run typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: no TypeScript errors.

- [x] **Step 3: Run lint**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
```

Expected: no ESLint errors.

- [x] **Step 4: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no output.

- [x] **Step 5: Run full Verdaccio e2e when needed**

If Session 3 already ran the full Verdaccio loop after the last code change and this session changed README only, record the earlier result in the final response. Otherwise run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: `Tree-shaking bundle assertions passed.`

- [x] **Step 6: Confirm final worktree state**

Run:

```bash
git status --short --branch
git log --oneline -8
```

Expected: worktree has only intentional changes, and the recent commits correspond to Sessions 1-4.
