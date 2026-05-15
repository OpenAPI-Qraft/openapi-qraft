# Tree-Shaking Session 2 Source Gate And Generated Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the pre-parse source gate and extract generated-source inspection behind a testable metadata boundary.

**Architecture:** This session depends on Session 1's normalized entrypoints. It adds `source-gate.ts` and `generated-metadata.ts`, then makes the old planner able to call the new metadata inspector through an adapter without rewriting helper selection or mutation semantics yet.

**Tech Stack:** TypeScript, Babel parser/traverse, module access adapters, Vitest, multi-bundler e2e fixture.

---

## Source Documents

- Master plan: `docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md`
- Design spec: `docs/superpowers/specs/2026-05-16-tree-shaking-plugin-pipeline-architecture-design.md`
- Session 1 prerequisite: `docs/superpowers/plans/2026-05-16-tree-shaking-session-1-diagnostics-config-normalization.md`

Use the master plan as the source for exact test bodies and type snippets:

- Task 3: `Add The Pre-Parse Source Gate`
- Task 4: `Extract Generated Metadata Inspection`
- Milestone B: `Source Gate And Generated Metadata E2E Gate`

## Scope

Implement:

- `shouldInspectSource(...)`;
- conservative source-gate behavior;
- independent generated metadata inspection;
- generated factory services ownership proof;
- pre-created client export/factory matching;
- structured diagnostic reasons for unresolved metadata.

Do not implement:

- normalized runtime input in `ClientBinding`;
- planner/mutator semantic rewrite changes;
- default diagnostics enforcement in transform candidates;
- README changes.

## Files

- Create: `packages/tree-shaking-plugin/src/lib/transform/source-gate.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/source-gate.test.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`

## Task 1: Pre-Parse Source Gate

- [ ] **Step 1: Read the source-gate task**

Run:

```bash
sed -n '/## Task 3: Add The Pre-Parse Source Gate/,/## Task 4:/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
```

Expected: the session implementer sees exact source-gate test cases and implementation rules.

- [ ] **Step 2: Add source-gate tests first**

Create `packages/tree-shaking-plugin/src/lib/transform/source-gate.test.ts` using master Task 3 Step 1.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/source-gate.test.ts
```

Expected: FAIL because `source-gate.ts` does not exist yet.

- [ ] **Step 3: Implement `shouldInspectSource(...)`**

Create `packages/tree-shaking-plugin/src/lib/transform/source-gate.ts` using master Task 3 Steps 3-4.

Required behavior:

- skip when no entrypoints are configured;
- skip obvious non-source and `node_modules` ids;
- respect include/exclude filters;
- inspect when the source contains configured names, module specifiers, or static member-chain hints;
- prefer parsing when uncertain.

- [ ] **Step 4: Wire source gate into `core.ts`**

Update `packages/tree-shaking-plugin/src/core.ts` using master Task 3 Step 5.

Required behavior:

- compute normalized entrypoints before parse;
- return `null` before parse for ordinary source-gate skips;
- do not throw diagnostics for ordinary source-gate skips.

- [ ] **Step 5: Verify source gate**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/source-gate.test.ts src/__tests__/core/harness.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit source gate**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/source-gate.ts \
  packages/tree-shaking-plugin/src/lib/transform/source-gate.test.ts \
  packages/tree-shaking-plugin/src/core.ts
git commit -m "perf: add tree-shaking source inspection gate"
```

Expected: one focused source-gate commit.

## Task 2: Generated Metadata Inspection

- [ ] **Step 1: Read the generated-metadata task**

Run:

```bash
sed -n '/## Task 4: Extract Generated Metadata Inspection/,/## Milestone B:/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
```

Expected: the session implementer sees exact generated metadata tests, return types, and extraction boundaries.

- [ ] **Step 2: Add generated-metadata tests first**

Create `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts` using master Task 4 Step 1.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/generated-metadata.test.ts
```

Expected: FAIL because `generated-metadata.ts` does not exist yet.

- [ ] **Step 3: Add metadata result types**

Update `packages/tree-shaking-plugin/src/lib/transform/types.ts` using master Task 4 Step 3.

Required model:

- `GeneratedFactoryMetadata`;
- `PrecreatedClientMetadata`;
- `GeneratedEntrypointMetadata`;
- `GeneratedMetadataResult`.

- [ ] **Step 4: Extract generated-source inspection**

Create `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts` using master Task 4 Step 4.

Required behavior:

- resolve and load configured factory/client modules through `moduleAccess`;
- read generated factory services imports;
- read service operation import paths;
- traverse re-export chains already supported by current planner helpers;
- validate pre-created client export against configured factory export/module;
- return structured `DiagnosticReason` values instead of direct debug skips.

- [ ] **Step 5: Keep the legacy planner compiling through an adapter**

Update `packages/tree-shaking-plugin/src/lib/transform/plan.ts` using master Task 4 Step 5.

Required behavior:

- call `normalizeEntrypoints(options)`;
- call `inspectGeneratedEntrypoints(...)`;
- keep old planner maps if needed for compatibility in this session;
- leave full helper-selection rewiring for Session 3.

- [ ] **Step 6: Verify metadata and core behavior**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/generated-metadata.test.ts src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit metadata boundary**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts \
  packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts \
  packages/tree-shaking-plugin/src/lib/transform/plan.ts
git commit -m "refactor: extract generated metadata inspection"
```

Expected: one focused metadata-boundary commit.

## Milestone B Verification

- [ ] **Step 1: Run focused package checks**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/source-gate.test.ts src/lib/transform/generated-metadata.test.ts src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: tests pass and typecheck reports no TypeScript errors.

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

- [ ] **Step 3: Debug e2e failures without weakening assertions**

If one bundler fails, inspect its output under `e2e/projects/tree-shaking-bundlers/dist` and identify whether the root cause is resolver/module-access behavior, source-gate false negative, or generated metadata extraction.
