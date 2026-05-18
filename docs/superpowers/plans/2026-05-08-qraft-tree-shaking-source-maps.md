# Qraft Tree-Shaking Source Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thread incoming bundler source maps through the tree-shaking transform so rewritten user call sites remain traceable to original source code.

**Architecture:** This spec builds on the pipeline split. `src/lib/plugin/create-qraft-tree-shake-plugin.ts` forwards `this.inputSourceMap` into `transformQraftTreeShaking` as part of the plugin contract. `src/core.ts` accepts the incoming map and passes it to Babel generator through `inputSourceMap`. The composition scope is intentionally narrow: only rewritten user call sites must resolve back to original source positions. Synthetic inserts at the top level or other generated-only regions may remain mapped to generated code if that keeps the implementation simple and predictable. Unit tests assert the composed map with `@jridgewell/trace-mapping`, while the external `tree-shaking-bundlers` fixture confirms the change does not break real bundler output.

**Tech Stack:** TypeScript, Babel generator, unplugin, `@jridgewell/trace-mapping`, Vitest, Yarn 4.

**File Structure:**
- `packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts` forwards `this.inputSourceMap` from the bundler context into the core transform.
- `packages/tree-shaking-plugin/src/core.ts` accepts an optional incoming map and passes it to Babel generator through `inputSourceMap`.
- `packages/tree-shaking-plugin/src/core.test.ts` adds the regression test, updates the local test helper to pass the optional map, and verifies the composed position with `@jridgewell/trace-mapping`.
- `packages/tree-shaking-plugin/package.json` and `yarn.lock` add the direct dev dependency required by the new test.
- `e2e/projects/tree-shaking-bundlers/` is not expected to change for this feature, but it is the external validation target.

---

### Task 1: Add the failing composed-map regression test

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/package.json`
- Modify: `yarn.lock`

- [x] **Step 1: Add a source-map test that traces the rewritten call site back to the original source**

Update the local test helper first so the new regression test can pass the incoming map through to the real transform:

```ts
async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: TransformOptions,
  inputSourceMap?: unknown
) {
  const fixtureRoot = path.dirname(path.dirname(id));
  const fixtureResolver = createFixtureResolver(fixtureRoot);
  const resolver = async (specifier: string, importer: string) => {
    if (options.resolve) {
      try {
        const resolved = await options.resolve(specifier, importer);
        if (resolved) return resolved;
      } catch {
        // Fall through to the fixture resolver.
      }
    }

    return fixtureResolver(specifier, importer);
  };

  return transformQraftTreeShakingImpl(
    code,
    id,
    options,
    resolver,
    inputSourceMap
  );
}
```

```ts
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';

it('keeps a rewritten user call site traceable through an incoming source map', async () => {
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

- [x] **Step 2: Add `@jridgewell/trace-mapping` as a direct dev dependency**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin add -D @jridgewell/trace-mapping
```

Expected: `packages/tree-shaking-plugin/package.json` and `yarn.lock` now list `@jridgewell/trace-mapping` directly, so the new test can compile under Yarn PnP.

- [x] **Step 3: Run the focused test before plumbing exists and confirm it fails**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "keeps a rewritten user call site traceable through an incoming source map"
```

Expected: FAIL because the incoming bundler map is not threaded into the transform yet, so the composed-map assertion still points at generated-only positions.

### Task 2: Thread the incoming map through the plugin and generator

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Pass `this.inputSourceMap` from the unplugin wrapper into the core transform**

The wrapper should keep using the current resolver creation logic, but it must forward the incoming map:

```ts
handler(this: any, code, id) {
  const resolver = createResolver(this, options.resolve);
  return transformQraftTreeShaking(code, id, options, resolver, this.inputSourceMap);
}
```

- [x] **Step 2: Extend the core transform signature and pass the incoming map into Babel generator**

Update `packages/tree-shaking-plugin/src/core.ts` so the function accepts the optional map and forwards it unchanged:

```ts
export async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  resolver: QraftResolver = createAgnosticResolver(options.resolve),
  inputSourceMap?: unknown
) {
  // ...
  const result = generate(ast, {
    sourceMaps: true,
    sourceFileName: id,
    inputSourceMap,
    jsescOption: { minimal: true },
  });
}
```

Keep the rest of the transform unchanged. This spec is only about source-map composition for rewritten user call sites; synthetic generated statements do not need bespoke original-source mapping.

- [x] **Step 3: Re-run the focused source-map test**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/core.test.ts -t "keeps a rewritten user call site traceable through an incoming source map"
```

Expected: PASS, with `originalPositionFor(...)` resolving to the original `api.pets.getPets.useQuery()` call.

- [x] **Step 4: Run the package suite, typecheck, and the external e2e checkpoint**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: all three checks pass and the external fixture still builds through every bundler.

- [x] **Step 5: Commit the source-map plumbing**

```bash
git add packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/package.json yarn.lock
git commit -m "feat: compose tree-shaking source maps"
```

---
