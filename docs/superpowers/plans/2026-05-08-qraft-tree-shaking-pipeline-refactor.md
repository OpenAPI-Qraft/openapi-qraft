# Qraft Tree-Shaking Pipeline Refactor and Source Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (preferred) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the tree-shaking transform into an explicit pipeline, add composed source map support, and make path rendering conventions consistent without changing the public plugin contract.

**Architecture:** Keep `src/core.ts` as the orchestration entrypoint, but move resolution, planning, mutation, and path rendering into focused internal helpers under `src/lib/transform/`. Thread bundler `inputSourceMap` through the plugin wrapper into Babel generator output. Use a mixed source-map policy: rewritten call-site expressions should stay traceable to the original user code, while synthetic imports and helper declarations are treated as generated support code.

**Tech Stack:** TypeScript, Babel parser/traverse/types/generator, unplugin, Vitest, Yarn 4, `@jridgewell/trace-mapping` for source-map assertions.

---

### Task 1: Thread bundler source maps into the transform and pin call-site tracing

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/package.json`
- Modify: `yarn.lock`

- [ ] **Step 1: Add the failing source-map regression test**

Add a test that transforms a small named-client fixture and then traces the generated `api_pets_getPets.useQuery()` call back to the original source position with `@jridgewell/trace-mapping`.

```ts
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';

it('keeps the rewritten call site traceable through the composed source map', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result).toBeTruthy();
  expect(result?.map).toBeTruthy();

  const generatedLine =
    result!.code.split('\n').findIndex((line) => line.includes('api_pets_getPets.useQuery()')) + 1;
  const generatedColumn = result!.code
    .split('\n')
    [generatedLine - 1].indexOf('api_pets_getPets');

  const traced = originalPositionFor(new TraceMap(result!.map!), {
    line: generatedLine,
    column: generatedColumn,
  });

  expect(traced.source).toBe(sourceFile);
  expect(traced.line).toBe(7);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because `inputSourceMap` is not threaded yet**

Run:
```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "keeps the rewritten call site traceable through the composed source map"
```

Expected: the new assertion fails because the generated map cannot yet be composed with an incoming bundler map.

- [ ] **Step 3: Pass `inputSourceMap` from unplugin into `transformQraftTreeShaking` and Babel generator**

Update the plugin wrapper to forward `this.inputSourceMap` into the core transform call, and update the transform signature so the final generator call composes maps:

```ts
const result = generate(ast, {
  sourceMaps: true,
  sourceFileName: id,
  inputSourceMap,
  jsescOption: { minimal: true },
});
```

Keep the public plugin options unchanged; this is a runtime plumbing change, not a new user-facing option.

- [ ] **Step 4: Re-run the focused test and confirm the traced call site now resolves to the original source**

Run:
```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "keeps the rewritten call site traceable through the composed source map"
```

Expected: PASS, with `originalPositionFor(...)` resolving back to the original `api.pets.getPets.useQuery()` line.

- [ ] **Step 5: Commit the source-map plumbing change**

```bash
git add packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/package.json yarn.lock
git commit -m "feat: compose tree-shaking source maps"
```

---

### Task 2: Extract path rendering rules into a focused helper and document the convention

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/path-rendering.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/README.md`

- [ ] **Step 1: Add a failing helper test for relative import rendering**

Create a small helper test that pins the current convention:

```ts
import {
  composeResolvedSourceImportPath,
  resolvePrecreatedOptionsImportPath,
} from './path-rendering.js';

it('renders relative source imports without source extensions or /index', () => {
  expect(
    composeResolvedSourceImportPath('/src/App.tsx', '/src/api/index.ts')
  ).toBe('./api');
  expect(
    composeResolvedSourceImportPath('/src/App.tsx', '/src/api/client.tsx')
  ).toBe('./api/client');
  expect(
    resolvePrecreatedOptionsImportPath(
      '/src/App.tsx',
      './client-options',
      '/src/client-options/index.ts'
    )
  ).toBe('./client-options');
});
```

- [ ] **Step 2: Run the helper test and confirm it fails because the new helper file does not exist**

Run:
```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/lib/transform/path-rendering.test.ts
```

Expected: FAIL because the helper module has not been extracted yet.

- [ ] **Step 3: Move the path rendering helpers out of `core.ts` into `path-rendering.ts`**

Move the current implementations of `composeImportPath`, `resolveRelativeImportPath`, `composeResolvedSourceImportPath`, `resolvePrecreatedOptionsImportPath`, `normalizeResolvedId`, `stripQueryAndHash`, `stripSourceExtension`, and `stripIndexSourceExtension` into `src/lib/transform/path-rendering.ts` unchanged except for imports and exports. `core.ts` should stop owning any path normalization logic.

Update `core.ts` to import these helpers instead of owning them locally.

- [ ] **Step 4: Re-run the helper test and one representative core snapshot**

Run:
```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/lib/transform/path-rendering.test.ts src/core.test.ts -t "renders relative source imports without source extensions or /index"
```

Expected: PASS, and the existing tree-shaking snapshots still render relative imports in the same bundler-friendly form.

- [ ] **Step 5: Add a short README note that explains the path convention**

Add a brief source-path section to `README.md` that states:

```md
Relative generated imports are emitted without source extensions or `/index` so the output stays bundler-friendly.
Bare module specifiers are preserved as-is.
```

- [ ] **Step 6: Commit the path-rendering extraction**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/path-rendering.ts packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/README.md
git commit -m "refactor: centralize tree-shaking path rendering"
```

---

### Task 3: Split the transform into explicit planning and mutation phases

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/plan.test.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Add a small plan-level test that exercises named and inline clients through the new planner**

Create a focused test for the new planning boundary. The test should call `createTransformPlan(...)` directly and assert that the plan contains one named client and one inline usage in the same file. Keep the existing precreated-client tests as the regression backstop for that branch of the pipeline.

```ts
import { createTransformPlan } from './plan.js';

it('collects clients, inline usages, and generated info in one plan', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');
  const code = `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  api.pets.getPets.useQuery();
  createAPIClient().pets.findPetsByStatus.invalidateQueries();
}
`;

  const plan = await createTransformPlan(code, sourceFile, {
    createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
  });
  expect(plan.namedUsages).toHaveLength(1);
  expect(plan.inlineUsages).toHaveLength(1);
});
```

- [ ] **Step 2: Run the new planner test and confirm it fails before the helper exists**

Run:
```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/lib/transform/plan.test.ts -t "collects clients, inline usages, and generated info in one plan"
```

Expected: FAIL because `createTransformPlan` and the new plan types are not present yet.

- [ ] **Step 3: Move analysis and resolution logic into `plan.ts` and move AST mutation into `mutate.ts`**

The planner should own the following responsibilities and default to `createAgnosticResolver(options.resolve)` when `resolver` is omitted, so the new planner test can call it directly while `core.ts` still passes the bundler-aware resolver explicitly:

```ts
export type TransformPlan = {
  ast: t.File;
  clients: ClientBinding[];
  namedUsages: OperationUsage[];
  inlineUsages: InlineImportRequest[];
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>;
  generatedInfoRequests: Map<string, GeneratedInfoRequest>;
  transformedReferenceKeys: Set<string>;
  localClientNamesByOperation: Map<string, string>;
};

export async function createTransformPlan(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  resolver?: QraftResolver
): Promise<TransformPlan>
```

The mutator should own the AST write path:

```ts
export function applyTransformPlan(
  plan: TransformPlan,
  runtimeLocalNames: RuntimeLocalNames
): void
```

Keep the hot-path `localClientNamesByOperation` map in the planner so the transform does not fall back to repeated scans.

- [ ] **Step 4: Re-run the full package unit suite and typecheck**

Run:
```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: all existing snapshots still pass, with only intentional ordering or wording changes updated in `core.test.ts`.

- [ ] **Step 5: Commit the pipeline split**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts packages/tree-shaking-plugin/src/lib/transform/mutate.ts packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/src/core.test.ts
git commit -m "refactor: split tree-shaking transform pipeline"
```

---

### Task 4: Refresh the external e2e contract and run the full verification loop

**Files:**
- Modify if needed: `e2e/projects/tree-shaking-bundlers/src/*.ts`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/src/generated-api/*.ts`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/scripts/scenarios.mjs`
- Modify if needed: `e2e/projects/tree-shaking-bundlers/package.json`

- [ ] **Step 1: Run the workspace build and refresh the private-registry e2e fixture**

Use this path only when the package install surface changes, for example when `packages/tree-shaking-plugin/package.json`, workspace dependency wiring, or `yarn.lock` changes affect what the e2e project installs. If only source files changed, skip directly to the fast local validation path below.

From the repo root:

```bash
yarn build --filter "@openapi-qraft/*" --filter "@qraft/"
```

Then from `./e2e`:

```bash
yarn e2e:unpublish-from-private-registry || true
yarn e2e:publish-to-private-registry
yarn e2e:update-projects-from-private-registry
```

Expected: the generated e2e project uses the freshly built tree-shaking plugin package.

- [ ] **Step 2: Refresh the installed plugin `dist/` with a symlink for fast local validation**

This is the normal fast loop for source-only changes. After the e2e project has the package installed once, replace the copied plugin `dist/` directory with a symlink to the repo build output:

```bash
ROOT="$(git rev-parse --show-toplevel)"
rm -rf "$ROOT/e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist"
ln -s "$ROOT/packages/tree-shaking-plugin/dist" "$ROOT/e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist"
```

Expected: the e2e project resolves the plugin directly from the local repo build, so source changes can be tested immediately without republishing the package.

- [ ] **Step 3: Rebuild the standalone e2e project with npm and inspect the emitted `dist/` output**

From the standalone `tree-shaking-bundlers` e2e checkout that mirrors the current branch:

```bash
cd <path-to-tree-shaking-bundlers-e2e-checkout>
npm run e2e:pre-build
npm run build
npm run e2e:post-build
```

Expected: the `dist/<bundler>/<scenario>/` outputs reflect the refactored transform and the source-map pipeline does not break bundler builds.

- [ ] **Step 4: Update any e2e scenario expectations only if the emitted output actually changes**

If the refactor changes import ordering, helper placement, or inline-client output shape, update the corresponding scenario fixtures and `assert-dist.mjs` expectations together. Do not edit the generated `dist/` outputs by hand if the scripts can regenerate them.

- [ ] **Step 5: Run the final verification set**

Run:
```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

If the e2e fixture changed, repeat the external build once more after the updated fixture is published:

```bash
cd /Users/radist/w/qraft-e2e/tree-shaking-bundlers
npm run e2e:pre-build
npm run build
npm run e2e:post-build
```

Expected: package unit tests, typecheck, and the external bundler fixture all pass with the new pipeline and source-map behavior.

- [ ] **Step 6: Commit any remaining contract updates**

```bash
git add e2e/projects/tree-shaking-bundlers packages/tree-shaking-plugin
git commit -m "test: refresh tree-shaking e2e contract"
```
