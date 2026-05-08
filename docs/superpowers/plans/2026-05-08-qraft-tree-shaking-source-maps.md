# Qraft Tree-Shaking Source Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thread incoming bundler source maps through the tree-shaking transform so rewritten call sites remain traceable to original user code.

**Architecture:** This spec builds on the pipeline split. `src/lib/plugin/create-qraft-tree-shake-plugin.ts` forwards `this.inputSourceMap` into `transformQraftTreeShaking`. `src/core.ts` accepts the incoming map and passes it to Babel generator through `inputSourceMap`. Unit tests assert the composed map with `@jridgewell/trace-mapping`, while the external `tree-shaking-bundlers` fixture confirms the change does not break real bundler output.

**Tech Stack:** TypeScript, Babel generator, unplugin, `@jridgewell/trace-mapping`, Vitest, Yarn 4.

---

### Task 1: Add the failing composed-map regression test

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/package.json`
- Modify: `yarn.lock`

- [ ] **Step 1: Add a source-map test that traces the rewritten call site back to the original source**

```ts
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';

it('keeps the rewritten call site traceable through the composed source map', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');
  const originalCode = `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`;
  const inputSourceMap = {
    version: 3,
    file: sourceFile,
    sources: [sourceFile],
    sourcesContent: [originalCode],
    names: [],
    mappings: 'AAAA',
  };

  const result = await transformQraftTreeShaking(
    originalCode,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] },
    undefined,
    inputSourceMap
  );

  const generatedLine =
    result!.code.split('\n').findIndex((line) => line.includes('api_pets_getPets.useQuery()')) + 1;
  const generatedColumn = result!.code.split('\n')[generatedLine - 1].indexOf('api_pets_getPets');

  const traced = originalPositionFor(new TraceMap(result!.map!), {
    line: generatedLine,
    column: generatedColumn,
  });

  expect(traced.source).toBe(sourceFile);
  expect(traced.line).toBe(7);
});
```

- [ ] **Step 2: Run the focused test before plumbing exists and confirm it fails**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "keeps the rewritten call site traceable through the composed source map"
```

Expected: FAIL because the incoming bundler map is not threaded into the transform yet.

- [ ] **Step 3: Record the dependency update**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin add -D @jridgewell/trace-mapping
```

Expected: the package manifest and lockfile both include the source-map assertion dependency.

### Task 2: Thread the incoming map through the plugin and generator

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Pass `this.inputSourceMap` from the unplugin wrapper into the core transform**

The wrapper should keep using the current resolver creation logic, but it must forward the incoming map:

```ts
handler(this: any, code, id) {
  const resolver = createResolver(this, options.resolve);
  return transformQraftTreeShaking(code, id, options, resolver, this.inputSourceMap);
}
```

- [ ] **Step 2: Pass the incoming map into Babel generator**

Use this generator call in `src/core.ts`:

```ts
const result = generate(ast, {
  sourceMaps: true,
  sourceFileName: id,
  inputSourceMap,
  jsescOption: { minimal: true },
});
```

Keep the rest of the transform unchanged. This spec is only about source-map composition.

- [ ] **Step 3: Re-run the focused source-map test**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "keeps the rewritten call site traceable through the composed source map"
```

Expected: PASS, with `originalPositionFor(...)` resolving to the original `api.pets.getPets.useQuery()` call.

- [ ] **Step 4: Run the package suite, typecheck, and the external e2e checkpoint**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: all three checks pass and the external fixture still builds through every bundler.

- [ ] **Step 5: Commit the source-map plumbing**

```bash
git add packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/package.json yarn.lock
git commit -m "feat: compose tree-shaking source maps"
```

---
