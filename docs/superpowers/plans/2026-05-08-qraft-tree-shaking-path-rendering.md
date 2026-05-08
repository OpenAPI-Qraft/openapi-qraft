# Qraft Tree-Shaking Path Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. When spawning workers, prefer a mini model and keep `reasoning_effort` at `high` or lower. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the import-path rendering rules out of `src/core.ts` so path normalization lives in one focused helper module, while keeping emitted import strings unchanged.

**Architecture:** This spec depends on the earlier pipeline split and source-map work. `src/lib/transform/path-rendering.ts` owns `composeImportPath`, `resolveRelativeImportPath`, `composeResolvedSourceImportPath`, `resolvePrecreatedOptionsImportPath`, `normalizeResolvedId`, `stripQueryAndHash`, `stripSourceExtension`, and `stripIndexSourceExtension`. `src/core.ts` imports those helpers instead of reimplementing path logic. `README.md` gets a short convention note so the output format stays documented.

**Tech Stack:** TypeScript, Node `path`, Vitest, Yarn 4.

---

### Task 1: Add helper-level tests that pin the rendering rules

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`

- [ ] **Step 1: Write the helper test before the new module exists**

```ts
import {
  composeImportPath,
  composeResolvedSourceImportPath,
  resolvePrecreatedOptionsImportPath,
} from './path-rendering.js';

it('renders relative source imports without source extensions or /index', () => {
  expect(composeResolvedSourceImportPath('/src/App.tsx', '/src/api/index.ts')).toBe('./api');
  expect(composeResolvedSourceImportPath('/src/App.tsx', '/src/api/client.tsx')).toBe('./api/client');
  expect(
    resolvePrecreatedOptionsImportPath('/src/App.tsx', './client-options', '/src/client-options/index.ts')
  ).toBe('./client-options');
  expect(composeImportPath('/src/App.tsx', '@openapi-qraft/react')).toBe('@openapi-qraft/react');
});
```

- [ ] **Step 2: Run the helper test and confirm it fails because the module has not been extracted yet**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/lib/transform/path-rendering.test.ts
```

Expected: FAIL because `path-rendering.ts` does not exist yet.

- [ ] **Step 3: Add the helper module and move the path logic out of `core.ts`**

Move these functions unchanged except for imports and exports, and update `core.ts` to import them from the new module:

```ts
import {
  composeImportPath,
  composeResolvedSourceImportPath,
  normalizeResolvedId,
  resolvePrecreatedOptionsImportPath,
  resolveRelativeImportPath,
  stripIndexSourceExtension,
  stripQueryAndHash,
  stripSourceExtension,
} from './lib/transform/path-rendering.js';
```

- [ ] **Step 4: Re-run the helper test and one representative core snapshot**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test -- src/lib/transform/path-rendering.test.ts src/core.test.ts -t "renders relative source imports without source extensions or /index"
```

Expected: PASS, and the representative tree-shaking snapshot still emits the same bundler-friendly relative imports.

### Task 2: Document the convention and validate the external fixture

**Files:**
- Modify: `packages/tree-shaking-plugin/README.md`
- Modify: `packages/tree-shaking-plugin/src/core.ts`

- [ ] **Step 1: Add a short README note for the rendering rule**

Add this note near the options or path-convention section:

```md
Relative generated imports are emitted without source extensions or `/index` so the output stays bundler-friendly.
Bare module specifiers are preserved as-is.
```

- [ ] **Step 2: Run the package unit suite and typecheck**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both commands pass after the helper extraction.

- [ ] **Step 3: Run the external tree-shaking e2e checkpoint**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: the external multi-bundler fixture still produces the same output shape and the path strings remain bundler-friendly.

- [ ] **Step 4: Commit the extraction**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/path-rendering.ts packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/README.md
git commit -m "refactor: centralize tree-shaking path rendering"
```

---
