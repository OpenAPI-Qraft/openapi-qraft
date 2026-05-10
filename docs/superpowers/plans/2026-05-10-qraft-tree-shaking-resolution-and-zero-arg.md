# Qraft Tree-Shaking: Barrel Resolution & Zero-Arg No-Context Factory Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two independent gaps in the tree-shaking plugin: (1) re-export barrel imports are not matched against a factory configured with a direct file path, and (2) zero-arg calls to no-context factories (`qraftAPIClient`-based) are never transformed, even for callbacks that require no query-client options (e.g. `getQueryKey`, `getMutationKey`).

**Architecture:** Both bugs live in `plan.ts`. Bug 1 is in the import-matching loop that compares the resolved import path against `factoryResolvedIds` — it needs a barrel fallback that reads the resolved barrel file, finds the re-export of the factory name, resolves the target, and compares again. Bug 2 is a single predicate guard that skips *all* usages of zero-arg no-context factory bindings: relaxing it to skip only when `callbackNeedsRuntimeContext(callbackName)` is true allows options-free callbacks (`getQueryKey`, `getMutationKey`, `getInfiniteQueryKey`) to flow through and emit `qraftAPIClient(op, { callback })` without a third argument. No changes to `mutate.ts` are required because `createOptimizedClientDeclaration` already omits the options argument when `needsOptions` is false.

**Tech Stack:** TypeScript, Babel traverse/types, Vitest inline snapshots, Yarn 4.

---

### How to run tests

**Plugin unit tests** (no e2e, fast):
```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
# single test by name pattern:
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "my test name"
# update inline snapshots:
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "my test name" --update-snapshots
```

**E2e: fast local iteration** (uses local plugin dist, no Verdaccio):

The e2e fixture at `e2e/projects/tree-shaking-bundlers` depends on the *installed* dist of `@openapi-qraft/tree-shaking-plugin` (not a workspace symlink). After changing plugin source, build and sync the dist before running the fixture:

```bash
# 1. Build the plugin
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build

# 2. Sync the fresh dist into the fixture's node_modules
cp -r packages/tree-shaking-plugin/dist/. \
    e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist/

# 3. Run all 5 bundlers × all scenarios (from the fixture root)
cd e2e/projects/tree-shaking-bundlers
npm run build

# 4. Assert all bundle outputs (still inside the fixture root)
npm run e2e:post-build
```

To also re-run codegen (only needed when changing the OpenAPI spec or `package.json` codegen args):
```bash
npm run e2e:pre-build
```

**E2e: full end-to-end** (publishes packages to local Verdaccio, slower):
```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

---

### File Structure

- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts` — barrel re-export fallback in the import-matching loop; relax the zero-arg no-context skip guard.
- Modify: `packages/tree-shaking-plugin/src/core.test.ts` — update two existing tests, add one barrel-resolution test.
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs` — update `apiOnlyScenario` excludes, expand `node-api-helper-selection` includes; keep `createNodeAPIClient` module as `'./generated-api/create-node-api-client'`.
- No change to `e2e/projects/tree-shaking-bundlers/src/node-api-helper-selection.ts` — already has zero-arg usage after user rollback.

---

### Task 0: Temporarily disable the zero-arg test to isolate the barrel fix

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

**Why this exists:** Two bugs coexist in the same plugin. Without isolation, when we write a *failing* barrel-resolution test in Task 1 and run the full suite, the already-committed test `'does not transform zero-arg calls to a no-context factory'` (which currently asserts `result === null`) would *also* start failing after the zero-arg guard is relaxed — creating noise that obscures which fix causes which result. We skip it here, do the barrel fix cleanly (Task 1), then reinstate and rewrite it as part of the zero-arg fix (Task 2).

- [ ] **Step 1: Mark the zero-arg–getQueryKey test as skipped**

Find the test at approximately line 470 of `packages/tree-shaking-plugin/src/core.test.ts`:

```ts
it('does not transform zero-arg calls to a no-context factory', async () => {
```

Change `it` to `it.skip`:

```ts
it.skip('does not transform zero-arg calls to a no-context factory', async () => {
```

- [ ] **Step 2: Verify the suite is clean**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: all non-skipped tests pass, the skipped test is listed as skipped.

- [ ] **Step 3: Commit the temporary skip**

```bash
git add packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test: temporarily skip zero-arg no-context test (will revert after barrel fix)"
```

---

### Task 1: Fix barrel re-export resolution in `plan.ts` (TDD)

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`

- [ ] **Step 1: Write the failing test for barrel-import resolution**

Add a new test immediately after the (now-skipped) `'does not transform zero-arg calls to a no-context factory'` test.  The fixture has a separate `api-barrel.ts` that re-exports `createAPIClient` from `./api`.  The plugin is configured with `module: './api'` (the factory's direct file), but the consumer imports from `'./api-barrel'` (the barrel).  The test confirms the factory *is* still transformed despite the indirection.

```ts
it('transforms factory imported via a barrel when the module config points to the direct file', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'qraft-tree-shaking-')
  );
  // PRECREATED_BASE_FILES puts the no-context factory at src/api/index.ts
  await writeFixtureFiles(root, {
    ...PRECREATED_BASE_FILES,
    // a one-liner barrel that re-exports from the factory file
    'src/api-barrel.ts': `export { createAPIClient } from './api';`,
  });
  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api-barrel';

const api = createAPIClient({ queryClient: {} });
api.pets.getPets.invalidateQueries();
`,
    sourceFile,
    // module points to the direct factory file, but the consumer imports from the barrel
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toMatchInlineSnapshot(`...`);
});
```

- [ ] **Step 2: Run the new test to confirm it fails**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts \
  -t "transforms factory imported via a barrel"
```

Expected: FAIL — the plugin returns `null` because the barrel path doesn't match the configured direct-file path.

- [ ] **Step 3: Add `resolveBarrelReexportedFactory` helper to `plan.ts`**

Add the following async helper **after** the existing `findFactoryReexport` function (around line 1318 in `plan.ts`):

```ts
async function resolveBarrelReexportedFactory(
  barrelFile: string,
  importedName: string,
  matchingFactories: QraftFactoryConfig[],
  factoryResolvedIds: Map<QraftFactoryConfig, string | null>,
  resolver: QraftResolver
): Promise<QraftFactoryConfig | null> {
  let source: string;
  try {
    source = await fs.readFile(barrelFile, 'utf8');
  } catch {
    return null;
  }

  const barrelAst = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  const reexportSpecifier = findFactoryReexport(barrelAst, importedName);
  if (!reexportSpecifier) return null;

  const resolved = await resolver(reexportSpecifier, barrelFile);
  if (!resolved) return null;
  const resolvedId = normalizeResolvedId(resolved);

  return (
    matchingFactories.find(
      (factory) => factoryResolvedIds.get(factory) === resolvedId
    ) ?? null
  );
}
```

- [ ] **Step 4: Use the helper as a fallback in the import-matching loop**

In `createTransformPlan`, find the block that ends with (approximately lines 180–184):

```ts
      const matched = matchingFactories.find(
        (factory) => factoryResolvedIds.get(factory) === resolvedId
      );
      if (!matched) continue;
```

Replace with:

```ts
      let matched = matchingFactories.find(
        (factory) => factoryResolvedIds.get(factory) === resolvedId
      );
      if (!matched) {
        matched =
          (await resolveBarrelReexportedFactory(
            resolvedAbs,
            importedName,
            matchingFactories,
            factoryResolvedIds,
            resolver
          )) ?? undefined;
      }
      if (!matched) continue;
```

- [ ] **Step 5: Run the barrel-resolution test and update the inline snapshot**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts \
  -t "transforms factory imported via a barrel" --update-snapshots
```

Expected: PASS. The snapshot is now populated with the transformed code (no `createAPIClient` factory, direct `qraftAPIClient(getPets, { invalidateQueries }, ...)` call).

- [ ] **Step 6: Run the full unit test suite to verify no regressions**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: all tests pass (the zero-arg test is still skipped — that is expected).

- [ ] **Step 7: Commit**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/plan.ts \
        packages/tree-shaking-plugin/src/core.test.ts
git commit -m "fix(tree-shaking): resolve factory through barrel re-exports in import matching"
```

---

### Task 2: Fix zero-arg no-context factory named-binding transformation (TDD)

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`

**Context:** `PRECREATED_BASE_FILES` contains `src/api/index.ts` that uses `qraftAPIClient` (not `qraftReactAPIClient`), so `generatedInfo.contextName` is always `null` for it.  A zero-arg call (`const api = createAPIClient()`) is classified as `mode: { type: 'context' }` in the plan phase.  The guard at the usage-collection step currently skips **all** callbacks when `contextName` is null, even those like `getQueryKey` that require no options argument.

- [ ] **Step 0: Revert the temporary skip commit from Task 0**

```bash
git revert HEAD --no-edit
```

This reinstates `'does not transform zero-arg calls to a no-context factory'` as `it(...)` (not `it.skip`). Confirm the suite still passes — the test currently expects `null`, which the code still returns before the fix below.

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: all tests pass (the zero-arg test expects `null` and is still satisfied).

- [ ] **Step 1: Rename the zero-arg test and change its expected outcome**

Find the test at approximately line 470:
```
'does not transform zero-arg calls to a no-context factory'
```

Rename it and update its expectation — after the fix it **should** transform `getQueryKey`:

```ts
it('transforms zero-arg no-options callbacks on a no-context factory', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'qraft-tree-shaking-')
  );
  await writeFixtureFiles(root, {
    ...PRECREATED_BASE_FILES,
  });
  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.getQueryKey();
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  // getQueryKey needs no options — it must be transformed even for a zero-arg call
  expect(result?.code).toMatchInlineSnapshot(`...`);
});
```

- [ ] **Step 2: Update the "mixed zero-arg + options" test title and snapshot placeholder**

Find the test at approximately line 496:
```
'transforms options calls to a no-context factory while keeping zero-arg calls untouched'
```

Rename it and replace its `toMatchInlineSnapshot` argument with a placeholder so the update step fills it in:

```ts
it('transforms both zero-arg no-options and options calls to a no-context factory', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'qraft-tree-shaking-')
  );
  await writeFixtureFiles(root, {
    ...PRECREATED_BASE_FILES,
  });
  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const apiUtility = createAPIClient();
const apiWithClient = createAPIClient({ queryClient: {} });

apiUtility.pets.getPets.getQueryKey();
apiWithClient.pets.getPets.invalidateQueries();
apiWithClient.pets.getPets.setQueryData(undefined, () => undefined);
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  // apiUtility zero-arg: getQueryKey needs no options → transformed, no third arg
  // apiWithClient options: invalidateQueries + setQueryData → transformed with options
  // Both const declarations are removed; createAPIClient import is removed
  expect(result?.code).toMatchInlineSnapshot(`...`);
});
```

- [ ] **Step 3: Run the two updated tests to confirm they fail**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts \
  -t "transforms zero-arg no-options callbacks on a no-context factory" \
  -t "transforms both zero-arg no-options and options calls to a no-context factory"
```

Expected: FAIL — both return `null` / mismatched snapshots because the guard still skips all zero-arg no-context usages.

- [ ] **Step 4: Relax the skip guard in `plan.ts`**

In `createTransformPlan`, inside the second `traverse(ast, { CallExpression(callPath) { ... } })` block, find (approximately line 341):

```ts
      if (match.client.mode.type === 'context' && !generatedInfo.contextName) {
        return debugSkip(options, id, 'context client was not detected');
      }
```

Replace with:

```ts
      if (
        match.client.mode.type === 'context' &&
        !generatedInfo.contextName &&
        callbackNeedsRuntimeContext(match.callbackName)
      ) {
        return debugSkip(options, id, 'context client was not detected');
      }
```

`callbackNeedsRuntimeContext` is already imported in `plan.ts` from `'./callbacks.js'` (equivalent to `callbackNeedsOptions`). This allows callbacks that need no options (`getQueryKey`, `getMutationKey`, `getInfiniteQueryKey`) to pass through even when `contextName` is null.  The mutate phase already handles this correctly: `createOptimizedClientDeclaration` in `mutate.ts` only pushes a third argument when `callbackNeedsOptions` is true, so utility-only buckets emit `qraftAPIClient(op, { getQueryKey })` with no options arg.

- [ ] **Step 5: Run the two tests and update the snapshots**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts \
  -t "transforms zero-arg no-options callbacks on a no-context factory" \
  -t "transforms both zero-arg no-options and options calls to a no-context factory" \
  --update-snapshots
```

Expected: PASS. Verify the produced snapshots:

For `'transforms zero-arg no-options callbacks on a no-context factory'`, the snapshot should resemble:
```
"import { qraftAPIClient } from "@openapi-qraft/react";
import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
import { getPets } from "./api/services/PetsService";
const api_pets_getPets = qraftAPIClient(getPets, {
  getQueryKey
});
api_pets_getPets.getQueryKey();"
```

For `'transforms both zero-arg no-options and options calls to a no-context factory'`, confirm:
- `import { createAPIClient }` is removed
- `const apiUtility` and `const apiWithClient` declarations are removed
- `apiUtility_pets_getPets = qraftAPIClient(getPets, { getQueryKey })` — **no third arg**
- `apiWithClient_pets_getPets = qraftAPIClient(getPets, { invalidateQueries, setQueryData }, { queryClient: {} })`

- [ ] **Step 6: Run the full unit test suite**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/plan.ts \
        packages/tree-shaking-plugin/src/core.test.ts
git commit -m "fix(tree-shaking): transform zero-arg no-options callbacks on no-context factories"
```

---

### Task 3: Update e2e scenario assertions and verify the full bundler matrix

**Files:**
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`

**Context:**
After both plugin fixes:
- `node-api-helper-selection.ts` imports `createNodeAPIClient` from `'./generated-api'` (barrel), configured with `module: './generated-api/create-node-api-client'` (direct file). The barrel fix resolves this match.
- `nodeApiUtility = createNodeAPIClient()` zero-arg + `getQueryKey` → zero-arg fix transforms it.
- `nodeApi = createNodeAPIClient(nodeOptions)` options-based + `invalidateQueries`/`setQueryData` → barrel fix + existing options path transforms it.
- Both `createNodeAPIClient` factory references are eliminated → `allCallbacks` namespace import disappears from every bundle.

For `barrel-mixed-helper-selection.ts`:
- `createNodeAPIClient` is imported from `'./generated-api/create-node-api-client'` **directly** (not the barrel) — already matched before. The zero-arg fix enables `getQueryKey` to transform.

- [ ] **Step 1: Update `apiOnlyScenario` excludes and `node-api-helper-selection` includes in `shared.mjs`**

```js
// Replace the apiOnlyScenario function:
const apiOnlyScenario = ({ name, entry, include, exclude }) => ({
  name,
  mode: 'apiOnly',
  entry,
  include: unique([qraftAPIClientPattern, ...include]),
  exclude: unique([
    qraftReactAPIClientPattern,
    'allCallbacks',      // confirms the factory was fully eliminated
    'APIClientContext',
    ...exclude,
  ]),
});

// Replace the node-api-helper-selection scenario entry:
apiOnlyScenario({
  name: 'node-api-helper-selection',
  entry: 'src/node-api-helper-selection.ts',
  include: ['getQueryKey', 'invalidateQueries', 'setQueryData', 'getPets'],
  exclude: ['createNodeAPIClient'],
}),
```

Leave `barrel-mixed-helper-selection` unchanged (already correct after user rollback).

- [ ] **Step 2: Build the plugin and sync dist to the fixture**

```bash
# Build the plugin with the two fixes
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build

# Sync the fresh dist into the fixture's node_modules
cp -r packages/tree-shaking-plugin/dist/. \
    e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist/
```

- [ ] **Step 3: Build all bundler scenarios**

```bash
cd e2e/projects/tree-shaking-bundlers
npm run build
```

Expected: all 5 bundlers × 13 scenarios build without errors.  The `node-api-helper-selection` bundles must **not** contain `createNodeAPIClient` or `allCallbacks`.

- [ ] **Step 4: Run the bundle assertions**

```bash
npm run e2e:post-build
```

Expected output: `Tree-shaking bundle assertions passed.`

Key assertions to watch:
- `node-api-helper-selection`: includes `qraftAPIClient(`, `getQueryKey`, `invalidateQueries`, `setQueryData`, `getPets`; excludes `qraftReactAPIClient(`, `allCallbacks`, `createNodeAPIClient`, `APIClientContext`.
- `barrel-mixed-helper-selection`: includes `qraftAPIClient(`, `qraftReactAPIClient(`, `useQuery`, `getQueryKey`, `BarrelAPIClientContext`.
- All other context/precreated/mixed scenarios pass unchanged.

If the `node-api-helper-selection` source-map assertion fails (it checks that `qraftAPIClient(` maps back to `src/node-api-helper-selection.ts`), confirm both call sites (zero-arg client and options-based client) appear in the source map.

- [ ] **Step 5: Run the plugin typecheck**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add e2e/projects/tree-shaking-bundlers/scripts/shared.mjs
git commit -m "fix(e2e): update node-api-helper-selection assertions after barrel and zero-arg fixes"
```

- [ ] **Step 7: Optional — run the full e2e suite (slow, publishes to Verdaccio)**

Only needed to confirm the published package behaves identically to the local dist:

```bash
cd /Users/radist/WebstormProjects/qraft/e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: completes without assertion failures.
