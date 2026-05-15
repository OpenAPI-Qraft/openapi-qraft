# Tree-Shaking Plugin Pipeline Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `@openapi-qraft/tree-shaking-plugin` around an explicit transform contract, normalized entrypoints, strict generated-source metadata inspection, and diagnostics policy while preserving existing tree-shaking capabilities.

**Architecture:** Keep `core.ts` as orchestration, introduce focused transform modules for diagnostics, entrypoint normalization, source gating, and generated metadata inspection, then route the existing planner/mutator through those normalized facts. The first implementation deletes config/model and generated-source inspection debt without requiring a full `TransformEditPlan` rewrite.

**Tech Stack:** TypeScript, Babel AST, Vitest inline snapshots, unplugin, Yarn workspace scripts.

---

## File Structure

- Create: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts`
  - Owns `DiagnosticsLevel`, `QraftTreeShakeError`, structured diagnostic reasons, and reporting policy.
- Create: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts`
  - Unit tests for default error behavior, warn/off policy, and ordinary silent skips.
- Create: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`
  - Converts public `createAPIClientFn` and `apiClient` config into normalized `ClientEntrypoint[]`.
- Create: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`
  - Unit tests for config normalization.
- Create: `packages/tree-shaking-plugin/src/lib/transform/source-gate.ts`
  - Owns `shouldInspectSource(...)`, the lightweight pre-parse gate.
- Create: `packages/tree-shaking-plugin/src/lib/transform/source-gate.test.ts`
  - Unit tests for include/exclude/id/source signal behavior.
- Create: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`
  - Owns generated factory/precreated source inspection: resolve, load, re-export traversal, static services ownership, service import paths, context metadata, and options factory metadata.
- Create: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`
  - Unit tests for generated-source inspection and strict skip reasons.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
  - Re-export or host normalized transform types shared by the new modules and the existing planner/mutator.
- Modify: `packages/tree-shaking-plugin/src/core.ts`
  - Wire diagnostics, entrypoint normalization, pre-parse gate, and generated metadata cache into transform orchestration.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
  - Consume normalized entrypoints and generated metadata; remove direct deep reads of `QraftTreeShakeOptions.createAPIClientFn` / `apiClient` where possible.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`
  - Prefer normalized runtime input over `hasExplicitContext` and legacy mode branching where possible in this phase.
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/*.test.ts`
  - Preserve transform semantics, update old soft-skip tests to explicit `diagnostics: 'off'`, and add contract tests for default error diagnostics.
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md`
  - Update test routing if new transform helper tests change the suite ownership story.
- Modify: `packages/tree-shaking-plugin/README.md`
  - Replace `debug` documentation with `diagnostics?: 'error' | 'warn' | 'off'` once implementation lands.

## Task 1: Add Diagnostics Contract

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`

- [ ] **Step 1: Add diagnostics unit tests first**

Create `packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  createDiagnosticReporter,
  QraftTreeShakeError,
} from './diagnostics.js';

describe('tree-shaking diagnostics', () => {
  it('throws unresolved transform candidates by default', () => {
    const reporter = createDiagnosticReporter({});

    expect(() =>
      reporter.unresolved({
        layer: 'generated-metadata',
        code: 'generated-services-import-missing',
        message: 'Generated factory does not statically import services.',
        entrypointKey: 'generatedFactory:createAPIClient:./api',
      })
    ).toThrow(QraftTreeShakeError);
  });

  it('warns and continues when diagnostics is warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reporter = createDiagnosticReporter({ diagnostics: 'warn' });

    expect(
      reporter.unresolved({
        layer: 'generated-metadata',
        code: 'entrypoint-source-unavailable',
        message: 'Generated source was unavailable.',
        entrypointKey: 'generatedFactory:createAPIClient:./api',
      })
    ).toBeNull();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '[openapi-qraft/tree-shaking-plugin] entrypoint-source-unavailable'
      )
    );

    warn.mockRestore();
  });

  it('stays silent when diagnostics is off', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reporter = createDiagnosticReporter({ diagnostics: 'off' });

    expect(
      reporter.unresolved({
        layer: 'generated-metadata',
        code: 'operation-source-unresolved',
        message: 'Operation source was not resolved.',
      })
    ).toBeNull();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('ordinary skips never throw or warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reporter = createDiagnosticReporter({});

    expect(
      reporter.ordinarySkip({
        layer: 'gate',
        code: 'source-gate-no-signals',
        message: 'Source contains no configured entrypoint signals.',
      })
    ).toBeNull();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```

- [ ] **Step 2: Run diagnostics tests to verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/diagnostics.test.ts
```

Expected: FAIL because `diagnostics.ts` does not exist.

- [ ] **Step 3: Add diagnostics types to `types.ts`**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, add:

```ts
export type DiagnosticsLevel = 'error' | 'warn' | 'off';

export type DiagnosticLayer =
  | 'gate'
  | 'entrypoint'
  | 'generated-metadata'
  | 'usage-collection';

export type DiagnosticReason = {
  layer: DiagnosticLayer;
  code: string;
  message: string;
  entrypointKey?: string;
};
```

Update `QraftTreeShakeOptions` in the same file:

```ts
export type QraftTreeShakeOptions = {
  createAPIClientFn?: QraftFactoryConfig[];
  apiClient?: QraftPrecreatedClientConfig[];
  resolve?: QraftResolver;
  moduleAccess?: QraftModuleAccessOptions;
  include?: FilterPattern;
  exclude?: FilterPattern;
  diagnostics?: DiagnosticsLevel;
  debug?: boolean;
};
```

Keep `debug?: boolean` only as a temporary compatibility option for existing callers until README/config cleanup lands.

- [ ] **Step 4: Mirror the public option in `core.ts`**

In `packages/tree-shaking-plugin/src/core.ts`, add `DiagnosticsLevel` to the imports from `types.ts` after Task 2 moves public types there. Until then, add a local type:

```ts
export type DiagnosticsLevel = 'error' | 'warn' | 'off';
```

Update `QraftTreeShakeOptions`:

```ts
export type QraftTreeShakeOptions = {
  createAPIClientFn?: QraftFactoryConfig[];
  apiClient?: QraftPrecreatedClientConfig[];
  resolve?: QraftResolver;
  moduleAccess?: QraftModuleAccessOptions;
  include?: FilterPattern;
  exclude?: FilterPattern;
  diagnostics?: DiagnosticsLevel;
  debug?: boolean;
};
```

- [ ] **Step 5: Implement `diagnostics.ts`**

Create `packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts`:

```ts
import type {
  DiagnosticReason,
  DiagnosticsLevel,
  QraftTreeShakeOptions,
} from './types.js';

export class QraftTreeShakeError extends Error {
  readonly reason: DiagnosticReason;

  constructor(reason: DiagnosticReason) {
    super(formatDiagnosticReason(reason));
    this.name = 'QraftTreeShakeError';
    this.reason = reason;
  }
}

export type DiagnosticReporter = {
  ordinarySkip(reason: DiagnosticReason): null;
  unresolved(reason: DiagnosticReason): null;
};

export function createDiagnosticReporter(
  options: Pick<QraftTreeShakeOptions, 'diagnostics' | 'debug'>
): DiagnosticReporter {
  const diagnostics = normalizeDiagnosticsLevel(options);

  return {
    ordinarySkip() {
      return null;
    },
    unresolved(reason) {
      if (diagnostics === 'error') {
        throw new QraftTreeShakeError(reason);
      }

      if (diagnostics === 'warn') {
        console.warn(formatDiagnosticReason(reason));
      }

      return null;
    },
  };
}

function normalizeDiagnosticsLevel(
  options: Pick<QraftTreeShakeOptions, 'diagnostics' | 'debug'>
): DiagnosticsLevel {
  if (options.diagnostics) return options.diagnostics;
  if (options.debug) return 'warn';
  return 'error';
}

function formatDiagnosticReason(reason: DiagnosticReason): string {
  const entrypoint = reason.entrypointKey
    ? ` entrypoint=${reason.entrypointKey}`
    : '';

  return `[openapi-qraft/tree-shaking-plugin] ${reason.code} (${reason.layer})${entrypoint}: ${reason.message}`;
}
```

- [ ] **Step 6: Run diagnostics tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/diagnostics.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit diagnostics contract**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/core.ts \
  packages/tree-shaking-plugin/src/lib/transform/diagnostics.ts \
  packages/tree-shaking-plugin/src/lib/transform/diagnostics.test.ts
git commit -m "feat: add tree-shaking diagnostics policy"
```

Expected: one commit with diagnostics types and tests.

## Task 2: Normalize Public Config Into Entrypoints

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`

- [ ] **Step 1: Add entrypoint normalization tests**

Create `packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeEntrypoints } from './entrypoints.js';

describe('normalizeEntrypoints', () => {
  it('normalizes createAPIClientFn configs', () => {
    expect(
      normalizeEntrypoints({
        createAPIClientFn: [
          {
            name: 'createReactAPIClient',
            module: './api',
            context: 'APIClientContext',
            contextModule: './api/APIClientContext',
          },
        ],
      })
    ).toEqual([
      {
        kind: 'generatedFactory',
        key: 'generatedFactory:createReactAPIClient:./api',
        factory: {
          exportName: 'createReactAPIClient',
          moduleSpecifier: './api',
        },
        runtimeContext: {
          exportName: 'APIClientContext',
          moduleSpecifier: './api/APIClientContext',
        },
        legacyConfig: {
          name: 'createReactAPIClient',
          module: './api',
          context: 'APIClientContext',
          contextModule: './api/APIClientContext',
        },
      },
    ]);
  });

  it('normalizes precreated apiClient configs with explicit options module', () => {
    expect(
      normalizeEntrypoints({
        apiClient: [
          {
            client: 'nodeAPIClient',
            clientModule: './client',
            createAPIClientFn: 'createNodeAPIClient',
            createAPIClientFnModule: './api',
            createAPIClientFnOptions: 'createNodeAPIClientOptions',
            createAPIClientFnOptionsModule: './client-options',
          },
        ],
      })
    ).toEqual([
      {
        kind: 'precreatedClient',
        key: 'precreatedClient:nodeAPIClient:./client:createNodeAPIClient:./api:createNodeAPIClientOptions:./client-options',
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
        legacyConfig: {
          client: 'nodeAPIClient',
          clientModule: './client',
          createAPIClientFn: 'createNodeAPIClient',
          createAPIClientFnModule: './api',
          createAPIClientFnOptions: 'createNodeAPIClientOptions',
          createAPIClientFnOptionsModule: './client-options',
        },
      },
    ]);
  });

  it('normalizes precreated options module fallback to client module', () => {
    const [entrypoint] = normalizeEntrypoints({
      apiClient: [
        {
          client: 'nodeAPIClient',
          clientModule: './client',
          createAPIClientFn: 'createNodeAPIClient',
          createAPIClientFnModule: './api',
          createAPIClientFnOptions: 'createNodeAPIClientOptions',
        },
      ],
    });

    expect(entrypoint).toMatchObject({
      kind: 'precreatedClient',
      optionsFactory: {
        exportName: 'createNodeAPIClientOptions',
        moduleSpecifier: './client',
      },
    });
  });
});
```

- [ ] **Step 2: Run entrypoint tests to verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: FAIL because `entrypoints.ts` does not exist.

- [ ] **Step 3: Add normalized types**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, add:

```ts
export type ImportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

export type RuntimeContextConfig = {
  exportName: string;
  moduleSpecifier: string | null;
};

export type GeneratedFactoryEntrypoint = {
  kind: 'generatedFactory';
  key: string;
  factory: ImportTarget;
  runtimeContext: RuntimeContextConfig | null;
  legacyConfig: QraftFactoryConfig;
};

export type PrecreatedClientEntrypoint = {
  kind: 'precreatedClient';
  key: string;
  client: ImportTarget;
  factory: ImportTarget;
  optionsFactory: ImportTarget;
  legacyConfig: QraftPrecreatedClientConfig;
};

export type ClientEntrypoint =
  | GeneratedFactoryEntrypoint
  | PrecreatedClientEntrypoint;
```

- [ ] **Step 4: Implement `entrypoints.ts`**

Create `packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts`:

```ts
import type {
  ClientEntrypoint,
  QraftPrecreatedClientConfig,
  QraftTreeShakeOptions,
} from './types.js';

export function normalizeEntrypoints(
  options: Pick<QraftTreeShakeOptions, 'createAPIClientFn' | 'apiClient'>
): ClientEntrypoint[] {
  return [
    ...(options.createAPIClientFn ?? []).map((factory) => ({
      kind: 'generatedFactory' as const,
      key: composeGeneratedFactoryEntrypointKey(factory.name, factory.module),
      factory: {
        exportName: factory.name,
        moduleSpecifier: factory.module,
      },
      runtimeContext: factory.context
        ? {
            exportName: factory.context,
            moduleSpecifier: factory.contextModule ?? null,
          }
        : null,
      legacyConfig: factory,
    })),
    ...(options.apiClient ?? []).map((config) =>
      normalizePrecreatedEntrypoint(config)
    ),
  ];
}

function normalizePrecreatedEntrypoint(
  config: QraftPrecreatedClientConfig
): ClientEntrypoint {
  const optionsModule =
    config.createAPIClientFnOptionsModule ?? config.clientModule;

  return {
    kind: 'precreatedClient',
    key: [
      'precreatedClient',
      config.client,
      config.clientModule,
      config.createAPIClientFn,
      config.createAPIClientFnModule,
      config.createAPIClientFnOptions,
      optionsModule,
    ].join(':'),
    client: {
      exportName: config.client,
      moduleSpecifier: config.clientModule,
    },
    factory: {
      exportName: config.createAPIClientFn,
      moduleSpecifier: config.createAPIClientFnModule,
    },
    optionsFactory: {
      exportName: config.createAPIClientFnOptions,
      moduleSpecifier: optionsModule,
    },
    legacyConfig: config,
  };
}

function composeGeneratedFactoryEntrypointKey(
  exportName: string,
  moduleSpecifier: string
) {
  return ['generatedFactory', exportName, moduleSpecifier].join(':');
}
```

- [ ] **Step 5: Run entrypoint tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/entrypoints.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit entrypoint normalization**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/entrypoints.ts \
  packages/tree-shaking-plugin/src/lib/transform/entrypoints.test.ts
git commit -m "refactor: normalize tree-shaking entrypoints"
```

Expected: one commit introducing normalized entrypoint types and tests.

## Task 3: Add The Pre-Parse Source Gate

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/source-gate.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/source-gate.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.ts`

- [ ] **Step 1: Add source gate tests**

Create `packages/tree-shaking-plugin/src/lib/transform/source-gate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeEntrypoints } from './entrypoints.js';
import { shouldInspectSource } from './source-gate.js';

describe('shouldInspectSource', () => {
  it('skips when no entrypoints are configured', () => {
    expect(
      shouldInspectSource({
        code: 'const value = 1;',
        id: '/repo/src/App.tsx',
        entrypoints: [],
        include: undefined,
        exclude: undefined,
      })
    ).toBe(false);
  });

  it('skips non-source and node_modules ids', () => {
    const entrypoints = normalizeEntrypoints({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    });

    expect(
      shouldInspectSource({
        code: 'createAPIClient().pets.getPets.useQuery();',
        id: '/repo/src/App.css',
        entrypoints,
        include: undefined,
        exclude: undefined,
      })
    ).toBe(false);

    expect(
      shouldInspectSource({
        code: 'createAPIClient().pets.getPets.useQuery();',
        id: '/repo/node_modules/pkg/index.ts',
        entrypoints,
        include: undefined,
        exclude: undefined,
      })
    ).toBe(false);
  });

  it('requires a configured entrypoint signal and member-chain hint', () => {
    const entrypoints = normalizeEntrypoints({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    });

    expect(
      shouldInspectSource({
        code: "import { createAPIClient } from './api'; const api = createAPIClient();",
        id: '/repo/src/App.tsx',
        entrypoints,
        include: undefined,
        exclude: undefined,
      })
    ).toBe(false);

    expect(
      shouldInspectSource({
        code: "import { createAPIClient } from './api'; createAPIClient().pets.getPets.useQuery();",
        id: '/repo/src/App.tsx',
        entrypoints,
        include: undefined,
        exclude: undefined,
      })
    ).toBe(true);
  });

  it('honors include and exclude filters', () => {
    const entrypoints = normalizeEntrypoints({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    });

    expect(
      shouldInspectSource({
        code: "import { createAPIClient } from './api'; createAPIClient().pets.getPets.useQuery();",
        id: '/repo/src/App.tsx',
        entrypoints,
        include: /src\/App/,
        exclude: /App/,
      })
    ).toBe(false);

    expect(
      shouldInspectSource({
        code: "import { createAPIClient } from './api'; createAPIClient().pets.getPets.useQuery();",
        id: '/repo/src/App.tsx',
        entrypoints,
        include: /src\/App/,
        exclude: undefined,
      })
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run source gate tests to verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/source-gate.test.ts
```

Expected: FAIL because `source-gate.ts` does not exist.

- [ ] **Step 3: Implement `source-gate.ts`**

Create `packages/tree-shaking-plugin/src/lib/transform/source-gate.ts`:

```ts
import type { ClientEntrypoint, FilterPattern } from './types.js';

type ShouldInspectSourceInput = {
  code: string;
  id: string;
  entrypoints: ClientEntrypoint[];
  include: FilterPattern | undefined;
  exclude: FilterPattern | undefined;
};

const MEMBER_CHAIN_HINTS = [
  '.schema',
  '.useQuery',
  '.useSuspenseQuery',
  '.useInfiniteQuery',
  '.useMutation',
  '.useIsFetching',
  '.useIsMutating',
  '.useMutationState',
  '.getQueryKey',
  '.getInfiniteQueryKey',
  '.getMutationKey',
  '.getQueryData',
  '.setQueryData',
  '.invalidateQueries',
  '.fetchQuery',
  '.prefetchQuery',
  '.ensureQueryData',
] as const;

export function shouldInspectSource({
  code,
  id,
  entrypoints,
  include,
  exclude,
}: ShouldInspectSourceInput): boolean {
  if (entrypoints.length === 0) return false;
  if (!shouldTransformId(id, include, exclude)) return false;
  if (!hasEntrypointSignal(code, entrypoints)) return false;
  if (!MEMBER_CHAIN_HINTS.some((hint) => code.includes(hint))) return false;
  return true;
}

function shouldTransformId(
  id: string,
  include: FilterPattern | undefined,
  exclude: FilterPattern | undefined
) {
  if (id.includes('/node_modules/')) return false;
  if (!/\.[cm]?[jt]sx?$/.test(id)) return false;
  if (matchesPattern(id, exclude)) return false;
  if (include && !matchesPattern(id, include)) return false;
  return true;
}

function hasEntrypointSignal(code: string, entrypoints: ClientEntrypoint[]) {
  return entrypoints.some((entrypoint) => {
    if (entrypoint.kind === 'generatedFactory') {
      return (
        code.includes(entrypoint.factory.exportName) ||
        code.includes(entrypoint.factory.moduleSpecifier)
      );
    }

    return (
      code.includes(entrypoint.client.exportName) ||
      code.includes(entrypoint.client.moduleSpecifier)
    );
  });
}

function matchesPattern(
  id: string,
  pattern: FilterPattern | undefined
): boolean {
  if (!pattern) return false;
  if (Array.isArray(pattern))
    return pattern.some((item) => matchesPattern(id, item));
  if (typeof pattern === 'string') return id.includes(pattern);
  return pattern.test(id);
}
```

- [ ] **Step 4: Wire source gate into `core.ts`**

In `packages/tree-shaking-plugin/src/core.ts`, import:

```ts
import { normalizeEntrypoints } from './lib/transform/entrypoints.js';
import { shouldInspectSource } from './lib/transform/source-gate.js';
```

Replace the initial option checks inside `transformQraftTreeShaking(...)`:

```ts
  if (!shouldTransformId(id, options)) return null;

  const factoryOptions = options.createAPIClientFn ?? [];
  const precreatedOptions = options.apiClient ?? [];
  if (factoryOptions.length === 0 && precreatedOptions.length === 0) {
    return debugSkip(options, id, 'no API clients configured');
  }
```

with:

```ts
  const entrypoints = normalizeEntrypoints(options);
  if (
    !shouldInspectSource({
      code,
      id,
      entrypoints,
      include: options.include,
      exclude: options.exclude,
    })
  ) {
    return null;
  }
```

Do not delete `shouldTransformId(...)`, `matchesPattern(...)`, or `debugSkip(...)` yet if TypeScript still needs them. Remove them only after `core.ts` compiles without those helpers.

- [ ] **Step 5: Run source gate and current focused core tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/source-gate.test.ts src/__tests__/core/resolution-and-module-access.test.ts
```

Expected: PASS or focused failures where previous "no config" debug behavior now returns ordinary silent null. If `resolution-and-module-access.test.ts` expected debug output, update that test to the new silent ordinary skip contract.

- [ ] **Step 6: Commit source gate**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.ts \
  packages/tree-shaking-plugin/src/lib/transform/source-gate.ts \
  packages/tree-shaking-plugin/src/lib/transform/source-gate.test.ts
git commit -m "refactor: add tree-shaking source gate"
```

Expected: one commit for the source gate.

## Task 4: Extract Generated Metadata Inspection

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts`
- Create: `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`

- [ ] **Step 1: Add generated metadata tests**

Create `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts`:

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createFixtureModuleAccess,
  getContextFixtureFiles,
  PETS_SERVICE_TS,
  PRECREATED_API_INDEX_TS,
  SERVICES_INDEX_TS,
  writeFixtureFiles,
} from '../../__tests__/core/fixtures.js';
import { normalizeEntrypoints } from './entrypoints.js';
import { inspectGeneratedEntrypoints } from './generated-metadata.js';

async function mkFixture(files: Record<string, string>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-metadata-'));
  await writeFixtureFiles(root, files);
  return root;
}

describe('inspectGeneratedEntrypoints', () => {
  it('reads generated factory metadata with static services ownership', async () => {
    const root = await mkFixture({
      ...getContextFixtureFiles('APIClientContext', './APIClientContext', true),
    });
    const sourceFile = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      createAPIClientFn: [
        {
          name: 'createAPIClient',
          module: './api',
          context: 'APIClientContext',
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId: sourceFile,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toMatchObject({
      factoryFile: path.join(root, 'src/api/index.ts'),
      servicesDir: './services',
      runtimeContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: './APIClientContext',
      },
    });
  });

  it('returns an unresolved reason when generated source is unavailable', async () => {
    const root = await mkFixture({});
    const sourceFile = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId: sourceFile,
      entrypoints,
      moduleAccess: {
        resolve: async () => path.join(root, 'src/api/index.ts'),
        load: async () => null,
      },
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toBeNull();
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        layer: 'generated-metadata',
        code: 'entrypoint-source-unavailable',
        entrypointKey: entrypoints[0].key,
      })
    );
  });

  it('returns an unresolved reason for factories without static services imports', async () => {
    const root = await mkFixture({
      'src/api/createAPIClient.ts': `
import { qraftAPIClient } from '@openapi-qraft/react';
export function createAPIClient(services) {
  return qraftAPIClient(services, {});
}
`,
      'src/api/services/PetsService.ts': PETS_SERVICE_TS,
    });
    const sourceFile = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      createAPIClientFn: [
        { name: 'createAPIClient', module: './api/createAPIClient' },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId: sourceFile,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toBeNull();
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'generated-services-import-missing',
      })
    );
  });

  it('validates precreated clients against the configured factory', async () => {
    const root = await mkFixture({
      'src/api/index.ts': PRECREATED_API_INDEX_TS,
      'src/api/services/index.ts': SERVICES_INDEX_TS,
      'src/api/services/PetsService.ts': PETS_SERVICE_TS,
      'src/client-options.ts': `export const createAPIClientOptions = () => ({ queryClient: {} });`,
      'src/client.ts': `
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';
export const APIClient = createAPIClient(createAPIClientOptions());
`,
    });
    const sourceFile = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      apiClient: [
        {
          client: 'APIClient',
          clientModule: './client',
          createAPIClientFn: 'createAPIClient',
          createAPIClientFnModule: './api',
          createAPIClientFnOptions: 'createAPIClientOptions',
          createAPIClientFnOptionsModule: './client-options',
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId: sourceFile,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toMatchObject({
      factoryFile: path.join(root, 'src/api/index.ts'),
      optionsFactory: {
        exportName: 'createAPIClientOptions',
        moduleSpecifier: './client-options',
      },
    });
  });
});
```

- [ ] **Step 2: Run generated metadata tests to verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/generated-metadata.test.ts
```

Expected: FAIL because `generated-metadata.ts` does not exist.

- [ ] **Step 3: Add metadata result types**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, add:

```ts
export type GeneratedClientMetadata = {
  entrypoint: ClientEntrypoint;
  factoryFile: string;
  servicesDir: string;
  serviceImportPaths: Record<string, string>;
  runtimeContext: RuntimeContextConfig | null;
  optionsFactory?: ImportTarget;
};

export type GeneratedMetadataResult = {
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>;
  reasons: DiagnosticReason[];
};
```

- [ ] **Step 4: Move generated-source helpers from `plan.ts` into `generated-metadata.ts`**

Create `packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts` by moving the current helper responsibilities out of `plan.ts`:

```ts
import type { QraftModuleAccess } from '../resolvers/common.js';
import type {
  ClientEntrypoint,
  DiagnosticReason,
  GeneratedClientMetadata,
  GeneratedMetadataResult,
} from './types.js';

type InspectGeneratedEntrypointsInput = {
  importerId: string;
  entrypoints: ClientEntrypoint[];
  moduleAccess: QraftModuleAccess;
};

export async function inspectGeneratedEntrypoints({
  importerId,
  entrypoints,
  moduleAccess,
}: InspectGeneratedEntrypointsInput): Promise<GeneratedMetadataResult> {
  const metadataByEntrypointKey = new Map<
    string,
    GeneratedClientMetadata | null
  >();
  const reasons: DiagnosticReason[] = [];

  for (const entrypoint of entrypoints) {
    const inspected =
      entrypoint.kind === 'generatedFactory'
        ? await inspectGeneratedFactoryEntrypoint(
            importerId,
            entrypoint,
            moduleAccess
          )
        : await inspectPrecreatedClientEntrypoint(
            importerId,
            entrypoint,
            moduleAccess
          );

    metadataByEntrypointKey.set(entrypoint.key, inspected.metadata);
    if (inspected.reason) reasons.push(inspected.reason);
  }

  return { metadataByEntrypointKey, reasons };
}
```

Then move the existing implementations behind these internal functions:

- `resolveFactoryModule(...)`;
- `readGeneratedClientInfo(...)`;
- `findFactoryReexport(...)`;
- `readServiceImportPaths(...)`;
- `readExportedDeclarationChain(...)`;
- `readTopLevelImportBindings(...)`;
- `matchesConfiguredBinding(...)`;
- helper functions needed by those routines.

Preserve existing behavior first. Do not rewrite traversal logic in this step except to return `DiagnosticReason` instead of calling `debugSkip(...)`.

- [ ] **Step 5: Keep legacy planner compiling through an adapter**

In `plan.ts`, temporarily import the new inspector:

```ts
import { inspectGeneratedEntrypoints } from './generated-metadata.js';
import { normalizeEntrypoints } from './entrypoints.js';
```

At the start of `createTransformPlan(...)`, compute:

```ts
  const entrypoints = normalizeEntrypoints(options);
  const generatedMetadata = await inspectGeneratedEntrypoints({
    importerId: id,
    entrypoints,
    moduleAccess,
  });
```

For this task, it is acceptable to keep the old `generatedInfoByImport` maps and old helpers if removing them would make the patch too broad. The required end state for this task is:

- new `generated-metadata.test.ts` passes;
- old core tests still pass;
- generated metadata inspection is callable independently.

If duplicated helpers remain after this task, mark the duplicated helper deletion in Task 5 rather than mixing it into this extraction.

- [ ] **Step 6: Run generated metadata and core tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/transform/generated-metadata.test.ts src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit metadata boundary extraction**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/generated-metadata.ts \
  packages/tree-shaking-plugin/src/lib/transform/generated-metadata.test.ts \
  packages/tree-shaking-plugin/src/lib/transform/plan.ts
git commit -m "refactor: extract generated metadata inspection"
```

Expected: one commit with the metadata boundary and tests.

## Task 5: Route Planner Through Normalized Entrypoints And Metadata

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`

- [ ] **Step 1: Add a focused planner regression for metadata-driven context**

In `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`, add this test near the context tests:

```ts
  it('uses generated context metadata when config omits context but source proves it', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();
api.pets.getPets.useQuery();
`,
      sourceFile,
      {
        createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
      }
    );

    expect(result?.code).toContain('qraftReactAPIClient');
    expect(result?.code).toContain('APIClientContext');
  });
```

This pins the design decision that generated metadata can prove context when reliable; explicit config is not the only source of truth.

- [ ] **Step 2: Run the focused regression**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts -t "generated context metadata"
```

Expected: FAIL if the current helper selection only trusts explicit config. PASS is acceptable if current code already satisfies the contract.

- [ ] **Step 3: Extend `ClientBinding` with normalized runtime input**

In `packages/tree-shaking-plugin/src/lib/transform/types.ts`, add:

```ts
export type RuntimeInput =
  | { kind: 'none' }
  | { kind: 'context'; context: RuntimeContextConfig }
  | { kind: 'optionsExpression'; expression: t.Expression }
  | { kind: 'optionsFactoryCall'; target: ImportTarget };
```

Update `ClientBinding`:

```ts
export type ClientBinding = {
  name: string;
  clientSourceKey: string;
  createImportPath: string;
  factory: QraftFactoryConfig;
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
```

Remove `hasExplicitContext` only after all compile errors in this task are fixed.

- [ ] **Step 4: Populate `runtimeInput` for local generated clients**

In `plan.ts`, when pushing zero-argument generated factory clients, use generated metadata:

```ts
const generatedInfo = generatedInfoByImport.get(
  getGeneratedInfoKey(createImportPath, createImport.factory)
);
const runtimeInput =
  generatedInfo?.contextName && generatedInfo.contextImportPath
    ? {
        kind: 'context' as const,
        context: {
          exportName: generatedInfo.contextName,
          moduleSpecifier: generatedInfo.contextImportPath,
        },
      }
    : { kind: 'none' as const };
```

Then include `runtimeInput` in the pushed `ClientBinding`.

For one-argument generated factory clients:

```ts
const runtimeInput = {
  kind: 'optionsExpression' as const,
  expression: t.cloneNode(args[0], true),
};
```

For precreated clients:

```ts
const runtimeInput = {
  kind: 'optionsFactoryCall' as const,
  target: {
    exportName: match.config.createAPIClientFnOptions,
    moduleSpecifier: match.optionsImportPath,
  },
};
```

- [ ] **Step 5: Update helper selection to use `runtimeInput`**

In `mutate.ts`, change `selectOptimizedClientRuntimeHelper(...)` to:

```ts
function selectOptimizedClientRuntimeHelper(
  usage: OperationUsage,
  callbacks: Array<{ callbackName: string }>
): RuntimeHelperKind {
  if (usage.client.runtimeInput.kind !== 'context') return 'api';
  return selectRuntimeHelper(callbacks);
}
```

Then update the context/options/precreated argument emission in `createOptimizedClientDeclaration(...)`:

```ts
if (usage.client.runtimeInput.kind === 'context') {
  if (needsOptions) {
    args.push(t.identifier(usage.client.runtimeInput.context.exportName));
  }
} else if (usage.client.runtimeInput.kind === 'optionsExpression') {
  args.push(t.cloneNode(usage.client.runtimeInput.expression, true));
} else if (usage.client.runtimeInput.kind === 'optionsFactoryCall') {
  args.push(
    t.callExpression(
      t.identifier(usage.client.runtimeInput.target.exportName),
      []
    )
  );
}
```

- [ ] **Step 6: Remove `hasExplicitContext`**

Delete `hasExplicitContext` from `ClientBinding` and every object literal that sets it.

Run:

```bash
rg -n "hasExplicitContext" packages/tree-shaking-plugin/src
```

Expected: no output.

- [ ] **Step 7: Run core transform suites**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/explicit-options.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/mixed-client-modes.test.ts src/__tests__/core/schema-and-imports.test.ts
```

Expected: PASS after intentional snapshot updates. If snapshots change, verify these semantic signals:

- context zero-arg hook usage preserves context runtime;
- explicit options usage passes the original options expression;
- precreated usage calls configured options factory;
- schema usage imports no runtime helper;
- unsupported references keep original clients alive.

- [ ] **Step 8: Commit normalized planner wiring**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/transform/types.ts \
  packages/tree-shaking-plugin/src/lib/transform/plan.ts \
  packages/tree-shaking-plugin/src/lib/transform/mutate.ts \
  packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts
git commit -m "refactor: route tree-shaking through normalized runtime inputs"
```

Expected: one commit removing `hasExplicitContext` and routing helper/argument selection through `runtimeInput`.

## Task 6: Enforce Diagnostics In Core Transform Behavior

**Files:**
- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`

- [ ] **Step 1: Add core diagnostics behavior tests**

In `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts`, add:

```ts
  it('throws by default when a configured transform candidate cannot load generated source', async () => {
    const sourceFile = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')), 'src/App.tsx');

    await expect(
      transformQraftTreeShaking(
        `
import { createAPIClient } from './api';
createAPIClient().pets.getPets.useQuery();
`,
        sourceFile,
        {
          createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
          moduleAccess: {
            resolve: async () => '/virtual/api/index.ts',
            load: async () => null,
          },
        }
      )
    ).rejects.toMatchObject({
      name: 'QraftTreeShakeError',
      reason: expect.objectContaining({
        code: 'entrypoint-source-unavailable',
      }),
    });
  });

  it('skips unresolved transform candidates when diagnostics is off', async () => {
    const sourceFile = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-')), 'src/App.tsx');

    await expect(
      transformQraftTreeShaking(
        `
import { createAPIClient } from './api';
createAPIClient().pets.getPets.useQuery();
`,
        sourceFile,
        {
          diagnostics: 'off',
          createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
          moduleAccess: {
            resolve: async () => '/virtual/api/index.ts',
            load: async () => null,
          },
        }
      )
    ).resolves.toBeNull();
  });
```

If the file does not already import `fs`, `os`, or `path`, add:

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
```

- [ ] **Step 2: Run diagnostics behavior tests to verify they fail**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/resolution-and-module-access.test.ts -t "diagnostics|cannot load generated source"
```

Expected: FAIL until `core.ts` reports unresolved metadata reasons.

- [ ] **Step 3: Report generated metadata reasons from `core.ts` or `plan.ts`**

Where `inspectGeneratedEntrypoints(...)` is called, create a reporter:

```ts
const diagnostics = createDiagnosticReporter(options);
```

For each metadata reason that corresponds to an entrypoint used in the source, call:

```ts
diagnostics.unresolved(reason);
```

Do not throw for entrypoints that have no source signal in the current file. Use the source gate and matched import/use collection to distinguish ordinary no-signal skips from unresolved candidates.

- [ ] **Step 4: Update existing soft-skip tests to explicit off policy**

Any existing test that intentionally expects `result` to be `null` for a configured source candidate with unresolved generated ownership must add `diagnostics: 'off'`.

Update these known tests:

- `create-api-client-fn.test.ts`
  - `skips generic generated factories that receive services as an argument`
  - `skips generated factories that receive an operation argument without services imports`
- `precreated-api-client.test.ts`
  - `skips a precreated client whose generated factory has no static services import`
  - `skips a precreated client when the imported factory module does not match the configured one`
- `schema-and-imports.test.ts`
  - `skips schema access for generic factories that do not import services`

Example config update:

```ts
{
  diagnostics: 'off',
  createAPIClientFn: [
    { name: 'createAPIClient', module: './api/createAPIClient' },
  ],
}
```

- [ ] **Step 5: Run diagnostics and skip tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/resolution-and-module-access.test.ts src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/schema-and-imports.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit diagnostics behavior**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.ts \
  packages/tree-shaking-plugin/src/lib/transform/plan.ts \
  packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts \
  packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts
git commit -m "feat: enforce tree-shaking diagnostics policy"
```

Expected: one commit implementing default error diagnostics for unresolved candidates.

## Task 7: Documentation And Full Verification

**Files:**
- Modify: `packages/tree-shaking-plugin/README.md`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md`

- [ ] **Step 1: Update README configuration docs**

In `packages/tree-shaking-plugin/README.md`, under configuration options, add:

```md
- `diagnostics` - controls unresolved transform candidates:
  - `'error'` (default) throws when configured source looks transformable but
    generated metadata or operation ownership cannot be proven.
  - `'warn'` prints a warning and skips the candidate.
  - `'off'` skips unresolved candidates silently.
```

If the README mentions `debug`, replace that public-facing wording with `diagnostics`. If `debug` remains temporarily supported in code, document it only as legacy compatibility if the package already has a legacy section.

- [ ] **Step 2: Update core test guide if ownership changed**

Open `packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md`.

If new diagnostics behavior or metadata tests changed test ownership, add:

```md
- `resolution-and-module-access.test.ts`
  - Use for diagnostics behavior when generated modules cannot be resolved or loaded through module access.
```

If no core test ownership changed, leave this file untouched.

- [ ] **Step 3: Run package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
```

Expected: all tree-shaking-plugin tests pass.

- [ ] **Step 4: Run package typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 5: Run package lint**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
```

Expected: no ESLint errors.

- [ ] **Step 6: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 7: Run local e2e guard if package build succeeds**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: `Tree-shaking bundle assertions passed.`

If build fails because workspace build dependencies are stale, run:

```bash
corepack yarn workspace @openapi-qraft/rollup-config build
corepack yarn workspace @qraft/test-utils build
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
cd e2e && corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: the same e2e success message.

- [ ] **Step 8: Commit docs and final cleanup**

Run:

```bash
git add packages/tree-shaking-plugin/README.md \
  packages/tree-shaking-plugin/src/__tests__/core/AGENTS.md
git commit -m "docs: document tree-shaking diagnostics"
```

If `AGENTS.md` did not change, use:

```bash
git add packages/tree-shaking-plugin/README.md
git commit -m "docs: document tree-shaking diagnostics"
```

Expected: one docs commit.

## Self-Review

- Spec coverage: The plan covers transform contract enforcement, diagnostics, entrypoint normalization, source gating, generated metadata inspection, normalized runtime inputs, test updates, README docs, package verification, and e2e verification.
- Scope control: The plan does not implement a generated manifest, automatic dev/build detection, optional-chain transforms, computed-property transforms, public generated-client type changes, or a full `TransformEditPlan` rewrite.
- Capability preservation: Generated factory config, pre-created client config, options factory config, context/contextModule config, schema rewrites, explicit options rewrites, and strict services ownership rules remain supported.
- Risk checkpoints: Each major layer has focused tests before implementation and a commit after passing verification.
