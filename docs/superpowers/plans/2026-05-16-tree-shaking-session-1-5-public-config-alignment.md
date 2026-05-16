# Tree-Shaking Session 1.5 Public Config Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old public `createAPIClientFn` / `apiClient` config shape with a single `entrypoints` public API that matches the normalized entrypoint model.

**Architecture:** Keep `normalizeEntrypoints()` as the only config boundary, but change its input from legacy flat fields to discriminated entrypoint objects. This is a breaking public config change and should happen before Session 2 wires source gating and generated metadata into runtime behavior.

**Tech Stack:** TypeScript, Vitest, README docs, tree-shaking-bundlers e2e fixture.

---

## Source Documents

- Master plan: `docs/superpowers/plans/2026-05-16-tree-shaking-plugin-pipeline-architecture.md`
- Design spec: `docs/superpowers/specs/2026-05-16-tree-shaking-plugin-pipeline-architecture-design.md`
- Session 1 prerequisite: `docs/superpowers/plans/2026-05-16-tree-shaking-session-1-diagnostics-config-normalization.md`

Use the master plan as the source for implementation context, but treat this
plan as the source of truth for public config naming:

- Session 1 Task 2: `Normalize Public Config Into Entrypoints`
- Milestone A: `Diagnostics And Config Normalization E2E Gate`

Translate any old public config snippets from the master plan or Session 1
through this plan's `entrypoints` contract before implementing them.

## Public Contract

Use one `entrypoints` array with explicit module-export targets:

```ts
type ModuleExportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

type ReactContextTarget = {
  exportName: string;
  moduleSpecifier?: string;
};

type QraftClientFactoryEntrypointConfig = {
  kind: 'clientFactory';
  factory: ModuleExportTarget;
  reactContext?: ReactContextTarget;
};

type QraftPrecreatedClientEntrypointConfig = {
  kind: 'precreatedClient';
  client: ModuleExportTarget;
  factory: ModuleExportTarget;
  optionsFactory: ModuleExportTarget;
};

type QraftEntrypointConfig =
  | QraftClientFactoryEntrypointConfig
  | QraftPrecreatedClientEntrypointConfig;

type QraftTreeShakeOptions = {
  entrypoints?: QraftEntrypointConfig[];
  diagnostics?: DiagnosticsLevel;
};
```

Example:

```ts
qraftTreeShakeVite({
  entrypoints: [
    {
      kind: 'clientFactory',
      factory: {
        exportName: 'createReactAPIClient',
        moduleSpecifier: './api',
      },
      reactContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: './api/APIClientContext',
      },
    },
    {
      kind: 'precreatedClient',
      client: {
        exportName: 'nodeAPIClient',
        moduleSpecifier: './client',
      },
      factory: {
        exportName: 'createNodeAPIClient',
        moduleSpecifier: './create-node-api-client',
      },
      optionsFactory: {
        exportName: 'createNodeAPIClientOptions',
        moduleSpecifier: './client-options',
      },
    },
  ],
});
```

Naming decisions:

- `entrypoints` is the only public top-level collection because both modes are
  plugin entrypoints into app/generated code;
- `kind: 'clientFactory'` replaces public `createAPIClientFn` naming because
  users configure a client factory import, not a generator implementation detail;
- `kind: 'precreatedClient'` keeps the established runtime concept;
- `factory`, `client`, `reactContext`, and `optionsFactory` mirror the internal
  normalized model.

Normalization rules:

- `entrypoints[].kind === 'clientFactory'` maps to internal `kind: 'generatedFactory'`;
- `clientFactory.factory` maps directly to `GeneratedFactoryEntrypoint.factory`;
- `clientFactory.reactContext` maps to `GeneratedFactoryEntrypoint.reactContext`;
- if `reactContext.moduleSpecifier` is omitted, normalize it to `null`;
- if `reactContext` is omitted, normalize it to `null`;
- `entrypoints[].kind === 'precreatedClient'` maps to internal `kind: 'precreatedClient'`;
- `precreatedClient.client`, `.factory`, and `.optionsFactory` map directly to the normalized precreated entrypoint;
- do not carry raw public config as `legacyConfig`;
- do not keep `createAPIClientFn` / `apiClient` compatibility aliases in the final public type for this branch.

## Files

- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/*.test.ts`
- Modify: `packages/tree-shaking-plugin/README.md`
- Modify: `e2e/projects/tree-shaking-bundlers/**/*.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/**/*.mjs`
- Modify: `docs/superpowers/plans/2026-05-16-tree-shaking-session-2-source-gate-generated-metadata.md`
- Modify: `docs/superpowers/plans/2026-05-16-tree-shaking-session-3-planner-mutator-normalized-model.md`

## Task 1: Update Public Types And Normalizer Tests

- [ ] **Step 1: Add the new public target types**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, replace the public config types with:

```ts
export type ModuleExportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

export type ReactContextTarget = {
  exportName: string;
  moduleSpecifier?: string;
};

export type QraftClientFactoryEntrypointConfig = {
  kind: 'clientFactory';
  factory: ModuleExportTarget;
  reactContext?: ReactContextTarget;
};

export type QraftPrecreatedClientEntrypointConfig = {
  kind: 'precreatedClient';
  client: ModuleExportTarget;
  factory: ModuleExportTarget;
  optionsFactory: ModuleExportTarget;
};

export type QraftEntrypointConfig =
  | QraftClientFactoryEntrypointConfig
  | QraftPrecreatedClientEntrypointConfig;
```

Keep the normalized internal `ReactContextConfig` as:

```ts
export type ReactContextConfig = {
  exportName: string;
  moduleSpecifier: string | null;
};
```

- [ ] **Step 2: Rename option fields in `QraftTreeShakeOptions`**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, replace:

```ts
createAPIClientFn?: QraftFactoryConfig[];
apiClient?: QraftPrecreatedClientConfig[];
```

with:

```ts
entrypoints?: QraftEntrypointConfig[];
```

Make the same public option change in `packages/tree-shaking-plugin/src/core.ts`.

- [ ] **Step 3: Update normalizer tests first**

In `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`, change the fixtures to the new public shape.

Client factory case:

```ts
normalizeEntrypoints({
  entrypoints: [
    {
      kind: 'clientFactory',
      factory: {
        exportName: 'createReactAPIClient',
        moduleSpecifier: './api',
      },
      reactContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: './api/APIClientContext',
      },
    },
  ],
});
```

Precreated case:

```ts
normalizeEntrypoints({
  entrypoints: [
    {
      kind: 'precreatedClient',
      client: {
        exportName: 'nodeAPIClient',
        moduleSpecifier: './client',
      },
      factory: {
        exportName: 'createNodeAPIClient',
        moduleSpecifier: './api',
      },
      optionsFactory: {
        exportName: 'createNodeAPIClientOptions',
        moduleSpecifier: './client-options',
      },
    },
  ],
});
```

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: FAIL until `normalizeEntrypoints()` reads `options.entrypoints` and the discriminated shapes.

- [ ] **Step 4: Update `normalizeEntrypoints()`**

In `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`:

- read `options.entrypoints ?? []`;
- for `kind: 'clientFactory'`, produce internal `kind: 'generatedFactory'`;
- for `kind: 'clientFactory'`, map `factory.exportName` and `factory.moduleSpecifier`;
- for `kind: 'clientFactory'`, normalize `reactContext.moduleSpecifier ?? null`;
- for `kind: 'precreatedClient'`, map `client`, `factory`, and `optionsFactory` directly.

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: PASS.

## Task 2: Update Transform Tests And Current Runtime Code

- [ ] **Step 1: Replace old config keys in core tests**

In `packages/tree-shaking-plugin/src/__tests__/core/*.test.ts`, replace:

- `createAPIClientFn: [{ name, module, context, contextModule }]`
- `apiClient: [{ client, clientModule, createAPIClientFn, createAPIClientFnModule, createAPIClientFnOptions, createAPIClientFnOptionsModule }]`

with:

- `entrypoints: [{ kind: 'clientFactory', factory: { exportName: name, moduleSpecifier: module }, reactContext: context ? { exportName: context, moduleSpecifier: contextModule } : undefined }]`
- `entrypoints: [{ kind: 'precreatedClient', client: { exportName: client, moduleSpecifier: clientModule }, factory: { exportName: createAPIClientFn, moduleSpecifier: createAPIClientFnModule }, optionsFactory: { exportName: createAPIClientFnOptions, moduleSpecifier: createAPIClientFnOptionsModule ?? clientModule } }]`

When a test uses both modes, put both objects in the same `entrypoints` array.
Prefer a local test helper only if it removes repeated mechanical mapping
without hiding the public config shape in snapshots.

- [ ] **Step 2: Update existing planner code minimally**

Until Session 2 rewires the planner through normalized entrypoints, adapt `packages/tree-shaking-plugin/src/lib/transform/plan.ts` to read the new public shape.

Allowed temporary adapter:

```ts
const entrypoints = options.entrypoints ?? [];

const factoryOptions = entrypoints
  .filter((entrypoint) => entrypoint.kind === 'clientFactory')
  .map((entrypoint) => ({
    name: entrypoint.factory.exportName,
    module: entrypoint.factory.moduleSpecifier,
    context: entrypoint.reactContext?.exportName,
    contextModule: entrypoint.reactContext?.moduleSpecifier,
  }));
```

Allowed temporary adapter for precreated config:

```ts
const precreatedOptions = entrypoints
  .filter((entrypoint) => entrypoint.kind === 'precreatedClient')
  .map((entrypoint) => ({
    client: entrypoint.client.exportName,
    clientModule: entrypoint.client.moduleSpecifier,
    createAPIClientFn: entrypoint.factory.exportName,
    createAPIClientFnModule: entrypoint.factory.moduleSpecifier,
    createAPIClientFnOptions: entrypoint.optionsFactory.exportName,
    createAPIClientFnOptionsModule: entrypoint.optionsFactory.moduleSpecifier,
  }));
```

This adapter is temporary. Session 2 should remove it when generated metadata consumes normalized entrypoints directly.

- [ ] **Step 3: Run core transform tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/explicit-options.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/mixed-client-modes.test.ts src/__tests__/core/schema-and-imports.test.ts src/__tests__/core/resolution-and-module-access.test.ts src/__tests__/core/unsupported-and-safety.test.ts
```

Expected: PASS without semantic snapshot drift.

## Task 3: Update Docs And E2E Fixture Config

- [x] **Step 1: Update README config sections**

In `packages/tree-shaking-plugin/README.md`:

- replace the `createAPIClientFn` and `apiClient` public sections with one `entrypoints` section;
- document `kind: 'clientFactory'` and `kind: 'precreatedClient'`;
- show `factory`, `reactContext`, `client`, and `optionsFactory` targets;
- remove docs that explain `clientModule`, `createAPIClientFnModule`, and `createAPIClientFnOptionsModule`.

- [x] **Step 2: Update tree-shaking-bundlers fixture config**

Update plugin config in `e2e/projects/tree-shaking-bundlers` to use:

```ts
entrypoints: [
  {
    kind: 'clientFactory',
    factory: {
      exportName: 'createRelativeAPIClient',
      moduleSpecifier: './src/generated-api/create-relative-api-client',
    },
    reactContext: {
      exportName: 'RelativeAPIClientContext',
      moduleSpecifier: './src/generated-api/create-relative-api-client',
    },
  },
  {
    kind: 'precreatedClient',
    client: {
      exportName: 'relativeAPIClient',
      moduleSpecifier: './src/precreated/clients/file-relative',
    },
    factory: {
      exportName: 'createRelativePrecreatedAPIClient',
      moduleSpecifier: './src/generated-api/create-relative-precreated-api-client',
    },
    optionsFactory: {
      exportName: 'createRelativeClientOptions',
      moduleSpecifier: './src/precreated/options/direct',
    },
  },
],
```

Use each fixture's existing names and paths; do not change fixture behavior.

- [x] **Step 3: Update plan references for Sessions 2-4**

Replace implementation instructions that mention public `createAPIClientFn` /
`apiClient`, `generatedFactories`, or `precreatedClients` config with
`entrypoints` where they describe the target public config.

Keep historical references only when describing old behavior in completed plans.

## Task 4: Verification

- [ ] **Step 1: Run package checks**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
git diff --check
```

Expected: PASS.

- [ ] **Step 2: Run fast e2e gate**

Run:

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

- [ ] **Step 3: Commit**

Run:

```bash
git add packages/tree-shaking-plugin e2e/projects/tree-shaking-bundlers docs/superpowers
git commit -m "refactor: align tree-shaking public config with entrypoints"
```

Expected: one commit containing the public config break, tests, README, and fixture updates.
