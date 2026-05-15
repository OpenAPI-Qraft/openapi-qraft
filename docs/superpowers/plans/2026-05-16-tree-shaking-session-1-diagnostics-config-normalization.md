# Tree-Shaking Session 1 Diagnostics And Config Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the explicit diagnostics policy and normalize public tree-shaking config into internal entrypoints without changing transform semantics.

**Architecture:** This session works below the planner/mutator behavior. It introduces `diagnostics.ts` and `entrypoints.ts`, wires only the minimum needed into public types and `core.ts`, and leaves generated-source inspection and rewrite semantics for later sessions.

**Tech Stack:** TypeScript, Vitest, unplugin options, existing `@openapi-qraft/tree-shaking-plugin` test harness.

---

## Source Documents

- Master plan: `docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md`
- Design spec: `docs/superpowers/specs/2026-05-16-tree-shaking-plugin-pipeline-architecture-design.md`

Use the master plan as the source for exact test bodies and type snippets:

- Task 1: `Add Diagnostics Contract`
- Task 2: `Normalize Public Config Into Entrypoints`
- Milestone A: `Diagnostics And Config Normalization E2E Gate`

## Scope

Implement:

- `diagnostics?: 'error' | 'warn' | 'off'`;
- default diagnostics policy as `error`;
- `QraftTreeShakeError`;
- structured diagnostic reasons;
- `normalizeEntrypoints(...)`;
- `ClientEntrypoint[]` and import-target/runtime-context config types;
- temporary compatibility for existing `debug?: boolean`.

Do not implement:

- source gate;
- generated metadata inspection extraction;
- runtime helper selection changes;
- snapshot updates unless existing tests require mechanical import/type updates.

## Files

- Create: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`

## Task 1: Diagnostics Contract

- [ ] **Step 1: Read the contract**

Read the master plan sections:

```bash
sed -n '/## Transform Criteria Matrix/,/## E2E Verification Strategy/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
sed -n '/## Task 1: Add Diagnostics Contract/,/## Task 2:/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
```

Expected: the session implementer sees the diagnostics levels, ordinary-skip rule, unresolved-candidate rule, and the exact `diagnostics.test.ts` test cases.

- [ ] **Step 2: Add diagnostics tests first**

Create `packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts` using the test body from master Task 1 Step 1.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/diagnostics.test.ts
```

Expected: FAIL because `diagnostics.ts` does not exist yet.

- [ ] **Step 3: Implement diagnostics types and reporter**

Update `packages/tree-shaking-plugin/src/lib/transform/types.ts`, `packages/tree-shaking-plugin/src/core.ts`, and create `packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts` using master Task 1 Steps 3-5.

Required exported names:

- `DiagnosticsLevel`;
- `DiagnosticLayer`;
- `DiagnosticReason`;
- `QraftTreeShakeError`;
- `DiagnosticReporter`;
- `createDiagnosticReporter(...)`;
- `formatDiagnosticReason(...)`.

- [ ] **Step 4: Verify diagnostics**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/diagnostics.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit diagnostics**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/core.ts \
  packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts \
  packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts
git commit -m "feat: add tree-shaking diagnostics policy"
```

Expected: one focused diagnostics commit.

## Task 2: Entrypoint Normalization

- [ ] **Step 1: Read the config-normalization task**

Run:

```bash
sed -n '/## Task 2: Normalize Public Config Into Entrypoints/,/## Milestone A:/p' docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md
```

Expected: the session implementer sees the exact `entrypoints.test.ts` cases and normalized type shapes.

- [ ] **Step 2: Add entrypoint tests first**

Create `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts` using master Task 2 Step 1.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: FAIL because `entrypoints.ts` does not exist yet.

- [ ] **Step 3: Implement normalized entrypoint types**

Update `packages/tree-shaking-plugin/src/lib/transform/types.ts` using master Task 2 Step 3.

Required model:

- `ImportTarget`;
- `RuntimeContextConfig`;
- `GeneratedFactoryEntrypoint`;
- `PrecreatedClientEntrypoint`;
- `ClientEntrypoint`.

- [ ] **Step 4: Implement `normalizeEntrypoints(...)`**

Create `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts` using master Task 2 Step 4.

Required behavior:

- normalize `createAPIClientFn` into `kind: 'generatedFactory'`;
- normalize `apiClient` into `kind: 'precreatedClient'`;
- preserve legacy config on each entrypoint;
- compose stable keys from kind, export name, and module specifier.

- [ ] **Step 5: Verify entrypoints**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit entrypoints**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts \
  packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts
git commit -m "refactor: normalize tree-shaking entrypoints"
```

Expected: one focused entrypoint-normalization commit.

## Milestone A Verification

- [ ] **Step 1: Run package-level tests touched by this session**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/diagnostics.test.ts src/lib/transform/entrypoints.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Run the e2e gate when code is wired into `core.ts`**

Run this when Task 1 or Task 2 changed executable plugin paths:

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

- [ ] **Step 4: Record intentional e2e skip**

If Tasks 1-2 stayed entirely in helper modules not executed by the bundled fixture, write the skip reason in the session final response and run Milestone B in Session 2.
