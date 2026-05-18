# Qraft Tree-Shaking Client Helper Selection E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the helper-selection split from `2026-05-10-qraft-tree-shaking-client-helper-selection-unit-tests.md` in the bundler fixture by adding a Node no-context helper case and a mixed-helper bundle case.

**Architecture:** This plan is the follow-up to `docs/superpowers/plans/2026-05-10-qraft-tree-shaking-client-helper-selection-unit-tests.md`. It assumes the unit-test plan has already landed, so the bundler fixture can rely on the new `qraftAPIClient` / `qraftReactAPIClient` split and only needs to validate emitted bundle shape, scenario wiring, and source-map pins. The e2e coverage stays in this separate plan so the unit-only implementation can be reviewed and shipped independently first.

**Tech Stack:** TypeScript, bundler e2e fixture, shell scripts, source maps, Yarn 4.

---

### File Structure

- `e2e/projects/tree-shaking-bundlers/package.json`: codegen entry for the no-context Node helper.
- `e2e/projects/tree-shaking-bundlers/src/node-api-helper-selection.ts`: no-context Node fixture using `createNodeAPIClient`.
- `e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts`: mixed helper fixture that keeps both `qraftAPIClient` and `qraftReactAPIClient` visible in one bundle.
- `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`: scenario registration for the new Node and mixed bundle cases, plus `createNodeAPIClient` wiring in the transform config.
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`: bundle-token expectations for `qraftAPIClient`-only and mixed helper output.

### Task 1: Add the new fixture entries before changing the assertions

**Files:**

- Modify: `e2e/projects/tree-shaking-bundlers/package.json`
- Add: `e2e/projects/tree-shaking-bundlers/src/node-api-helper-selection.ts`
- Add: `e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`

- [ ] **Step 1: Add `createNodeAPIClient` to the fixture codegen command**

Update the codegen command so it generates a real no-context helper alongside the existing context-bearing helpers:

```json
"codegen": "openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript ./openapi.yaml --clean -o src/generated-api --openapi-types-import-path '../schema.ts' --openapi-types-file-name schema.ts --explicit-import-extensions --create-api-client-fn createBarrelAPIClient filename:create-barrel-api-client context:BarrelAPIClientContext --create-api-client-fn createNodeAPIClient filename:create-node-api-client --create-api-client-fn createRelativeAPIClient filename:create-relative-api-client context:RelativeAPIClientContext --create-api-client-fn createRelativeExtAPIClient filename:create-relative-ts-api-client context:RelativeExtAPIClientContext --create-api-client-fn createAliasAPIClient filename:create-alias-api-client context:AliasAPIClientContext --create-api-client-fn createAliasDirectAPIClient filename:create-alias-direct-api-client context:AliasDirectAPIClientContext --create-api-client-fn createBarrelPrecreatedAPIClient filename:create-barrel-precreated-api-client --create-api-client-fn createRelativePrecreatedAPIClient filename:create-relative-precreated-api-client --create-api-client-fn createRelativeExtPrecreatedAPIClient filename:create-relative-ts-precreated-api-client --create-api-client-fn createAliasDirectPrecreatedAPIClient filename:create-alias-direct-precreated-api-client"
```

Add a Node fixture that exercises both the zero-arg and explicit-options forms of the no-context helper:

```ts
// src/node-api-helper-selection.ts
import type { CreateAPIClientOptions } from '@openapi-qraft/react';
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';
import { createNodeAPIClient } from './generated-api';

const nodeOptions = {
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
} satisfies CreateAPIClientOptions;

const nodeApiUtility = createNodeAPIClient();
const nodeApi = createNodeAPIClient(nodeOptions);

export const result = [
  nodeApiUtility.pets.findPetsByStatus.getQueryKey(),
  nodeApi.pets.findPetsByStatus.invalidateQueries(),
  nodeApi.pets.findPetsByStatus.setQueryData({ path: { petId: 1 } }, { id: 1 }),
];
```

Add `createNodeAPIClient` to the `createAPIClientFn` export in `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs` without a `context` field, so the transform treats it as a no-context factory and can emit `qraftAPIClient` for it.

Add a second fixture that keeps the mixed helper split easy to read:

```ts
// src/barrel-mixed-helper-selection.ts
import { createBarrelAPIClient } from './generated-api';

const api = createBarrelAPIClient();

export const result = [
  api.pets.findPetsByStatus.invalidateQueries(),
  api.pets.findPetsByStatus.setQueryData({ path: { petId: 1 } }, { id: 1 }),
  api.pets.getPets.useQuery(),
];
```

Add both files to the `scenarios` array in `scripts/shared.mjs`.

- [ ] **Step 2: Extend the scenario mode expectations for API-only output**

Teach `assert-dist.mjs` about the new no-context mode so the Node-only bundle explicitly excludes `qraftReactAPIClient` and the mixed bundle proves both helpers can coexist:

```js
const modeExpectations = {
  context: () => ({
    include: [/qraftReactAPIClient(?:__|\()/],
    exclude: [/qraftAPIClient(?:__|\()/],
  }),
  precreated: () => ({
    include: [/qraftAPIClient(?:__|\()/],
    exclude: [/qraftReactAPIClient(?:__|\()/],
  }),
  mixed: () => ({
    include: [/qraftReactAPIClient(?:__|\()/, /qraftAPIClient(?:__|\()/],
    exclude: [],
  }),
  apiOnly: () => ({
    include: [/qraftAPIClient(?:__|\()/],
    exclude: [/qraftReactAPIClient(?:__|\()/, /APIClientContext/],
  }),
};
```

Add a source-map assertion for the Node-only scenario so the emitted `qraftAPIClient(` token maps back to `src/node-api-helper-selection.ts`.

Add two source-map assertions for the mixed scenario so both `qraftAPIClient(` and `qraftReactAPIClient(` map back to `src/barrel-mixed-helper-selection.ts`.

- [ ] **Step 3: Run the bundler matrix and confirm the new exact bundle shape**

Run:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

This local runner copies `e2e/projects/tree-shaking-bundlers` into `/Users/radist/w/qraft-e2e`, regenerates the fixture with `npm run codegen`, builds the bundlers through `scripts/build.mjs`, and then runs `scripts/assert-dist.mjs` against the generated outputs.

If you need faster local iteration inside the fixture, run the project directly:

```bash
cd e2e/projects/tree-shaking-bundlers
npm run e2e:pre-build
npm exec tsc -- --noEmit
npm run build
npm run e2e:post-build
```

Expected:

- `node-api-helper-selection` includes `qraftAPIClient(` and excludes `qraftReactAPIClient(` and `APIClientContext`
- `barrel-mixed-helper-selection` includes both helpers in the same bundle
- the existing context and precreated scenarios still pass unchanged

- [ ] **Step 4: Commit the e2e coverage**

```bash
git add e2e/projects/tree-shaking-bundlers/package.json e2e/projects/tree-shaking-bundlers/src/node-api-helper-selection.ts e2e/projects/tree-shaking-bundlers/src/barrel-mixed-helper-selection.ts e2e/projects/tree-shaking-bundlers/scripts/shared.mjs e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs
git commit -m "test: cover qraft API client helper selection in e2e"
```

### Final Verification

After the unit plan is complete and the e2e plan has landed, run the local bundle check once more:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

If the bundle matrix stays green, the e2e plan is done and can be handed off for review.
