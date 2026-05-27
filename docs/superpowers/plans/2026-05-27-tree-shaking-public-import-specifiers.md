# Tree-Shaking Public Import Specifiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@openapi-qraft/tree-shaking-plugin` emit operation and context imports from configured public module specifiers instead of resolver-derived physical file paths.

**Architecture:** Add `services?: { moduleSpecifierBase: string }` to every entrypoint kind that emits operation imports. Normalize omitted `services.moduleSpecifierBase` to `factory.moduleSpecifier`, normalize omitted `reactContext.moduleSpecifier` to `factory.moduleSpecifier`, and remove the legacy config bridge so transform state carries normalized entrypoints directly. Resolver/module loading remains for metadata discovery only.

**Tech Stack:** TypeScript, Babel AST traversal, Vitest inline snapshots, qraft `tree-shaking-bundlers` e2e fixture, Yarn 4/Turborepo.

---

## File Structure

- `packages/tree-shaking-plugin/src/core.ts`
  - Public option types. Add `ServicesImportBaseTarget` and optional `services` to `clientFactory` and `precreatedClient`.
- `packages/tree-shaking-plugin/src/lib/transform/types.ts`
  - Internal normalized entrypoint, metadata, binding, and create-import types. Remove `LegacyQraftFactoryConfig` and `LegacyQraftPrecreatedClientConfig`.
- `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`
  - Normalize `services.moduleSpecifierBase` and `reactContext.moduleSpecifier` to concrete public module specifiers.
- `packages/tree-shaking-plugin/src/lib/transform/generated-info-key.ts`
  - Replace legacy-factory-shaped keys with normalized entrypoint keys.
- `packages/tree-shaking-plugin/src/lib/transform/path-rendering.ts`
  - Add module-specifier join helpers for service-file operation imports.
- `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`
  - Keep resolving/loading generated factories, but stop treating missing static `services` imports as an unresolved generated factory.
- `packages/tree-shaking-plugin/src/lib/transform/state.ts`
  - Use normalized entrypoints directly instead of constructing legacy config arrays.
- `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
  - Snapshot coverage for bare/alias public imports, explicit `moduleSpecifierBase`, default context imports, and removal of obsolete no-services skip behavior.
- `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
  - Snapshot coverage for `services.moduleSpecifierBase` on `precreatedClient`.
- `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`
  - Unit tests for normalization.
- `packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts`
  - Unit tests for service operation import composition.
- `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`
  - Metadata tests for factories without static `services` imports.
- `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
  - Add explicit `services.moduleSpecifierBase` where fixture entrypoints point at factory files instead of generated API roots.
- `packages/tree-shaking-plugin/README.md`
  - Document default service base assumptions and the explicit `services.moduleSpecifierBase` escape hatch.

---

### Task 1: Normalize Public Entrypoint Config

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/generated-info-key.ts`

- [ ] **Step 1: Write failing normalization tests**

Replace the current service-related cases in `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts` with these tests:

```ts
it('normalizes omitted clientFactory services and context modules to the factory module specifier', () => {
  expect(
    normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: {
            exportName: 'createReactAPIClient',
            moduleSpecifier: '@api/my-api',
          },
          reactContext: {
            exportName: 'APIClientContext',
          },
        },
      ],
    })
  ).toEqual([
    {
      kind: 'generatedFactory',
      key: 'generatedFactory:createReactAPIClient:@api/my-api:@api/my-api:@api/my-api',
      factory: {
        exportName: 'createReactAPIClient',
        moduleSpecifier: '@api/my-api',
      },
      services: {
        moduleSpecifierBase: '@api/my-api',
      },
      reactContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: '@api/my-api',
      },
    },
  ]);
});

it('preserves explicit clientFactory services moduleSpecifierBase', () => {
  const [entrypoint] = normalizeEntrypoints({
    entrypoints: [
      {
        kind: 'clientFactory',
        factory: {
          exportName: 'createReactAPIClient',
          moduleSpecifier: '@api/my-api',
        },
        services: {
          moduleSpecifierBase: '@api/my-public-root',
        },
      },
    ],
  });

  expect(entrypoint).toMatchObject({
    kind: 'generatedFactory',
    key: 'generatedFactory:createReactAPIClient:@api/my-api:@api/my-public-root:',
    services: {
      moduleSpecifierBase: '@api/my-public-root',
    },
  });
});

it('normalizes omitted precreatedClient services to the factory module specifier', () => {
  expect(
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
            moduleSpecifier: '@api/my-api',
          },
          optionsFactory: {
            exportName: 'createNodeAPIClientOptions',
            moduleSpecifier: './client-options',
          },
        },
      ],
    })
  ).toEqual([
    {
      kind: 'precreatedClient',
      key: 'precreatedClient:nodeAPIClient:./client:createNodeAPIClient:@api/my-api:createNodeAPIClientOptions:./client-options:@api/my-api',
      client: {
        exportName: 'nodeAPIClient',
        moduleSpecifier: './client',
      },
      factory: {
        exportName: 'createNodeAPIClient',
        moduleSpecifier: '@api/my-api',
      },
      optionsFactory: {
        exportName: 'createNodeAPIClientOptions',
        moduleSpecifier: './client-options',
      },
      services: {
        moduleSpecifierBase: '@api/my-api',
      },
    },
  ]);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: FAIL because `services.moduleSpecifierBase` is not part of the public or normalized config yet.

- [ ] **Step 3: Add public services base type**

In `packages/tree-shaking-plugin/src/core.ts`, add the public type and attach it to both entrypoint configs:

```ts
export type ServicesImportBaseTarget = {
  moduleSpecifierBase: string;
};

export type QraftClientFactoryEntrypointConfig = {
  kind: 'clientFactory';
  factory: ModuleExportTarget;
  services?: ServicesImportBaseTarget;
  reactContext?: ReactContextTarget;
};

export type QraftPrecreatedClientEntrypointConfig = {
  kind: 'precreatedClient';
  client: ModuleExportTarget;
  factory: ModuleExportTarget;
  optionsFactory: ModuleExportTarget;
  services?: ServicesImportBaseTarget;
};
```

Mirror that public shape in `packages/tree-shaking-plugin/src/lib/transform/types.ts`:

```ts
export type ServicesImportBaseTarget = {
  moduleSpecifierBase: string;
};

export type ReactContextConfig = {
  exportName: string;
  moduleSpecifier: string;
};
```

Update normalized entrypoint types in `types.ts`:

```ts
export type GeneratedFactoryEntrypoint = {
  kind: 'generatedFactory';
  key: string;
  factory: ImportTarget;
  services: ServicesImportBaseTarget;
  reactContext: ReactContextConfig | null;
};

export type PrecreatedClientEntrypoint = {
  kind: 'precreatedClient';
  key: string;
  client: ImportTarget;
  factory: ImportTarget;
  optionsFactory: ImportTarget;
  services: ServicesImportBaseTarget;
};
```

- [ ] **Step 4: Normalize services and context eagerly**

Update `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`:

```ts
function normalizeServices(
  factoryModuleSpecifier: string,
  services: { moduleSpecifierBase: string } | undefined
) {
  return {
    moduleSpecifierBase:
      services?.moduleSpecifierBase ?? factoryModuleSpecifier,
  };
}

function normalizeReactContext(
  factoryModuleSpecifier: string,
  reactContext:
    | { exportName: string; moduleSpecifier?: string }
    | undefined
) {
  return reactContext
    ? {
        exportName: reactContext.exportName,
        moduleSpecifier:
          reactContext.moduleSpecifier ?? factoryModuleSpecifier,
      }
    : null;
}
```

For `clientFactory`, compute both normalized objects:

```ts
const services = normalizeServices(
  entrypoint.factory.moduleSpecifier,
  entrypoint.services
);
const reactContext = normalizeReactContext(
  entrypoint.factory.moduleSpecifier,
  entrypoint.reactContext
);
```

Use those normalized objects in the returned entrypoint and in the key:

```ts
function composeGeneratedFactoryEntrypointKey(
  exportName: string,
  moduleSpecifier: string,
  servicesModuleSpecifierBase: string,
  contextModuleSpecifier: string
) {
  return [
    'generatedFactory',
    exportName,
    moduleSpecifier,
    servicesModuleSpecifierBase,
    contextModuleSpecifier,
  ].join(':');
}
```

For `precreatedClient`, normalize `services` from `entrypoint.factory.moduleSpecifier` and append `services.moduleSpecifierBase` to the precreated key.

- [ ] **Step 5: Replace generated-info keys with normalized entrypoint keys**

Update `packages/tree-shaking-plugin/src/lib/transform/generated-info-key.ts`:

```ts
export function getGeneratedInfoKey(
  createImportPath: string,
  entrypointKey: string
) {
  return `${createImportPath}::${entrypointKey}`;
}
```

This intentionally stops accepting legacy-factory-shaped objects.

- [ ] **Step 6: Run normalization tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/tree-shaking-plugin/src/core.ts \
  packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts \
  packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts \
  packages/tree-shaking-plugin/src/lib/transform/generated-info-key.ts
git commit -m "feat: normalize tree-shaking public import bases"
```

---

### Task 2: Render Service Operation Imports From Public Bases

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/path-rendering.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts`

- [ ] **Step 1: Write failing path-rendering tests**

Add these tests to `packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts`:

```ts
import { composeServiceOperationImportPath } from './path-rendering.js';

it('composes operation imports from a public module specifier base', () => {
  expect(
    composeServiceOperationImportPath(
      '@api/my-api',
      './services',
      './PetsService.ts'
    )
  ).toBe('@api/my-api/services/PetsService');
});

it('composes operation imports from an explicit nested public base', () => {
  expect(
    composeServiceOperationImportPath(
      '@api/my-api/public',
      './services',
      './PetsService'
    )
  ).toBe('@api/my-api/public/services/PetsService');
});

it('preserves local relative root behavior', () => {
  expect(
    composeServiceOperationImportPath('./api', './services', './PetsService')
  ).toBe('./api/services/PetsService');
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/path-rendering.test.ts
```

Expected: FAIL because `composeServiceOperationImportPath` does not exist.

- [ ] **Step 3: Add module-specifier join helper**

Add to `packages/tree-shaking-plugin/src/lib/transform/path-rendering.ts`:

```ts
export function composeServiceOperationImportPath(
  moduleSpecifierBase: string,
  servicesDir: string,
  serviceImportPath: string
) {
  return joinModuleSpecifierParts(
    moduleSpecifierBase,
    servicesDir,
    serviceImportPath
  );
}

function joinModuleSpecifierParts(base: string, ...parts: string[]) {
  const normalizedBase = stripTrailingSlash(
    stripIndexSourceExtension(stripSourceExtension(base))
  );
  const suffix = parts
    .map(normalizeModuleSpecifierPart)
    .filter(Boolean)
    .join('/');

  return suffix ? `${normalizedBase}/${suffix}` : normalizedBase;
}

function normalizeModuleSpecifierPart(part: string) {
  return stripIndexSourceExtension(stripSourceExtension(part))
    .replace(/^\.?\//, '')
    .replace(/\/$/, '');
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}
```

Do not use `node:path` to join bare module specifiers.

- [ ] **Step 4: Run path-rendering tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/path-rendering.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/path-rendering.ts \
  packages/tree-shaking-plugin/src/lib/transform/path-rendering.test.ts
git commit -m "feat: render tree-shaking service import bases"
```

---

### Task 3: Simplify Generated Metadata

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`

- [ ] **Step 1: Replace obsolete missing-services metadata test**

In `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`, replace `returns unresolved reason for factories without static services imports` with:

```ts
it('uses the conventional services directory when the generated factory has no static services import', async () => {
  const root = await createTempFixture();
  await writeFixtureFiles(root, {
    'src/api/index.ts': `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { APIClientContext } from './APIClientContext';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(services, callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, APIClientContext);
}
`,
    'src/api/APIClientContext.ts': `
export const APIClientContext = {};
`,
  });
  const importerId = path.join(root, 'src/App.tsx');
  const entrypoints = normalizeEntrypoints({
    entrypoints: [
      {
        kind: 'clientFactory',
        factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
        reactContext: { exportName: 'APIClientContext' },
      },
    ],
  });

  const result = await inspectGeneratedEntrypoints({
    importerId,
    entrypoints,
    moduleAccess: createFixtureModuleAccess(root),
  });

  const metadata = result.metadataByEntrypointKey.get(entrypoints[0].key);

  expect(result.reasons).toEqual([]);
  expect(metadata).toMatchObject({
    entrypoint: entrypoints[0],
    factoryFile: path.join(root, 'src/api/index.ts'),
    servicesDir: './services',
    serviceImportPaths: {},
    reactContext: {
      exportName: 'APIClientContext',
      moduleSpecifier: './api',
    },
  });
});
```

- [ ] **Step 2: Run metadata tests and verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/generated-metadata.test.ts
```

Expected: FAIL because missing static `services` imports still produce `generated-services-import-missing`.

- [ ] **Step 3: Keep normalized entrypoint in metadata**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, keep the full normalized entrypoint on metadata and remove duplicate service/context ownership fields:

```ts
export type GeneratedClientMetadata = {
  entrypoint: ClientEntrypoint;
  factoryFile: string;
  factoryLoadId: string;
  servicesDir: string;
  serviceImportPaths: Record<string, string>;
  reactContext: ReactContextConfig | null;
  optionsFactory?: ImportTarget;
};
```

In `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`, continue returning `entrypoint` unchanged in metadata. Do not create a legacy factory-shaped copy.

- [ ] **Step 4: Default `servicesDir` instead of returning missing-services diagnostics**

In `inspectFactoryFile(...)`, replace:

```ts
const factoryImports = readGeneratedFactoryImports(ast, reactContext);
if (!factoryImports.servicesDir) {
  return missingServicesImport(entrypoint.key);
}

const serviceImportPaths = await readServiceImportPaths(
  factoryFile,
  factoryImports.servicesDir,
  moduleAccess
);
```

with:

```ts
const factoryImports = readGeneratedFactoryImports(ast, reactContext);
const servicesDir = factoryImports.servicesDir ?? './services';
const serviceImportPaths = factoryImports.servicesDir
  ? await readServiceImportPaths(factoryFile, servicesDir, moduleAccess)
  : {};
```

Use `servicesDir` in returned metadata. Keep `missingServicesImport(...)` for re-export cycles and non-qraft factories.

- [ ] **Step 5: Preserve normalized context module specifiers**

In `readGeneratedFactoryImports(...)`, do not replace configured context module specifiers with generated physical import paths. The configured context branch should keep the normalized public module specifier:

```ts
if (
  configuredContext &&
  specifier.imported.name === configuredContext.exportName
) {
  inferredContext = {
    exportName: configuredContext.exportName,
    moduleSpecifier: configuredContext.moduleSpecifier,
  };
}
```

For unconfigured contexts discovered from `qraftReactAPIClient(..., ..., context)`, keep the discovered import source because there is no public context config:

```ts
if (!configuredContext) {
  inferredContext = {
    exportName: importedContext.exportName,
    moduleSpecifier: importedContext.moduleSpecifier,
  };
}
```

- [ ] **Step 6: Run metadata tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/generated-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts \
  packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts
git commit -m "refactor: simplify generated tree-shaking metadata"
```

---

### Task 4: Remove Legacy Config Bridge From Transform State

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/state.ts`

- [ ] **Step 1: Replace legacy factory types in transform types**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, delete `LegacyQraftFactoryConfig` and `LegacyQraftPrecreatedClientConfig`.

Update `ClientBinding` and related request/import types to carry normalized entrypoint references directly:

```ts
export type ClientBinding = {
  name: string;
  clientSourceKey: string;
  createImportPath: string;
  createImportLoadId: string;
  entrypoint: GeneratedFactoryEntrypoint | PrecreatedClientEntrypoint;
  bindingNode: t.Node;
  declarationScope: Scope;
  runtimeInput: RuntimeInput;
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

export type GeneratedInfoRequest = {
  createImportPath: string;
  createImportLoadId: string;
  entrypoint: GeneratedFactoryEntrypoint | PrecreatedClientEntrypoint;
};

export type CreateImportEntry = {
  sourceSpecifier: string;
  factoryFile: string;
  factoryLoadId: string;
  entrypoint: GeneratedFactoryEntrypoint;
};
```

Update inline/schema match result types in `state.ts` to return `entrypoint` instead of `factory`.

- [ ] **Step 2: Replace legacy arrays with normalized entrypoint maps**

In `packages/tree-shaking-plugin/src/lib/transform/state.ts`, delete `factoryOptions`, `factoryEntrypointKeys`, `precreatedOptions`, and `precreatedEntrypointKeys`.

Use these maps instead:

```ts
const generatedFactoryEntrypoints = entrypoints.filter(
  (entrypoint): entrypoint is GeneratedFactoryEntrypoint =>
    entrypoint.kind === 'generatedFactory'
);
const precreatedClientEntrypoints = entrypoints.filter(
  (entrypoint): entrypoint is PrecreatedClientEntrypoint =>
    entrypoint.kind === 'precreatedClient'
);
```

Where the old code filtered `factoryOptions`, filter `generatedFactoryEntrypoints` by `entrypoint.factory.exportName`.

Where the old code filtered `precreatedOptions`, filter `precreatedClientEntrypoints` by `entrypoint.client.exportName`.

- [ ] **Step 3: Store normalized entrypoints in create imports and signals**

When matching a generated factory import, store the entrypoint directly:

```ts
createImports.set(specifier.local.name, {
  sourceSpecifier: source,
  factoryFile: resolvedId ?? normalizeResolvedId(resolvedAbs),
  factoryLoadId: resolvedAbs,
  entrypoint: matched,
});
factoryImportSignals.set(specifier.local.name, {
  key: matched.key,
  bindingNode: specifier.local,
});
```

Update every `createImport.factory` access to `createImport.entrypoint`.

- [ ] **Step 4: Update generated-info cache calls**

Replace every call shaped like:

```ts
getGeneratedInfoKey(createImportPath, factory)
```

with:

```ts
getGeneratedInfoKey(createImportPath, entrypoint.key)
```

For precreated clients, use the normalized precreated entrypoint key. For generated factories, use the normalized generated factory entrypoint key.

- [ ] **Step 5: Rewrite metadata seeding without legacy factories**

Replace `seedGeneratedInfoByImport(...)` with a version that accepts only metadata and importer id:

```ts
function seedGeneratedInfoByImport(
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>,
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>,
  importerId: string
) {
  for (const metadata of metadataByEntrypointKey.values()) {
    if (!metadata) continue;

    const generatedInfo = toGeneratedClientInfo(metadata, importerId);
    const sourceIds = new Set([metadata.factoryFile]);

    for (const sourceId of sourceIds) {
      generatedInfoByImport.set(
        getGeneratedInfoKey(sourceId, metadata.entrypoint.key),
        generatedInfo
      );
    }
  }
}
```

Then update `toGeneratedClientInfo(...)`:

```ts
function toGeneratedClientInfo(
  metadata: GeneratedClientMetadata,
  importerId: string
): GeneratedClientInfo {
  return {
    importerId,
    clientFile: metadata.factoryFile,
    servicesModuleSpecifierBase:
      metadata.entrypoint.services.moduleSpecifierBase,
    servicesDir: metadata.servicesDir,
    serviceImportPaths: metadata.serviceImportPaths,
    contextImportPath: resolveMetadataContextImportPath(metadata),
    contextName:
      metadata.entrypoint.kind === 'generatedFactory'
        ? metadata.entrypoint.reactContext?.exportName ?? null
        : null,
  };
}
```

Use this `GeneratedClientInfo` shape in `types.ts`:

```ts
export type GeneratedClientInfo = {
  importerId: string;
  clientFile: string;
  servicesModuleSpecifierBase: string;
  servicesDir: string;
  serviceImportPaths: Record<string, string>;
  contextImportPath: string | null;
  contextName: string | null;
};
```

- [ ] **Step 6: Render context imports from normalized entrypoints**

Replace `resolveMetadataContextImportPath(...)` with:

```ts
function resolveMetadataContextImportPath(metadata: GeneratedClientMetadata) {
  const entrypoint = metadata.entrypoint;
  if (entrypoint.kind !== 'generatedFactory') return null;
  return entrypoint.reactContext?.moduleSpecifier ?? null;
}
```

- [ ] **Step 7: Render operation imports from normalized service bases**

Update `resolveOperationImport(...)`:

```ts
function resolveOperationImport(
  generatedInfo: GeneratedClientInfo,
  serviceName: string,
  operationName: string,
  programScope: Scope,
  fileBindingNames: Set<string>,
  reservedImportLocalNames: Set<string>,
  operationImports: Map<string, OperationImportInfo>
): OperationImportInfo {
  const key = [
    generatedInfo.clientFile,
    generatedInfo.servicesModuleSpecifierBase,
    generatedInfo.servicesDir,
    serviceName,
    operationName,
  ].join(':');
  const cached = operationImports.get(key);
  if (cached) return cached;

  const serviceImportPath =
    generatedInfo.serviceImportPaths[serviceName] ??
    `./${serviceNameToFileBase(serviceName)}`;
  const resolved = {
    importPath: composeServiceOperationImportPath(
      generatedInfo.servicesModuleSpecifierBase,
      generatedInfo.servicesDir,
      serviceImportPath
    ),
    operationName,
    localName: createProgramUniqueName(
      programScope,
      operationName,
      fileBindingNames,
      reservedImportLocalNames
    ),
  };
  reservedImportLocalNames.add(resolved.localName);
  operationImports.set(key, resolved);
  return resolved;
}
```

Remove null checks that report `operation-import-unresolved` and `inline-operation-import-unresolved`, because operation import rendering no longer resolves files.

- [ ] **Step 8: Update precreated validation to use normalized entrypoints**

Change `findPrecreatedClients(...)` to accept `PrecreatedClientEntrypoint[]` instead of legacy configs.

Use entrypoint fields directly:

```ts
entrypoint.client.moduleSpecifier
entrypoint.client.exportName
entrypoint.factory.moduleSpecifier
entrypoint.factory.exportName
entrypoint.optionsFactory.moduleSpecifier
entrypoint.optionsFactory.exportName
entrypoint.services.moduleSpecifierBase
```

Change `validatePrecreatedClientConfig(...)` to return:

```ts
Promise<{ entrypoint: PrecreatedClientEntrypoint } | null>
```

When validation succeeds, return the normalized entrypoint rather than a legacy factory object.

- [ ] **Step 9: Verify no legacy bridge remains**

Run:

```bash
rg -n "LegacyQraft|factoryOptions|precreatedOptions|factoryEntrypointKeys|precreatedEntrypointKeys" packages/tree-shaking-plugin/src/lib/transform
```

Expected: no output.

- [ ] **Step 10: Run focused transform tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts src/lib/transform/generated-metadata.test.ts src/lib/transform/path-rendering.test.ts
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/state.ts
git commit -m "refactor: remove tree-shaking legacy config bridge"
```

---

### Task 5: Update Core Transform Snapshot Contracts

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`

- [ ] **Step 1: Update the existing bare module factory regression**

In `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`, update `recognizes a custom factory name imported via a bare module specifier`.

Expected snapshot:

```ts
expect(result?.code).toMatchInlineSnapshot(`
  "import { qraftReactAPIClient } from "@openapi-qraft/react";
  import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
  import { getPets } from "@api/my-api/services/PetsService";
  import { APIClientContext } from "@api/my-api";
  const api_pets_getPets = qraftReactAPIClient(getPets, {
    useQuery
  }, APIClientContext);
  export function App() {
    return api_pets_getPets.useQuery();
  }"
  `);
```

- [ ] **Step 2: Add an explicit services base regression for clientFactory**

Add this test to `create-api-client-fn.test.ts` near the bare module test:

```ts
it('uses explicit services moduleSpecifierBase for a generated factory', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');
  const apiIndex = path.join(fixture, 'src/api/index.ts');

  const result = await transformQraftTreeShaking(
    `
import { createMyAPIClient } from '@api/my-api';

const api = createMyAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
    sourceFile,
    {
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: {
            exportName: 'createMyAPIClient',
            moduleSpecifier: '@api/my-api',
          },
          services: {
            moduleSpecifierBase: '@api/my-public-root',
          },
          reactContext: {
            exportName: 'APIClientContext',
          },
        },
      ],
      async resolve(specifier) {
        if (specifier === '@api/my-api') return apiIndex;
        return null;
      },
    }
  );

  expect(result?.code).toMatchInlineSnapshot(`
    "import { qraftReactAPIClient } from "@openapi-qraft/react";
    import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
    import { getPets } from "@api/my-public-root/services/PetsService";
    import { APIClientContext } from "@api/my-api";
    const api_pets_getPets = qraftReactAPIClient(getPets, {
      useQuery
    }, APIClientContext);
    export function App() {
      return api_pets_getPets.useQuery();
    }"
  `);
});
```

- [ ] **Step 3: Replace obsolete no-services skip coverage**

Delete `skips generated factories that receive an operation argument without services imports` from `create-api-client-fn.test.ts`.

Add:

```ts
it('rewrites generated factories without static services imports when service base is configured', async () => {
  const fixture = await fs.mkdtemp(
    path.join(os.tmpdir(), 'qraft-tree-shaking-')
  );
  await writeFixtureFiles(fixture, {
    'src/api/createAPIClient.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';
import { getQueryKey } from '@openapi-qraft/react/callbacks/index';

const defaultCallbacks = { getQueryKey } as const;

export function createAPIClient(operation, callbacks = defaultCallbacks) {
  return qraftAPIClient(operation, callbacks);
}
`,
    'src/api/services/PetsService.ts': PETS_SERVICE_TS,
  });
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api/createAPIClient';
import { getPets } from './api/services/PetsService';

const api = createAPIClient(getPets);

export function App() {
  return api.pets.getPets.getQueryKey();
}
`,
    sourceFile,
    {
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: {
            exportName: 'createAPIClient',
            moduleSpecifier: './api/createAPIClient',
          },
          services: {
            moduleSpecifierBase: './api',
          },
        },
      ],
    }
  );

  expect(result?.code).toMatchInlineSnapshot(`
    "import { qraftAPIClient } from "@openapi-qraft/react";
    import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
    import { getPets } from "./api/services/PetsService";
    const api_pets_getPets = qraftAPIClient(getPets, {
      getQueryKey
    });
    export function App() {
      return api_pets_getPets.getQueryKey();
    }"
  `);
});
```

- [ ] **Step 4: Add precreated services base regression**

In `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`, add:

```ts
it('uses explicit services moduleSpecifierBase for a precreated API client', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'qraft-tree-shaking-')
  );
  await writeFixtureFiles(
    root,
    createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`)
  );
  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { APIClient as API } from './client';

export function App() {
  return API.pets.getPets.useQuery();
}
`,
    sourceFile,
    {
      entrypoints: [
        {
          kind: 'precreatedClient',
          client: {
            exportName: 'APIClient',
            moduleSpecifier: './client',
          },
          factory: {
            exportName: 'createAPIClient',
            moduleSpecifier: '@api/my-api',
          },
          services: {
            moduleSpecifierBase: '@api/my-public-root',
          },
          optionsFactory: {
            exportName: 'createAPIClientOptions',
            moduleSpecifier: './client-options',
          },
        },
      ],
      async resolve(specifier) {
        if (specifier === '@api/my-api') {
          return path.join(root, 'src/api/index.ts');
        }
        return null;
      },
    }
  );

  expect(result?.code).toMatchInlineSnapshot(`
    "import { qraftAPIClient } from "@openapi-qraft/react";
    import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
    import { getPets } from "@api/my-public-root/services/PetsService";
    import { createAPIClientOptions } from "./client-options";
    const API_pets_getPets = qraftAPIClient(getPets, {
      useQuery
    }, createAPIClientOptions());
    export function App() {
      return API_pets_getPets.useQuery();
    }"
  `);
});
```

- [ ] **Step 5: Delete obsolete precreated no-static-services skip coverage**

Delete `skips a precreated client whose generated factory has no static services import` from `precreated-api-client.test.ts`.

- [ ] **Step 6: Run focused core tests and verify snapshot failures**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts
```

Expected: FAIL on inline snapshot differences caused by this task.

- [ ] **Step 7: Update inline snapshots**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts -u
```

Expected: PASS and inline snapshots updated.

- [ ] **Step 8: Re-run focused core tests without update mode**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts
git commit -m "test: cover public service import bases"
```

---

### Task 6: Retune E2E Fixture Entrypoints

**Files:**
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`

- [ ] **Step 1: Add explicit service bases for factory-file entrypoints**

In `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`, add `services.moduleSpecifierBase` to every entrypoint whose `factory.moduleSpecifier` points at a factory file instead of the generated API root.

Use `./generated-api` for relative file-level factories and `@/generated-api` for alias-root file-level factories. For example:

```js
{
  kind: 'clientFactory',
  factory: {
    exportName: 'createRelativeAPIClient',
    moduleSpecifier: '@/generated-api/create-relative-api-client',
  },
  services: {
    moduleSpecifierBase: '@/generated-api',
  },
  reactContext: {
    exportName: 'RelativeAPIClientContext',
    moduleSpecifier: './generated-api/RelativeAPIClientContext',
  },
},
{
  kind: 'precreatedClient',
  client: {
    exportName: 'RelativeClient',
    moduleSpecifier: './precreated/clients/file-relative.ts',
  },
  factory: {
    exportName: 'createRelativePrecreatedAPIClient',
    moduleSpecifier:
      './generated-api/create-relative-precreated-api-client.ts',
  },
  services: {
    moduleSpecifierBase: './generated-api',
  },
  optionsFactory: {
    exportName: 'buildRelativeClientOptions',
    moduleSpecifier: './precreated/options/barrel',
  },
},
```

Keep barrel/root entrypoints such as `./generated-api` and `@/generated-api` without explicit `services`; those intentionally exercise inheritance from `factory.moduleSpecifier`.

- [ ] **Step 2: Run static syntax check**

Run:

```bash
node --check e2e/projects/tree-shaking-bundlers/scripts/shared.mjs
```

Expected: PASS with no syntax output.

- [ ] **Step 3: Commit**

```bash
git add e2e/projects/tree-shaking-bundlers/scripts/shared.mjs
git commit -m "test: configure tree-shaking e2e service bases"
```

---

### Task 7: Document The Public Services Base Contract

**Files:**
- Modify: `packages/tree-shaking-plugin/README.md`

- [ ] **Step 1: Update README examples**

In `packages/tree-shaking-plugin/README.md`, update at least one entrypoint example to show `services.moduleSpecifierBase`:

```ts
const entrypoints = [
  {
    kind: 'precreatedClient',
    client: { exportName: 'nodeAPIClient', moduleSpecifier: './client' },
    factory: {
      exportName: 'createNodeAPIClient',
      moduleSpecifier: './create-node-api-client',
    },
    services: {
      moduleSpecifierBase: './api',
    },
    optionsFactory: {
      exportName: 'createNodeAPIClientOptions',
      moduleSpecifier: './client-options',
    },
  },
];
```

- [ ] **Step 2: Add services base wording**

Add this wording under the `entrypoints` section:

```md
`services.moduleSpecifierBase` is optional. When it is omitted, operation imports inherit `factory.moduleSpecifier` as the public generated API root. For example, a factory module of `@api/my-api` emits operation imports such as `@api/my-api/services/PetsService`.

Use `services.moduleSpecifierBase` when the factory module is not the public generated API root, such as file-level factories (`./api/createAPIClient`) or packages that expose generated service files below another public root. The plugin appends the generated services directory and service file, such as `services/PetsService`.
```

- [ ] **Step 3: Run README diff check**

Run:

```bash
git diff -- packages/tree-shaking-plugin/README.md
```

Expected: The docs explain inherited factory-root behavior and explicit service-base behavior without describing resolver-derived output paths as supported.

- [ ] **Step 4: Commit**

```bash
git add packages/tree-shaking-plugin/README.md
git commit -m "docs: document tree-shaking service import bases"
```

---

### Task 8: Final Verification

**Files:**
- Verify: `packages/tree-shaking-plugin/src/lib/transform/*.test.ts`
- Verify: `packages/tree-shaking-plugin/src/__tests__/core/*.test.ts`
- Verify: `e2e/projects/tree-shaking-bundlers`

- [ ] **Step 1: Run focused transform tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts src/lib/transform/path-rendering.test.ts src/lib/transform/generated-metadata.test.ts src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full tree-shaking package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
```

Expected: PASS.

- [ ] **Step 3: Run typecheck and lint**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
```

Expected: both PASS.

- [ ] **Step 4: Build the plugin**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
```

Expected: PASS and `packages/tree-shaking-plugin/dist` is regenerated.

- [ ] **Step 5: Run the local tree-shaking e2e fixture**

Run:

```bash
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: PASS. The wrapper builds publishable packages, publishes to the local Verdaccio registry, copies `tree-shaking-bundlers` into `/Users/radist/w/qraft-e2e`, updates dependencies, and runs the fixture through `npm run e2e:pre-build`, `npm run build`, and `npm run e2e:post-build`.

- [ ] **Step 6: Run diff hygiene**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` has no output. `git status --short` shows no uncommitted source changes.

- [ ] **Step 7: Review final repository state**

Run:

```bash
git log --oneline -8
git status --short
```

Expected: the recent commits match the completed tasks, and `git status --short` shows no uncommitted source changes.
