# Qraft Tree-Shaking Imports Before Client Declaration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every transform emit all required imports before the first generated client declaration, while keeping the existing source-map behavior and the current callback validity rules unchanged.

**Architecture:** The current mutator mixes two different concerns: program-level import insertion and scope-level client declaration insertion. The refactor should split those concerns so imports are staged first, then client declarations are inserted into their original anchor scopes. That keeps the emitted source in a more conventional order without changing the rewritten user call sites, so the existing source-map regression should still validate the traceability contract.

**Tech Stack:** TypeScript, Babel AST traversal/types, Vitest inline snapshots, Yarn 4.

---

## File Structure

- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: move import emission ahead of generated client declarations and keep the ordering deterministic across context, explicit-options, and precreated modes.
- `packages/tree-shaking-plugin/src/core.test.ts`: pin the exact emitted order in the existing regression snapshot that currently shows imports after the generated declaration.
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs` and `e2e/projects/tree-shaking-bundlers/src/*`: only touch these if a stable bundle-level assertion exists for the same ordering; otherwise keep e2e untouched because bundle ordering can be normalized by the bundler.

---

### Task 1: Pin the current regression in the unit snapshot

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Update the explicit-options regression so the snapshot expects imports before the generated declaration**

Keep the current test input, including the valid direct operation invoke on `createAPIClient({})`, but change the expected output to the standard order:

```ts
expect(result?.code).toMatchInlineSnapshot(`
  "import { qraftReactAPIClient } from "@openapi-qraft/react";
  import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
  import { getPets } from "./api/services/PetsService";
  import { operationInvokeFn } from "@openapi-qraft/react/callbacks/operationInvokeFn";
  const api_pets_getPets = qraftReactAPIClient(getPets, {
    getQueryKey,
    operationInvokeFn
  }, {});
  api_pets_getPets.getQueryKey({});
  api_pets_getPets();"
`);
```

This snapshot is the minimal regression that proves the transform is no longer emitting `const api_pets_getPets = ...` before the helper imports.

- [x] **Step 2: Keep the source-map regression unchanged**

Leave `keeps a rewritten user call site traceable through an incoming source map` as-is. It already exercises the rewritten call site mapping, which is the part that could regress if the mutator order changes in a way that shifts original positions.

- [x] **Step 3: Run the focused unit test file once to capture the new expectation**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: the explicit-options snapshot still fails until the mutator refactor is done.

---

### Task 2: Split import staging from generated declaration insertion in `mutate.ts`

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [x] **Step 1: Stop emitting program imports from inside declaration creation**

Refactor the client-declaration pipeline so the import nodes and the generated client statement(s) are staged independently. The important part is not the order of helper calls, but the final AST result: no generated client declaration may be committed to the program body before all of its helper imports are already present in the file.

The implementation shape should look like this:

```ts
const pendingImports: t.ImportDeclaration[] = [];
const pendingStatementInsertions: Array<{
  anchor: import('@babel/traverse').NodePath<t.VariableDeclaration>;
  statements: t.Statement[];
}> = [];

insertImports(
  ast,
  usages,
  inlineImports,
  schemaUsages,
  generatedInfoByImport,
  runtimeLocalNames,
  pendingImports
);
insertOptimizedClients(
  ast,
  usages,
  generatedInfoByImport,
  runtimeLocalNames,
  pendingStatementInsertions
);

const lastImportIndex = findLastImportIndex(body);
body.splice(lastImportIndex + 1, 0, ...dedupeDeclarations(pendingImports));

for (const { anchor, statements } of pendingStatementInsertions) {
  anchor.insertAfter(dedupeDeclarations(statements));
}
```

Keep the existing dedupe behavior, but apply it to the staged import list before the program-level splice.

- [x] **Step 2: Preserve the current insertion anchors for client declarations**

Do not change where declarations are attached:

```ts
if (statementPath?.isVariableDeclaration()) {
  statementPath.insertAfter(dedupeDeclarations(declarations));
}
```

The only behavioral change should be that the helper imports are already present in the program before the first generated declaration appears.

- [x] **Step 3: Keep callback validity and runtime-helper selection untouched**

Do not broaden or narrow callback support in this task. `callbackNeedsRuntimeContext(...)`, the `qraftReactAPIClient`/`qraftAPIClient` selection logic, and the zero-arg vs explicit-options validity rules should stay exactly as they are. This change is about ordering, not semantics.

- [x] **Step 4: Re-run the focused unit suite after the refactor**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: the regression snapshot now shows all imports before the first generated client declaration, and the source-map test still passes.

---

### Task 3: Add e2e coverage only if bundle output keeps a stable textual order

**Files:**
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/src/*` only if a stable scenario already exists for this shape
- Modify: `e2e/projects/tree-shaking-bundlers/package.json` only if the fixture needs a new scenario or codegen target to make the order check observable

- [x] **Step 1: Evaluate whether the bundle artifact preserves the source-level order deterministically**

If a scenario already produces a readable bundle where the relevant imports and generated declaration survive in a stable order, add a single assertion that checks the imports appear before the first generated client declaration for that scenario. Use the existing bundle assertion harness instead of adding a new test runner.

If the shape only becomes visible after adding a dedicated fixture or codegen target, wire that into `e2e/projects/tree-shaking-bundlers/package.json` first, then reuse the same assert harness. Do not add a separate execution path: the existing matrix runner is the source of truth.

If the bundler normalizes or reorders the emitted bundle in a way that makes this unstable, skip e2e for this change. The unit snapshot remains the source of truth for this ordering contract.

- [x] **Step 2: Run the relevant e2e command only if the new assertion was added**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

This is the same local runner used in recent qraft plans. It copies `e2e/projects/tree-shaking-bundlers` into `/Users/radist/w/qraft-e2e`, regenerates the fixture through `npm run codegen`, builds all bundlers through `scripts/build.mjs`, and then runs `scripts/assert-dist.mjs` against the generated outputs.

If the new assertion is hard to debug, a tighter inner-loop check from `e2e/projects/tree-shaking-bundlers` is:

```bash
npm run codegen
node ./scripts/build.mjs
node ./scripts/assert-dist.mjs
```

That keeps the exact same fixture and assertion code, but lets you inspect the generated bundle files in place before the root runner copies them into `/Users/radist/w/qraft-e2e`.

For this change, the e2e order assertion was not added because the bundle text is normalized differently by Vite, Rollup, Webpack, Rspack, and esbuild. The stable contract remains the unit snapshot plus the existing token and source-map checks.
