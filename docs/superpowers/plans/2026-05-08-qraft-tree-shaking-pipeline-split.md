# Qraft Tree-Shaking Pipeline Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `transformQraftTreeShaking` into explicit planning and mutation phases without changing emitted code or public plugin options.

**Architecture:** `src/core.ts` stays the orchestration entrypoint. `src/lib/transform/plan.ts` owns parsing, resolution, usage collection, and plan construction. `src/lib/transform/mutate.ts` owns AST writes and import insertion. `src/lib/transform/types.ts` holds the shared shapes so the plan and mutator can evolve without circular imports. This spec does not change source-map composition or path rendering rules.

**Tech Stack:** TypeScript, Babel parser/traverse/types/generator, unplugin, Vitest, Yarn 4.

---

### Task 1: Introduce the planner boundary with a failing contract test

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Add a planner test that fails before the new module exists**

```ts
import { createTransformPlan } from './lib/transform/plan.js';

it('collects named and inline usages in one transform plan', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const plan = await createTransformPlan(
    `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  api.pets.getPets.useQuery();
  createAPIClient().pets.findPetsByStatus.invalidateQueries();
}
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(plan.namedUsages).toHaveLength(1);
  expect(plan.inlineUsages).toHaveLength(1);
});
```

- [x] **Step 2: Run the targeted test and confirm the planner is missing**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "collects named and inline usages in one transform plan"
```

Expected: FAIL because `createTransformPlan` and the shared plan types do not exist yet.

- [x] **Step 3: Add the shared plan types and the planner implementation**

Use this shape for the new boundary:

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
): Promise<TransformPlan>;
```

Keep the planner responsible for discovery, resolution, and bookkeeping only. Do not move source-map composition or path rendering into this spec.

- [x] **Step 4: Re-run the targeted test and confirm the new boundary is real**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "collects named and inline usages in one transform plan"
```

Expected: PASS.

### Task 2: Move AST mutation out of `core.ts`

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Add a regression snapshot that exercises the public transform after the refactor**

Keep one representative snapshot in `core.test.ts` that still proves the emitted tree-shaking output is unchanged for a named client.

```ts
expect(result?.code).toMatchInlineSnapshot(`
  "import { qraftReactAPIClient } from "@openapi-qraft/react";
  import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
  import { getPets } from "./api/services/PetsService";
  import { APIClientContext } from "./api/APIClientContext";
  const api_pets_getPets = qraftReactAPIClient(getPets, {
    useQuery
  }, APIClientContext);
  export function App() {
    return api_pets_getPets.useQuery();
  }"
`);
```

- [x] **Step 2: Move the write path into `applyTransformPlan` and keep `core.ts` as orchestration only**

Use this mutator boundary:

```ts
export function applyTransformPlan(
  plan: TransformPlan,
  runtimeLocalNames: RuntimeLocalNames
): void;
```

`src/core.ts` should parse, build a plan, apply it, and generate code. The AST write path belongs in `mutate.ts`, not in `core.ts`.

- [x] **Step 3: Run the package unit suite and typecheck**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both commands pass with the refactor in place.

- [x] **Step 4: Run the external tree-shaking e2e checkpoint**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: the local multi-bundler fixture still publishes, updates, builds, and unpublishes cleanly with the same emitted contract.

- [x] **Step 5: Commit the split**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts packages/tree-shaking-plugin/src/lib/transform/mutate.ts packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/src/core.test.ts
git commit -m "refactor: split tree-shaking pipeline"
```

---

**Status:** completed and validated with package `lint`, `test`, `typecheck`, and external `e2e:tree-shaking-bundlers-local`.
