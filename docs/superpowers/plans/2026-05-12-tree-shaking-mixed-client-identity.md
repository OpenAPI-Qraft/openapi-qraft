# Tree-Shaking Mixed Client Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the two skipped mixed-mode regressions pass by giving planner and mutator keys a source-aware client identity.

**Architecture:** Add a stable `clientSourceKey` to discovered client bindings and reuse it in operation grouping, usage lookup, local optimized client naming, and mutator lookup paths. This keeps same-named operations from different generated roots independent without redesigning the transform pipeline. Then unskip the two mixed-mode tests and let their existing future snapshots become the active contract.

**Tech Stack:** TypeScript, Babel AST/traverse/types, Vitest inline snapshots, existing `@openapi-qraft/tree-shaking-plugin` workspace commands.

---

## File Structure

- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
  - Add `clientSourceKey` to `ClientBinding`.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
  - Create a source-aware key helper.
  - Assign `clientSourceKey` for context, options, and precreated clients.
  - Use `clientSourceKey` in operation grouping and usage lookup keys.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
  - Use `clientSourceKey` in named-call rewrite lookup and scope-split detection.
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
  - Unskip the two mixed-mode regressions.
  - Refresh inline snapshots only where the implementation changes equivalent formatting or UID aliases.

Do not change public plugin options, generated API fixtures, e2e projects, or callback metadata.

### Task 1: Add Client Source Identity to Types and Planner

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Test: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Add `clientSourceKey` to `ClientBinding`**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, update `ClientBinding`:

```ts
export type ClientBinding = {
  name: string;
  clientSourceKey: string;
  createImportPath: string;
  factory: QraftFactoryConfig;
  bindingNode: t.Node;
  declarationScope: Scope;
  localInitPath?: import('@babel/traverse').NodePath<t.VariableDeclarator>;
  mode:
    | { type: 'context' }
    | { type: 'options'; optionsExpression: t.Expression }
    | {
        type: 'precreated';
        optionsImportPath: string;
        optionsExportName: string;
      };
};
```

- [ ] **Step 2: Add a helper in `plan.ts`**

Near the existing `getGeneratedInfoKey(...)` helper in `packages/tree-shaking-plugin/src/lib/transform/plan.ts`, add:

```ts
function getClientSourceKey(
  createImportPath: string,
  factory: QraftFactoryConfig,
  mode: ClientBinding['mode']
) {
  const generatedInfoKey = getGeneratedInfoKey(createImportPath, factory);

  if (mode.type === 'precreated') {
    return [
      'precreated',
      generatedInfoKey,
      mode.optionsImportPath,
      mode.optionsExportName,
    ].join('::');
  }

  return [mode.type, generatedInfoKey].join('::');
}
```

- [ ] **Step 3: Populate `clientSourceKey` for context clients**

In the zero-argument `clients.push(...)` branch in `createTransformPlan(...)`, create the mode object once and pass it into the helper:

```ts
const mode = { type: 'context' } as const;
clients.push({
  name: variablePath.node.id.name,
  clientSourceKey: getClientSourceKey(createImportPath, createImport.factory, mode),
  createImportPath,
  factory: createImport.factory,
  bindingNode: variablePath.node.id,
  declarationScope: variablePath.parentPath.scope,
  localInitPath: variablePath,
  mode,
});
```

- [ ] **Step 4: Populate `clientSourceKey` for explicit-options clients**

In the one-expression argument branch, create the mode object once:

```ts
const mode = {
  type: 'options',
  optionsExpression: t.cloneNode(args[0], true),
} as const;
clients.push({
  name: variablePath.node.id.name,
  clientSourceKey: getClientSourceKey(createImportPath, createImport.factory, mode),
  createImportPath,
  factory: createImport.factory,
  bindingNode: variablePath.node.id,
  declarationScope: variablePath.parentPath.scope,
  localInitPath: variablePath,
  mode,
});
```

- [ ] **Step 5: Populate `clientSourceKey` for precreated clients**

In `findPrecreatedClients(...)`, where the precreated `ClientBinding` is returned, create the precreated mode object once and include `clientSourceKey`:

```ts
const mode = {
  type: 'precreated',
  optionsImportPath: resolvePrecreatedOptionsImportPath(
    id,
    optionsSourceFile,
    match.config.createAPIClientFnOptionsModule ?? match.config.clientModule
  ),
  optionsExportName: match.config.createAPIClientFnOptions,
} as const;

return {
  name: match.localName,
  clientSourceKey: getClientSourceKey(factoryFile, factoryConfig, mode),
  createImportPath: factoryFile,
  factory: factoryConfig,
  bindingNode: match.localNode,
  declarationScope: programScope,
  mode,
};
```

Use the exact local variable names already present in `findPrecreatedClients(...)`; do not invent new resolution logic if the function already has the resolved factory file and options import path.

- [ ] **Step 6: Run typecheck to expose missing `clientSourceKey` assignments**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS. If it fails with missing `clientSourceKey`, update the remaining `ClientBinding` construction sites only.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts
git commit -m "fix(tree-shaking): track client source identity"
```

### Task 2: Use Source Identity in Planner Keys

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Test: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Update named usage operation keys**

In the first `CallExpression` traversal, replace operation and usage key construction that starts with `match.client.name` with `match.client.clientSourceKey`.

The operation key should become:

```ts
const operationKey = [
  match.client.clientSourceKey,
  match.client.name,
  match.serviceName,
  match.operationName,
  scopeKey,
].join(':');
```

The usage map key should become:

```ts
const key = [
  match.client.clientSourceKey,
  match.client.name,
  match.serviceName,
  match.operationName,
  match.callbackName,
  scopeKey,
].join(':');
```

Keep `match.client.name` in the key to preserve separate local clients from the same source.

- [ ] **Step 2: Update schema source keys where named clients are involved**

In `collectSchemaUsage(...)`, change the named-client `sourceKey` from only `match.client.name` to a source-aware value:

```ts
const sourceKey =
  match.kind === 'named'
    ? `${match.client.clientSourceKey}:${match.client.name}`
    : match.createImportPath;
```

Keep inline schema source keys as `match.createImportPath`.

- [ ] **Step 3: Update `localClientNamesByOperation` consumers in `assignScopeLocalClientNames(...)`**

Find `assignScopeLocalClientNames(...)` in `plan.ts`. Any key inside that function that is based on `usage.client.name + service + operation` must include `usage.client.clientSourceKey`.

Use this key shape:

```ts
[
  usage.client.clientSourceKey,
  usage.client.name,
  usage.serviceName,
  usage.operationName,
  usage.scopeKey,
].join(':')
```

- [ ] **Step 4: Run focused skipped tests without unskipping yet**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "keeps same-operation rewrites separate across all client modes|supports createAPIClientFn and precreated apiClient clients in one file"
```

Expected: Vitest reports these tests as skipped because they still use `it.skip(...)`. This command is only a sanity check that the file still loads.

- [ ] **Step 5: Run typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/plan.ts
git commit -m "fix(tree-shaking): use client source in usage keys"
```

### Task 3: Use Source Identity in Mutator Keys

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Test: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Update `rewriteNamedClientCalls(...)` lookup key**

In `rewriteNamedClientCalls(...)`, include `usage.client.clientSourceKey` when creating `usageByKey`:

```ts
const usageByKey = new Map(
  usages.map((usage) => [
    [
      usage.client.clientSourceKey,
      usage.client.name,
      usage.serviceName,
      usage.operationName,
      usage.callbackName,
      usage.scopeKey,
    ].join(':'),
    usage,
  ])
);
```

Use the same key when reading from `usageByKey`:

```ts
const usage = usageByKey.get(
  [
    match.client.clientSourceKey,
    match.client.name,
    match.serviceName,
    match.operationName,
    match.callbackName,
    getUsageScopeKey(callPath),
  ].join(':')
);
```

- [ ] **Step 2: Update `hasScopeSplitUsage(...)`**

In `hasScopeSplitUsage(...)`, include `usage.client.clientSourceKey`:

```ts
const key = [
  usage.client.clientSourceKey,
  usage.client.name,
  usage.serviceName,
  usage.operationName,
].join(':');
```

- [ ] **Step 3: Check declaration dedupe behavior**

Read `dedupeDeclarations(...)`. Do not change it unless tests prove it drops distinct source-aware optimized clients. The expected fix should make local names distinct before dedupe, rather than making dedupe source-aware.

- [ ] **Step 4: Run focused currently-skipped tests by temporarily targeting their names**

Do not edit `it.skip` yet. Run the full file load:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts
```

Expected: PASS with two skipped tests.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/mutate.ts
git commit -m "fix(tree-shaking): use client source in mutator keys"
```

### Task 4: Unskip Mixed-Mode Regressions and Refresh Snapshots

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Unskip both regressions**

In `packages/tree-shaking-plugin/src/core.test.ts`, change:

```ts
it.skip('keeps same-operation rewrites separate across all client modes', ...)
it.skip('supports createAPIClientFn and precreated apiClient clients in one file', ...)
```

to:

```ts
it('keeps same-operation rewrites separate across all client modes', ...)
it('supports createAPIClientFn and precreated apiClient clients in one file', ...)
```

Remove the two comments that say production still mishandles the cases.

- [ ] **Step 2: Run focused snapshot update**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "keeps same-operation rewrites separate across all client modes|supports createAPIClientFn and precreated apiClient clients in one file" -u
```

Expected: both tests PASS.

If snapshots differ from the current expected future snapshots only by Babel UID names or import ordering, keep the generated snapshots if they still preserve:

- context and precreated operation imports from different roots;
- distinct optimized client declarations;
- context branch rewritten to `qraftReactAPIClient` where `useQuery` requires React runtime;
- precreated branch rewritten to `qraftAPIClient(..., createAPIClientOptions())`;
- inline explicit-options call still passing `apiContext!`.

- [ ] **Step 3: Verify no skipped tests remain from this fix**

Run:

```bash
rg -n "it\\.skip\\('keeps same-operation rewrites separate across all client modes'|it\\.skip\\('supports createAPIClientFn and precreated apiClient clients in one file'" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: no output.

- [ ] **Step 4: Run full package tests and typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): enable mixed client identity regressions"
```

### Task 5: Final Review

**Files:**
- Verify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Verify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Verify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Verify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Run final package checks**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [ ] **Step 2: Inspect skipped tests**

Run:

```bash
rg -n "it\\.skip" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: no output unless unrelated skips were added after this plan was written. If there is output for either mixed identity regression, the task is incomplete.

- [ ] **Step 3: Inspect final diff**

Run:

```bash
git diff --stat HEAD~4..HEAD
git diff HEAD~4..HEAD -- packages/tree-shaking-plugin/src/lib/transform/types.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts packages/tree-shaking-plugin/src/lib/transform/mutate.ts packages/tree-shaking-plugin/src/core.test.ts
```

Expected:

- production changes are limited to transform types/planner/mutator;
- tests only unskip and refresh the two mixed identity regressions;
- no public config, e2e, or generated API fixture changes.

## Self-Review

Spec coverage:

- The plan fixes both skipped regressions.
- The plan uses a source-aware identity instead of a test-specific workaround.
- The plan keeps public plugin options and e2e fixtures out of scope.

Placeholder scan:

- No placeholder implementation steps remain.
- Every edit step identifies exact files and concrete code shape.
- Every verification step includes exact commands and expected results.

Type consistency:

- `ClientBinding.clientSourceKey` is added in `types.ts` and populated at every construction site in `plan.ts`.
- Planner and mutator use the same identity components: `clientSourceKey`, local client name, service, operation, callback where needed, and scope where needed.
- Existing `getGeneratedInfoKey(...)` remains the factory/context identity base.
