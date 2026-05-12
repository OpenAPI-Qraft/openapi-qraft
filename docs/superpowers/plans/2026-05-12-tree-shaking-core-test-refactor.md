# Tree-Shaking Core Test Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]` / `- [x]`) syntax for tracking.

**Goal:** Split `packages/tree-shaking-plugin/src/core.test.ts` into focused test files with shared fixtures, then add representative coverage for currently weak callback classes, mixed client modes, context detection, import identity, and unsupported syntax.

**Architecture:** Keep inline snapshots as the source of truth, but move shared setup into small helper files under `packages/tree-shaking-plugin/src/__tests__/core/`. Execute the work in two phases: first a mechanical split that preserves behavior, then a coverage pass that adds new representative regressions without creating a full Cartesian product.

**Tech Stack:** TypeScript, Vitest, Babel-generated inline snapshots, existing fixture module access helpers, `@jridgewell/trace-mapping`, `@qraft/test-utils/vitestFsMock`.

**Current status:** the old `packages/tree-shaking-plugin/src/core.test.ts` file has been deleted after the split. Run focused core transform tests from `packages/tree-shaking-plugin/src/__tests__/core/*.test.ts`.

---

## File Structure

- Create: `packages/tree-shaking-plugin/src/__tests__/core/harness.ts`
  - Owns transform execution, source-map wiring, and fixture-root module access setup.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`
  - Owns generated API fixture source strings, fixture file builders, resolver/load helpers, and filesystem writer.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
  - Context-based and zero-arg `createAPIClientFn` behavior.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts`
  - Explicit-options `createAPIClientFn` behavior.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
  - Configured precreated `apiClient` behavior.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`
  - Files using more than one client mode.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`
  - `.schema`, operation import identity, aliasing, and helper import ordering.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts`
  - Resolver and module access behavior.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/unsupported-and-safety.test.ts`
  - Negative syntax and partial transform safety behavior.
- Create: `packages/tree-shaking-plugin/src/__tests__/core/source-maps.test.ts`
  - Incoming source-map traceability.
- Delete: `packages/tree-shaking-plugin/src/core.test.ts`
  - Delete only after all tests have moved and the package test command passes.

## Existing Test Move Map

Move tests by title exactly as follows.

`create-api-client-fn.test.ts`:

- `collects named and inline usages in one transform plan`
- `imports an operation directly for a context API client`
- `aliases an imported operation when a local binding uses the same name`
- `does not alias a top-level generated client because of an inner scope binding`
- `supports a custom context name from the generated factory import`
- `supports an explicit context module for the generated factory`
- `groups callbacks per operation and imports operationInvokeFn directly`
- `rewrites context-free callbacks from zero-arg createAPIClient calls`
- `transforms factory imported via a barrel when the module config points to the direct file`
- `transforms zero-arg and options calls to a no-context factory`
- `keeps APIClientContext when context-free and contextful callbacks share one client`
- `creates separate optimized clients for multiple operations across services`
- `handles the same operation called via named and inline clients in the same scope`
- `optimizes clients with a single object literal even without known option keys`
- `recognizes a custom factory name imported via a bare module specifier`
- `supports two factory functions that share the same generated services`

`explicit-options.test.ts`:

- `splits explicit options clients across sibling callback scopes`
- `optimizes inline explicit options clients`
- `optimizes mutation callbacks across onMutate, onError, and onSuccess`
- `aliases generated names for explicit options clients inside nested function scopes`
- `preserves void and await prefixes for named and inline client calls`

`precreated-api-client.test.ts`:

- `imports an operation directly for a precreated named API client`
- `keeps precreated optimized client names collision-safe inside shadowed callbacks`
- `supports a precreated default API client export`
- `imports precreated client options from a separate module`
- `imports precreated client options from a fixture-relative module`
- `imports precreated client options from the same module as the client`
- `skips a precreated client created by a local same-named factory`
- `skips a precreated client when the imported factory module does not match the configured one`
- `skips namespace and dynamic imports of precreated clients`
- `keeps a partially transformed precreated client import`

`mixed-client-modes.test.ts`:

- `keeps original clients independently for partial mixed-mode transforms`
- `supports context-based and explicit-options createAPIClientFn clients in one file`
- `keeps same-operation rewrites separate across all client modes`
- `supports top-level createAPIClientFn and precreated apiClient clients in one file`
- `supports createAPIClientFn and precreated apiClient clients in one file`
- `keeps generated names collision-safe across mixed client modes`

`schema-and-imports.test.ts`:

- `rewrites schema accesses from context-based and zero-arg createAPIClient calls`
- `rewrites schema accesses from precreated API clients directly to operations`

`resolution-and-module-access.test.ts`:

- `uses module access from options by default when creating a transform plan`
- `resolves a factory module through the fixture resolver when the bundler cannot`
- `does not read generated modules from the filesystem when moduleAccess.load returns null`
- `supports a legacy resolver 4th argument together with module access load options`
- `prefers module access resolve from options over a conflicting legacy resolver 4th argument`
- `does not match a same-named import that resolves to a different module`
- `returns null when the specifier cannot be resolved`
- `skips when createAPIClientFn is empty`

`unsupported-and-safety.test.ts`:

- `keeps the original client when an unsupported reference remains`
- `skips exported clients`

`source-maps.test.ts`:

- `keeps a rewritten user call site traceable through an incoming source map`

## Task 1: Create Shared Test Helpers

**Files:**
- Create: `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`
- Create: `packages/tree-shaking-plugin/src/__tests__/core/harness.ts`
- Read: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Create the test helper directory**

Run:

```bash
mkdir -p packages/tree-shaking-plugin/src/__tests__/core
```

Expected: directory exists.

- [x] **Step 2: Add fixture source constants and builders**

Create `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts` with this structure. Copy the exact source strings and helper bodies from `packages/tree-shaking-plugin/src/core.test.ts`, then export them.

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type { QraftModuleAccess } from '../../lib/resolvers/common.js';

export const PRECREATED_API_INDEX_TS = `
import { qraftAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(options?: { queryClient: unknown }) {
  return qraftAPIClient(services, defaultCallbacks, options);
}
`;

export const SERVICES_INDEX_TS = `
import { petsService } from './PetsService';
import { storesService } from './StoresService';

export const services = {
  pets: petsService,
  stores: storesService,
} as const;
`;

export const PETS_SERVICE_TS = `
export const getPets = { schema: { method: 'get', url: '/pets' } };
export const createPet = { schema: { method: 'post', url: '/pets' } };
export const updatePet = { schema: { method: 'put', url: '/pets/{petId}' } };
export const getPetById = { schema: { method: 'get', url: '/pets/{petId}' } };
export const findPetsByStatus = { schema: { method: 'get', url: '/pets/findByStatus' } };

export const petsService = {
  getPets,
  createPet,
  updatePet,
  getPetById,
  findPetsByStatus,
} as const;
`;

export const STORES_SERVICE_TS = `
export const getStores = { schema: { method: 'get', url: '/stores' } };

export const storesService = {
  getStores,
} as const;
`;

export const DEFAULT_PRECREATED_CLIENT_OPTIONS_TS = `
export const createAPIClientOptions = () => ({
  queryClient: {}
});
`;

export function getContextFixtureFiles(
  contextName: string,
  contextModule: string,
  importContext: boolean,
  apiDirName = 'api'
) {
  const apiRoot = `src/${apiDirName}`;

  return {
    [`${apiRoot}/index.ts`]: `${importContext ? `import { ${contextName} } from '${contextModule}';\n` : ''}${contextApiIndexTsBody(contextName)}`,
    [`${apiRoot}/${contextName}.ts`]: `\nexport const ${contextName} = {};\n`,
    [`${apiRoot}/services/index.ts`]: SERVICES_INDEX_TS,
    [`${apiRoot}/services/PetsService.ts`]: PETS_SERVICE_TS,
    [`${apiRoot}/services/StoresService.ts`]: STORES_SERVICE_TS,
  } as const;
}

export function contextApiIndexTsBody(contextName: string) {
  return `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, ${contextName});
}
export function createExtraAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, ${contextName});
}
`;
}

export const PRECREATED_BASE_FILES = {
  'src/api/index.ts': PRECREATED_API_INDEX_TS,
  'src/api/services/index.ts': SERVICES_INDEX_TS,
  'src/api/services/PetsService.ts': PETS_SERVICE_TS,
  'src/api/services/StoresService.ts': STORES_SERVICE_TS,
  'src/client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
} as const;

export function createPrecreatedFixtureFiles(
  clientTs: string,
  extraFiles: Record<string, string> = {}
) {
  return {
    ...PRECREATED_BASE_FILES,
    'src/client.ts': clientTs,
    ...extraFiles,
  } as const;
}

export async function writeFixtureFiles(
  root: string,
  files: Record<string, string>
) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }
}

export async function createFixtureModuleAccess(
  fixtureRoot: string,
  overrides: Partial<QraftModuleAccess> = {}
): Promise<QraftModuleAccess> {
  return {
    resolve:
      overrides.resolve ??
      (async (specifier, importer) =>
        resolveFixtureModule(fixtureRoot, specifier, importer)),
    load:
      overrides.load ??
      (async (id) => {
        try {
          return await fs.readFile(id, 'utf8');
        } catch {
          return null;
        }
      }),
  };
}

export async function resolveFixtureModule(
  fixtureRoot: string,
  specifier: string,
  importer: string
) {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
    return null;
  }

  const candidateBase = specifier.startsWith('/')
    ? specifier
    : path.resolve(path.dirname(importer), specifier);

  const candidates = [
    candidateBase,
    `${candidateBase}.ts`,
    `${candidateBase}.tsx`,
    `${candidateBase}.js`,
    `${candidateBase}.jsx`,
    `${candidateBase}.mts`,
    `${candidateBase}.cts`,
    path.join(candidateBase, 'index.ts'),
    path.join(candidateBase, 'index.tsx'),
    path.join(candidateBase, 'index.js'),
    path.join(candidateBase, 'index.jsx'),
    path.join(candidateBase, 'index.mts'),
    path.join(candidateBase, 'index.cts'),
  ];

  for (const candidate of candidates) {
    if (!candidate.startsWith(fixtureRoot)) continue;

    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}
```

If the copied helper from `core.test.ts` currently has synchronous return type for `createFixtureModuleAccess`, keep the original sync shape instead of forcing async. The important contract is that existing tests can import it without behavioral changes.

- [x] **Step 3: Add transform harness**

Create `packages/tree-shaking-plugin/src/__tests__/core/harness.ts`:

```ts
import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { SourceMapInput } from '@jridgewell/trace-mapping';
import { transformQraftTreeShaking as transformQraftTreeShakingImpl } from '../../core.js';
import { createTransformPlan } from '../../lib/transform/plan.js';
import {
  createFixtureModuleAccess,
  getContextFixtureFiles,
  writeFixtureFiles,
} from './fixtures.js';

export type TransformOptions = Parameters<typeof transformQraftTreeShakingImpl>[2];

type FixtureOptions = {
  contextName?: string;
  contextModule?: string;
  importContext?: boolean;
  apiDirName?: string;
};

export async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: TransformOptions,
  inputSourceMap?: SourceMapInput
) {
  const fixtureRoot = getFixtureRootFromSourceFile(id);
  const moduleAccess = createFixtureModuleAccess(fixtureRoot, {
    resolve: options.moduleAccess?.resolve ?? options.resolve,
  });

  if (options.moduleAccess?.load) {
    return transformQraftTreeShakingImpl(
      code,
      id,
      options,
      {
        ...moduleAccess,
        load: options.moduleAccess.load,
      },
      inputSourceMap
    );
  }

  return transformQraftTreeShakingImpl(
    code,
    id,
    options,
    moduleAccess,
    inputSourceMap
  );
}

export async function createFixture(options: FixtureOptions = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-'));
  const contextName = options.contextName ?? 'APIClientContext';
  const contextModule = options.contextModule ?? `./${contextName}`;
  const importContext = options.importContext ?? true;

  await writeFixtureFiles(root, {
    ...getContextFixtureFiles(
      contextName,
      contextModule,
      importContext,
      options.apiDirName
    ),
  });

  return root;
}

function getFixtureRootFromSourceFile(id: string) {
  const normalizedPath = path.normalize(id);
  const parts = normalizedPath.split(path.sep);
  const srcIndex = parts.lastIndexOf('src');

  if (srcIndex > 0) {
    const fixtureRoot = parts.slice(0, srcIndex).join(path.sep);
    if (fixtureRoot) {
      return fixtureRoot;
    }
  }

  return path.dirname(path.dirname(id));
}

export { createTransformPlan };
```

This helper intentionally detects the fixture root by the `src` path segment before falling back to the legacy two-directory behavior. Later moved tests should compute source files with `path.join(fixture, 'src/App.tsx')` or a nested path under `src/**`.

- [x] **Step 4: Run typecheck for helper compile errors**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS. If it fails because a copied helper signature differs from current `core.test.ts`, align the new helper with the current code before continuing.

- [x] **Step 5: Commit shared helpers**

Run:

```bash
git add packages/tree-shaking-plugin/src/__tests__/core
git commit -m "test(tree-shaking): add core transform test helpers"
```

## Task 2: Move Context and CreateAPIClientFn Tests

**Files:**
- Create: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/harness.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`

- [x] **Step 1: Create the destination test file with imports**

Create `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import {
  createFixture,
  createTransformPlan,
  transformQraftTreeShaking,
} from './harness.js';
import {
  getContextFixtureFiles,
  writeFixtureFiles,
} from './fixtures.js';
```

Add imports only when the moved tests require them. Keep imports explicit and remove unused imports before committing.

- [x] **Step 2: Move the plan-introspection test**

Move `collects named and inline usages in one transform plan` from `core.test.ts` into this file under:

```ts
describe('transformQraftTreeShaking createAPIClientFn clients', () => {
  it('collects named and inline usages in one transform plan', async () => {
    // moved body
  });
});
```

Update helper calls to use `createFixture(...)` and exported fixture module access. Preserve the same assertions.

- [x] **Step 3: Move zero-arg context and factory import tests**

Move these tests into the same describe block:

- `imports an operation directly for a context API client`
- `aliases an imported operation when a local binding uses the same name`
- `does not alias a top-level generated client because of an inner scope binding`
- `supports a custom context name from the generated factory import`
- `supports an explicit context module for the generated factory`
- `groups callbacks per operation and imports operationInvokeFn directly`
- `rewrites context-free callbacks from zero-arg createAPIClient calls`
- `transforms factory imported via a barrel when the module config points to the direct file`
- `transforms zero-arg and options calls to a no-context factory`
- `keeps APIClientContext when context-free and contextful callbacks share one client`
- `creates separate optimized clients for multiple operations across services`
- `handles the same operation called via named and inline clients in the same scope`
- `optimizes clients with a single object literal even without known option keys`
- `recognizes a custom factory name imported via a bare module specifier`
- `supports two factory functions that share the same generated services`

Remove each moved test from `core.test.ts` in the same edit so it does not run twice.

- [x] **Step 4: Apply naming cleanup while moving**

Only inside moved fixture source strings, rename misleading options-like values. For example:

```ts
const apiOptions = { queryClient: {} };
createAPIClient(apiOptions).pets.findPetsByStatus.invalidateQueries();
```

Do not rename intentionally collision-sensitive values such as `api_pets_getPets` unless the snapshot is not testing that collision.

- [x] **Step 5: Run the moved file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/__tests__/core/create-api-client-fn.test.ts
```

Expected: PASS.

If snapshots fail only because import order or fixture naming changed intentionally, run the same command with `-u` and inspect the snapshot before committing:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/__tests__/core/create-api-client-fn.test.ts -u
```

- [x] **Step 6: Run full package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: PASS.

- [x] **Step 7: Commit context/createAPIClientFn split**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts packages/tree-shaking-plugin/src/__tests__/core/harness.ts packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts
git commit -m "test(tree-shaking): split createAPIClientFn core tests"
```

## Task 3: Move Explicit-Options Tests

**Files:**
- Create: `packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`

- [x] **Step 1: Create explicit-options test file**

Create `packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { transformQraftTreeShaking } from './harness.js';
import { getContextFixtureFiles, writeFixtureFiles } from './fixtures.js';

describe('transformQraftTreeShaking explicit options clients', () => {
});
```

- [x] **Step 2: Move explicit-options tests**

Move these tests from `core.test.ts` into the describe block and remove them from `core.test.ts`:

- `splits explicit options clients across sibling callback scopes`
- `optimizes inline explicit options clients`
- `optimizes mutation callbacks across onMutate, onError, and onSuccess`
- `aliases generated names for explicit options clients inside nested function scopes`
- `preserves void and await prefixes for named and inline client calls`

- [x] **Step 3: Clean options/context variable names**

While moving, replace misleading `apiContext` names that are actually options objects with `apiOptions` or `queryClientOptions`.

Keep this React context shape where the value comes from `useContext(...)`:

```ts
const apiContext = useContext(APIClientContext);
```

Keep mutation fixtures realistic with `onMutate`, `onError`, and `onSuccess` where already present.

- [x] **Step 4: Run the explicit-options file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/__tests__/core/explicit-options.test.ts
```

Expected: PASS. Use `-u` only for inspected snapshot changes caused by naming cleanup.

- [x] **Step 5: Run full package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: PASS.

- [x] **Step 6: Commit explicit-options split**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts
git commit -m "test(tree-shaking): split explicit options core tests"
```

## Task 4: Move Precreated API Client Tests

**Files:**
- Create: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`

- [x] **Step 1: Create precreated test file**

Create `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { transformQraftTreeShaking } from './harness.js';
import {
  DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
  createPrecreatedFixtureFiles,
  writeFixtureFiles,
} from './fixtures.js';

describe('transformQraftTreeShaking precreated apiClient clients', () => {
});
```

- [x] **Step 2: Move precreated tests**

Move these tests into the describe block and remove them from `core.test.ts`:

- `imports an operation directly for a precreated named API client`
- `keeps precreated optimized client names collision-safe inside shadowed callbacks`
- `supports a precreated default API client export`
- `imports precreated client options from a separate module`
- `imports precreated client options from a fixture-relative module`
- `imports precreated client options from the same module as the client`
- `skips a precreated client created by a local same-named factory`
- `skips a precreated client when the imported factory module does not match the configured one`
- `skips namespace and dynamic imports of precreated clients`
- `keeps a partially transformed precreated client import`

- [x] **Step 3: Preserve intentional collision comments**

Keep existing English comments that explain shadowing or collision intent. If a moved fixture has intentionally strange local names, add this kind of short comment in the source string:

```ts
// These locals intentionally shadow the generated optimized client name.
```

- [x] **Step 4: Run precreated test file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/__tests__/core/precreated-api-client.test.ts
```

Expected: PASS.

- [x] **Step 5: Run full package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: PASS.

- [x] **Step 6: Commit precreated split**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts
git commit -m "test(tree-shaking): split precreated apiClient core tests"
```

## Task 5: Move Mixed-Mode Tests

**Files:**
- Create: `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts`

- [x] **Step 1: Create mixed-mode test file**

Create `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { transformQraftTreeShaking } from './harness.js';
import {
  DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
  PRECREATED_API_INDEX_TS,
  PETS_SERVICE_TS,
  SERVICES_INDEX_TS,
  STORES_SERVICE_TS,
  getContextFixtureFiles,
  writeFixtureFiles,
} from './fixtures.js';

describe('transformQraftTreeShaking mixed client modes', () => {
});
```

- [x] **Step 2: Move mixed-mode tests**

Move these tests into the describe block and remove them from `core.test.ts`:

- `keeps original clients independently for partial mixed-mode transforms`
- `supports context-based and explicit-options createAPIClientFn clients in one file`
- `keeps same-operation rewrites separate across all client modes`
- `supports top-level createAPIClientFn and precreated apiClient clients in one file`
- `supports createAPIClientFn and precreated apiClient clients in one file`
- `keeps generated names collision-safe across mixed client modes`

- [x] **Step 3: Enforce realistic mixed-mode snippets**

For React-like context usage, preserve this shape:

```ts
const apiContext = useContext(ContextAPIClientContext);

useEffect(() => {
  void createAPIClient(apiContext!).pets.getPets.invalidateQueries();
}, [apiContext]);
```

For top-level cases, keep top-level calls only where the title explicitly covers top-level behavior.

- [x] **Step 4: Run mixed-mode test file**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/__tests__/core/mixed-client-modes.test.ts
```

Expected: PASS.

- [x] **Step 5: Run full package tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: PASS.

- [x] **Step 6: Commit mixed-mode split**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts packages/tree-shaking-plugin/src/__tests__/core/fixtures.ts
git commit -m "test(tree-shaking): split mixed client mode tests"
```

## Task 6: Move Schema, Resolution, Safety, and Source-Map Tests

**Files:**
- Create: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`
- Create: `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts`
- Create: `packages/tree-shaking-plugin/src/__tests__/core/unsupported-and-safety.test.ts`
- Create: `packages/tree-shaking-plugin/src/__tests__/core/source-maps.test.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`
- Modify: helper files under `packages/tree-shaking-plugin/src/__tests__/core/`

- [x] **Step 1: Create schema/import test file**

Create `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts` and move:

- `rewrites schema accesses from context-based and zero-arg createAPIClient calls`
- `rewrites schema accesses from precreated API clients directly to operations`

Use imports from `harness.ts` and `fixtures.ts`. Remove the moved tests from `core.test.ts`.

- [x] **Step 2: Create resolution/module-access test file**

Create `packages/tree-shaking-plugin/src/__tests__/core/resolution-and-module-access.test.ts` and move:

- `uses module access from options by default when creating a transform plan`
- `resolves a factory module through the fixture resolver when the bundler cannot`
- `does not read generated modules from the filesystem when moduleAccess.load returns null`
- `supports a legacy resolver 4th argument together with module access load options`
- `prefers module access resolve from options over a conflicting legacy resolver 4th argument`
- `does not match a same-named import that resolves to a different module`
- `returns null when the specifier cannot be resolved`
- `skips when createAPIClientFn is empty`

Import `vi` from `vitest` if the moved tests still use spies.

- [x] **Step 3: Create unsupported/safety test file**

Create `packages/tree-shaking-plugin/src/__tests__/core/unsupported-and-safety.test.ts` and move:

- `keeps the original client when an unsupported reference remains`
- `skips exported clients`

Add the negative syntax coverage from Task 8 later. This task only moves existing tests.

- [x] **Step 4: Create source-map test file**

Create `packages/tree-shaking-plugin/src/__tests__/core/source-maps.test.ts` and move:

- `keeps a rewritten user call site traceable through an incoming source map`

Move the `TraceMap` / `originalPositionFor` imports from `core.test.ts` into this file.

- [x] **Step 5: Run the four moved files**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run \
  src/__tests__/core/schema-and-imports.test.ts \
  src/__tests__/core/resolution-and-module-access.test.ts \
  src/__tests__/core/unsupported-and-safety.test.ts \
  src/__tests__/core/source-maps.test.ts
```

Expected: PASS.

- [x] **Step 6: Run full package tests and typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [x] **Step 7: Commit final existing-test split**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/__tests__/core
git commit -m "test(tree-shaking): split remaining core transform tests"
```

## Task 7: Delete the Old Core Test File

**Files:**
- Delete: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Verify no tests remain in core.test.ts**

Run:

```bash
test ! -e packages/tree-shaking-plugin/src/core.test.ts || rg -n "^  it\\(" packages/tree-shaking-plugin/src/core.test.ts
```

Expected: exit code `0`, or no `it(...)` output if the file still exists during migration. If output remains, move those tests to the correct file before continuing.

- [x] **Step 2: Delete the old file**

Run:

```bash
rm packages/tree-shaking-plugin/src/core.test.ts
```

- [x] **Step 3: Verify no imports point to core.test.ts**

Run:

```bash
rg -n "core\\.test" packages/tree-shaking-plugin/src package.json packages/tree-shaking-plugin
```

Expected: no required runtime/test import references. Documentation references are acceptable only if they describe historical commits; otherwise update them.

- [x] **Step 4: Run full package verification**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [x] **Step 5: Commit file deletion**

Run:

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/__tests__/core
git commit -m "test(tree-shaking): remove monolithic core test file"
```

## Task 8: Add Callback-Class Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/explicit-options.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/precreated-api-client.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`

- [x] **Step 1: Add context-client suspense and infinite hook coverage**

In `create-api-client-fn.test.ts`, add a test titled:

```ts
it('rewrites representative suspense and infinite hook callbacks for context clients', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const reactApi = createAPIClient();

export function App() {
  reactApi.pets.getPets.useSuspenseQuery();
  reactApi.pets.findPetsByStatus.useInfiniteQuery();
}
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toMatchInlineSnapshot();
});
```

Run with `-u` after confirming the output uses `qraftReactAPIClient` and imports `useSuspenseQuery` and `useInfiniteQuery` from their callback modules.

- [x] **Step 2: Add explicit-options fetch/prefetch/ensure coverage**

In `explicit-options.test.ts`, add a test titled:

```ts
it('rewrites fetch, prefetch, and ensure callbacks for explicit options clients', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const queryClientOptions = { queryClient: {} };
const optionsApi = createAPIClient(queryClientOptions);

async function loadPets() {
  await optionsApi.pets.getPets.fetchQuery();
  await optionsApi.pets.findPetsByStatus.prefetchQuery();
  return optionsApi.pets.getPetById.ensureQueryData({ parameters: { petId: 1 } });
}
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toMatchInlineSnapshot();
});
```

Run with `-u` after confirming the output uses `qraftAPIClient` with `queryClientOptions` and imports `fetchQuery`, `prefetchQuery`, and `ensureQueryData`.

- [x] **Step 3: Add precreated global state callback coverage**

In `precreated-api-client.test.ts`, add a test titled:

```ts
it('rewrites query-client state callbacks for precreated clients', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');
  await writeFixtureFiles(
    fixture,
    createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`)
  );

  const result = await transformQraftTreeShaking(
    `
import { APIClient } from './client';

APIClient.pets.getPets.getQueryState();
APIClient.pets.getPets.isFetching();
APIClient.pets.updatePet.isMutating();
`,
    sourceFile,
    {
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
    }
  );

  expect(result?.code).toMatchInlineSnapshot();
});
```

Run with `-u` after confirming the output imports `getQueryState`, `isFetching`, and `isMutating`.

- [x] **Step 4: Add mixed-mode callback-class coverage**

In `mixed-client-modes.test.ts`, add a test titled:

```ts
it('keeps callback-class rewrites separate across context and precreated modes', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-'));
  await writeFixtureFiles(root, {
    ...getContextFixtureFiles('ContextAPIClientContext', './ContextAPIClientContext', true, 'context-api'),
    'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
    'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
    'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
    'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
    'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
    'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
  });
  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient, ContextAPIClientContext } from './context-api';
import { APIClient } from './precreated-client';
import { useContext, useEffect } from 'react';

const reactApi = createAPIClient();

export function App() {
  const apiContext = useContext(ContextAPIClientContext);
  reactApi.pets.getPets.useSuspenseQuery();
  useEffect(() => {
    void createAPIClient(apiContext!).pets.findPetsByStatus.fetchQuery();
  }, [apiContext]);
  APIClient.pets.getPets.getInfiniteQueryKey();
}
`,
    sourceFile,
    {
      createAPIClientFn: [{ name: 'createAPIClient', module: './context-api' }],
      apiClient: [
        {
          client: 'APIClient',
          clientModule: './precreated-client',
          createAPIClientFn: 'createAPIClient',
          createAPIClientFnModule: './precreated-api',
          createAPIClientFnOptions: 'createAPIClientOptions',
          createAPIClientFnOptionsModule: './precreated-client-options',
        },
      ],
    }
  );

  expect(result?.code).toMatchInlineSnapshot();
});
```

Run with `-u` after confirming context and precreated imports remain source-separated.

- [x] **Step 5: Run callback coverage tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run \
  src/__tests__/core/create-api-client-fn.test.ts \
  src/__tests__/core/explicit-options.test.ts \
  src/__tests__/core/precreated-api-client.test.ts \
  src/__tests__/core/mixed-client-modes.test.ts
```

Expected: PASS.

- [x] **Step 6: Run full verification**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [x] **Step 7: Commit callback coverage**

Run:

```bash
git add packages/tree-shaking-plugin/src/__tests__/core
git commit -m "test(tree-shaking): cover representative callback classes"
```

## Task 9: Add Unsupported Syntax and Safety Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/unsupported-and-safety.test.ts`

- [x] **Step 1: Add computed property safety test**

Add:

```ts
it('does not rewrite computed member access', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const api = createAPIClient();
const serviceName = 'pets';

api[serviceName].getPets.useQuery();
api.pets['getPets'].useQuery();
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toMatchInlineSnapshot(`
    "import { createAPIClient } from './api';
    const api = createAPIClient();
    const serviceName = 'pets';
    api[serviceName].getPets.useQuery();
    api.pets['getPets'].useQuery();"
  `);
});
```

If Babel prints quote style differently, update the inline snapshot after confirming the source remains untransformed.

- [x] **Step 2: Add destructuring alias safety test**

Add:

```ts
it('does not rewrite destructured client aliases', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const api = createAPIClient();
const { pets } = api;

pets.getPets.useQuery();
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toContain('pets.getPets.useQuery()');
  expect(result?.code).toContain('const api = createAPIClient();');
});
```

This should remain a partial/no transform for the destructured call because it no longer has the static `client.service.operation.callback` shape.

- [x] **Step 3: Add optional chaining behavior test**

Add:

```ts
it('rewrites static optional member chains when the client binding is clear', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const api = createAPIClient();

api?.pets?.getPets?.useQuery();
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toMatchInlineSnapshot();
});
```

Run this test before updating the snapshot. If it exposes a production bug in optional-chain rewriting, fix production only if the change is local to static member path handling. If not local, record a follow-up and keep the test active only when the team wants to fix it immediately.

- [x] **Step 4: Run unsupported safety tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/__tests__/core/unsupported-and-safety.test.ts
```

Expected: PASS.

- [x] **Step 5: Run full verification**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [x] **Step 6: Commit unsupported syntax coverage**

Run:

```bash
git add packages/tree-shaking-plugin/src/__tests__/core/unsupported-and-safety.test.ts
git commit -m "test(tree-shaking): cover unsupported member syntax"
```

## Task 10: Add Context Detection and Import Identity Regressions

**Files:**
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/create-api-client-fn.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/schema-and-imports.test.ts`
- Modify: `packages/tree-shaking-plugin/src/__tests__/core/mixed-client-modes.test.ts`

- [x] **Step 1: Add aliased context import detection regression**

In `create-api-client-fn.test.ts`, add:

```ts
it('infers an aliased generated context from the qraftReactAPIClient third argument', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');
  await writeFixtureFiles(fixture, {
    'src/api/index.ts': `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { APIClientContext as InternalContext } from './APIClientContext';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, InternalContext);
}
`,
    ...getContextFixtureFiles('APIClientContext', './APIClientContext', false),
  });

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

  expect(result?.code).toMatchInlineSnapshot();
});
```

The expected output must import `InternalContext` or an alias-safe context binding from `./api/APIClientContext` and use `qraftReactAPIClient`.

- [x] **Step 2: Add same operation import identity regression for schema**

In `schema-and-imports.test.ts`, add:

```ts
it('aliases same-named schema operation imports from different generated roots', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-'));
  await writeFixtureFiles(root, {
    ...getContextFixtureFiles('ContextAPIClientContext', './ContextAPIClientContext', true, 'context-api'),
    'src/precreated-api/index.ts': PRECREATED_API_INDEX_TS,
    'src/precreated-api/services/index.ts': SERVICES_INDEX_TS,
    'src/precreated-api/services/PetsService.ts': PETS_SERVICE_TS,
    'src/precreated-api/services/StoresService.ts': STORES_SERVICE_TS,
    'src/precreated-client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
    'src/precreated-client.ts': `
import { createAPIClient } from './precreated-api';
import { createAPIClientOptions } from './precreated-client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
  });
  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './context-api';
import { APIClient } from './precreated-client';

const contextApi = createAPIClient();

contextApi.pets.getPets.schema;
APIClient.pets.getPets.schema;
`,
    sourceFile,
    {
      createAPIClientFn: [{ name: 'createAPIClient', module: './context-api' }],
      apiClient: [
        {
          client: 'APIClient',
          clientModule: './precreated-client',
          createAPIClientFn: 'createAPIClient',
          createAPIClientFnModule: './precreated-api',
          createAPIClientFnOptions: 'createAPIClientOptions',
          createAPIClientFnOptionsModule: './precreated-client-options',
        },
      ],
    }
  );

  expect(result?.code).toMatchInlineSnapshot();
});
```

The expected output must import both `getPets` operations with an alias for one of them.

- [x] **Step 3: Run focused context/import identity tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest run \
  src/__tests__/core/create-api-client-fn.test.ts \
  src/__tests__/core/schema-and-imports.test.ts \
  src/__tests__/core/mixed-client-modes.test.ts
```

Expected: PASS.

- [x] **Step 4: Run full verification**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [x] **Step 5: Commit context/import identity regressions**

Run:

```bash
git add packages/tree-shaking-plugin/src/__tests__/core
git commit -m "test(tree-shaking): cover context detection and import identity"
```

## Task 11: Final Suite Audit

**Files:**
- Verify: `packages/tree-shaking-plugin/src/__tests__/core/*.ts`
- Verify: `packages/tree-shaking-plugin/src/core.test.ts`
- Verify: `packages/tree-shaking-plugin/src/lib/transform/callbacks.ts`

- [x] **Step 1: Verify there is no monolithic test file**

Run:

```bash
test ! -e packages/tree-shaking-plugin/src/core.test.ts
```

Expected: exit code `0`.

- [x] **Step 2: Verify skipped tests are policy-approved**

Run:

```bash
rg -n "it\\.skip|describe\\.skip" packages/tree-shaking-plugin/src/__tests__/core
```

Expected: only the policy-approved mixed-root schema import identity skip, or no output.

- [x] **Step 3: Verify callback coverage improved**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const callbacks = fs.readFileSync('packages/tree-shaking-plugin/src/lib/transform/callbacks.ts', 'utf8');
const tests = fs.readdirSync('packages/tree-shaking-plugin/src/__tests__/core')
  .filter((file) => file.endsWith('.test.ts'))
  .map((file) => fs.readFileSync(`packages/tree-shaking-plugin/src/__tests__/core/${file}`, 'utf8'))
  .join('\n');
const names = [...callbacks.matchAll(/^  (\\w+): /gm)].map((match) => match[1]);
for (const name of names) {
  const count = [...tests.matchAll(new RegExp(`\\\\b${name}\\\\b`, 'g'))].length;
  console.log(`${name}: ${count}`);
}
NODE
```

Expected: the callbacks added in Task 8 have non-zero counts.

- [x] **Step 4: Run final verification**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: both PASS.

- [x] **Step 5: Inspect diff summary**

Run:

```bash
git diff --stat HEAD~10..HEAD -- packages/tree-shaking-plugin/src/__tests__/core packages/tree-shaking-plugin/src/core.test.ts
```

Expected:

- old `core.test.ts` deleted;
- new focused test files created;
- helper files created;
- no production transform files changed unless a new regression required a narrow production fix.

- [x] **Step 6: Commit final audit fixes when cleanup edits exist**

When Step 1 through Step 5 required small cleanup edits, commit them:

```bash
git add packages/tree-shaking-plugin/src/__tests__/core packages/tree-shaking-plugin/src/core.test.ts
git commit -m "test(tree-shaking): finalize core test suite split"
```

When no files changed, do not create an empty commit.

## Self-Review

Spec coverage:

- Target file structure is implemented by Tasks 1 through 7.
- Shared helpers are implemented by Task 1.
- Existing test groups are moved by Tasks 2 through 6.
- Old `core.test.ts` removal is covered by Task 7.
- Callback-class coverage is covered by Task 8.
- Unsupported syntax coverage is covered by Task 9.
- Context detection and operation import identity coverage is covered by Task 10.
- Verification is covered by Task 11; the only remaining skip is the documented mixed-root schema import identity production gap accepted by policy.

Placeholder scan:

- No placeholder markers or open-ended implementation placeholders are intentionally left in the plan.
- Every task names exact files and exact commands.
- New test skeletons include concrete source snippets and expected verification behavior.

Type consistency:

- Helper imports use `.js` specifiers, matching existing ESM TypeScript style in the package.
- `TransformOptions` is derived from the production transform signature.
- Fixture helper names match the design spec and current `core.test.ts` helper names.
