# Tree-Shaking Session 3 Planner Mutator Normalized Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route planning and mutation through normalized runtime inputs, enforce diagnostics for unresolved candidates, and preserve the agreed tree-shaking semantics.

**Architecture:** This session consumes Session 1 entrypoints and Session 2 generated metadata. It changes `plan.ts` and `mutate.ts` so helper selection depends on normalized client runtime input instead of legacy flags, then enforces diagnostics behavior at transform boundaries.

**Tech Stack:** TypeScript, Babel AST, Vitest inline snapshots, source-map tests, multi-bundler e2e fixture.

---

## Source Documents

- Master plan: `docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md`
- Design spec: `docs/superpowers/specs/2026-05-16-tree-shaking-plugin-pipeline-architecture-design.md`
- Session 1 prerequisite: `docs/superpowers/plans/2026-05-16-tree-shaking-session-1-diagnostics-config-normalization.md`
- Session 2 prerequisite: `docs/superpowers/plans/2026-05-16-tree-shaking-session-2-source-gate-generated-metadata.md`

Use the master plan as the source for exact test bodies and type snippets:

- Task 5: `Route Planner Through Normalized Entrypoints And Metadata`
- Task 6: `Enforce Diagnostics In Core Transform Behavior`
- Milestone C: `Planner, Mutator, And Diagnostics E2E Gate`

## Scope

Implement:

- normalized `RuntimeInput`;
- planner binding population from metadata;
- helper/argument selection from runtime input;
- explicit-options rewrite through `qraftAPIClient`;
- pre-created rewrite through `qraftAPIClient(..., optionsFactory())`;
- context zero-arg rewrite through `qraftReactAPIClient` when required;
- `.schema` direct operation rewrites without runtime helper;
- diagnostics enforcement for unresolved transform candidates.

Do not implement:

- optional-chain rewrite support;
- computed property rewrite support;
- public generated-client API changes;
- full `TransformEditPlan` redesign beyond what is needed to remove legacy branching.

## Files

- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts`

## Task 1: Planner And Mutator Runtime Inputs

- [ ] **Step 1: Read the semantic contract**

Run:

```bash
sed -n '/## Transform Criteria Matrix/,/## E2E Verification Strategy/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
sed -n '/## Task 5: Route Planner Through Normalized Entrypoints And Metadata/,/## Task 6:/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
```

Expected: the session implementer sees the exact runtime-input type, focused regressions, and semantic signals.

- [ ] **Step 2: Add planner regressions first**

Add the tests from master Task 5 Step 1 to the relevant core test files.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/explicit-options.test.ts
```

Expected: FAIL if current helper selection still follows legacy flags; PASS is acceptable when existing code already satisfies a regression.

- [ ] **Step 3: Add `RuntimeInput` to transform types**

Update `packages/tree-shaking-plugin/src/lib/transform/types.ts` using master Task 5 Step 3.

Required variants:

- `{ kind: 'none' }`;
- `{ kind: 'context'; context: RuntimeContextConfig }`;
- `{ kind: 'optionsExpression'; expression: t.Expression }`;
- `{ kind: 'optionsFactoryCall'; target: ImportTarget }`.

- [ ] **Step 4: Populate runtime input for local generated clients**

Update `packages/tree-shaking-plugin/src/lib/transform/plan.ts` using master Task 5 Step 4.

Required behavior:

- zero-argument context-backed generated clients produce `runtimeInput.kind === 'context'`;
- `createAPIClient(optionsExpression)` produces `runtimeInput.kind === 'optionsExpression'`;
- invalid or ambiguous call shapes stay untransformed.

- [ ] **Step 5: Populate runtime input for pre-created clients**

Update `packages/tree-shaking-plugin/src/lib/transform/plan.ts` using master Task 5 Step 5.

Required behavior:

- configured pre-created clients produce `runtimeInput.kind === 'optionsFactoryCall'`;
- the options factory target comes from normalized entrypoint/metadata;
- pre-created clients never choose `qraftReactAPIClient` in this design.

- [ ] **Step 6: Update mutation helper selection**

Update `packages/tree-shaking-plugin/src/lib/transform/mutate.ts` using master Task 5 Step 6.

Required behavior:

- context runtime input emits `qraftReactAPIClient` only for callbacks that require context semantics;
- explicit-options runtime input emits `qraftAPIClient(operation, callbacks, optionsExpression)`;
- pre-created runtime input emits `qraftAPIClient(operation, callbacks, optionsFactory())`;
- `.schema` emits direct `operation.schema` and imports no runtime helper.

- [ ] **Step 7: Run core transform suites**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/explicit-options.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/mixed-client-modes.test.ts src/__tests__/core/schema-and-imports.test.ts
```

Expected: PASS after intentional snapshot updates.

Verify these semantic signals before accepting snapshot updates:

- context zero-arg hook usage preserves context runtime;
- explicit options usage passes the original options expression;
- pre-created usage calls configured options factory;
- schema usage imports no runtime helper;
- unsupported references keep original clients alive.

- [ ] **Step 8: Commit normalized planner wiring**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/plan.ts \
  packages/tree-shaking-plugin/src/lib/transform/mutate.ts \
  packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts
git commit -m "refactor: route tree-shaking through normalized runtime inputs"
```

Expected: one commit removing legacy runtime-helper branching where the normalized model replaces it.

## Task 2: Diagnostics Enforcement

- [ ] **Step 1: Read diagnostics enforcement task**

Run:

```bash
sed -n '/## Task 6: Enforce Diagnostics In Core Transform Behavior/,/## Milestone C:/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
```

Expected: the session implementer sees the exact core diagnostics tests and expected error/warn/off behavior.

- [ ] **Step 2: Add core diagnostics behavior tests first**

Update the core tests listed in master Task 6 Step 1.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/resolution-and-module-access.test.ts src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/schema-and-imports.test.ts
```

Expected: FAIL where unresolved candidates still silently skip by default.

- [ ] **Step 3: Enforce diagnostics in core/planner**

Update `packages/tree-shaking-plugin/src/core.ts` and `packages/tree-shaking-plugin/src/lib/transform/plan.ts` using master Task 6 Steps 3-5.

Required behavior:

- ordinary skips remain silent;
- unresolved transform candidates throw by default;
- `diagnostics: 'warn'` warns and skips;
- `diagnostics: 'off'` skips silently;
- old soft-skip tests set `diagnostics: 'off'` only when the skipped behavior is intentional.

- [ ] **Step 4: Run diagnostics and core tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/diagnostics.test.ts src/__tests__/core/resolution-and-module-access.test.ts src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/schema-and-imports.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit diagnostics enforcement**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.ts \
  packages/tree-shaking-plugin/src/lib/transform/plan.ts \
  packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts
git commit -m "feat: enforce tree-shaking diagnostics policy"
```

Expected: one commit implementing default error diagnostics for unresolved candidates.

## Milestone C Verification

- [ ] **Step 1: Run package checks**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
git diff --check
```

Expected: tests pass, typecheck has no TypeScript errors, lint has no ESLint errors, and `git diff --check` prints no output.

- [ ] **Step 2: Run fast e2e gate**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
rm -rf e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist
cp -R packages/tree-shaking-plugin/dist \
  e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist
cd e2e/projects/tree-shaking-bundlers
npm run codegen
npm run build
npm run e2e:post-build
```

Expected: `Tree-shaking bundle assertions passed.`

- [ ] **Step 3: Run full Verdaccio e2e before handoff**

Run:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: copied fixture under `/Users/radist/w/qraft-e2e` builds and ends with `Tree-shaking bundle assertions passed.`
