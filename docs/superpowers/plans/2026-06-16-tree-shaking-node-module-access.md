# Tree-Shaking Node Module Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an internal Node/filesystem `QraftModuleAccess` adapter for standalone tree-shaking analysis outside bundler plugins.

**Architecture:** Add a focused `src/lib/resolvers/node.ts` adapter that wraps `oxc-resolver` for module resolution and `fs.readFile` for source loading while preserving the existing resolver-chain trace behavior. Keep it internal for now; the project transform utility and CLI will be planned separately.

**Tech Stack:** TypeScript, `oxc-resolver`, Node `fs/promises`, Vitest temporary filesystem fixtures, existing `QraftModuleAccess` resolver strategy helpers.

---

## File Structure

- Modify: `packages/tree-shaking-plugin/package.json`
  - Add `oxc-resolver` as a runtime dependency.
- Modify: `packages/tree-shaking-plugin/rollup.config.mjs`
  - Treat `oxc-resolver` as an external dependency in the package build.
- Create: `packages/tree-shaking-plugin/src/lib/resolvers/node.ts`
  - Owns Node standalone module access creation.
  - Exposes `createNodeModuleAccess(...)`, `NodeModuleAccessOptions`, and `NodeResolverOptions`.
  - Uses `createQraftModuleAccess(...)` so strategy metadata and traces stay compatible with existing diagnostics.
- Create: `packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts`
  - Owns resolver/load behavior tests for the Node adapter.
  - Imports `@qraft/test-utils/vitestFsMock` like the core tree-shaking harness.
  - Uses virtual filesystem coverage for adapter `load(...)` behavior where the
    code reads through mocked `node:fs/promises`.
  - Detects whether `oxc-resolver` itself observes the mocked filesystem; if it
    does not, resolver fixtures are written to real temporary directories
    through unmocked `node:fs/promises`.
  - Uses one integration smoke through `transformQraftTreeShaking(...)`.
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`
  - Add the Node adapter to existing strategy-order coverage.

## Task 1: Add Dependency And Strategy Metadata Coverage

**Files:**
- Modify: `packages/tree-shaking-plugin/package.json`
- Modify: `packages/tree-shaking-plugin/rollup.config.mjs`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`

- [ ] **Step 1: Add the resolver dependency**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin add oxc-resolver@^11.20.0
```

Expected:

- `packages/tree-shaking-plugin/package.json` contains `"oxc-resolver": "^11.20.0"` under `dependencies`.
- `yarn.lock` is updated.

- [ ] **Step 2: Add `oxc-resolver` to Rollup externals**

In `packages/tree-shaking-plugin/rollup.config.mjs`, update `externalDependencies`:

```js
      externalDependencies: [
        '@babel/generator',
        '@babel/parser',
        '@babel/traverse',
        '@babel/types',
        '@rspack/resolver',
        'oxc-resolver',
        'unplugin',
      ],
```

- [ ] **Step 3: Write failing metadata coverage for the Node adapter**

In `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`, add this import:

```ts
import { createNodeModuleAccess } from './node.js';
```

Then update the `exposes named strategy order for adapter-created module access` test by adding this expectation after the agnostic adapter expectation:

```ts
    expect(
      getQraftModuleAccessStrategyMetadata(createNodeModuleAccess())
    ).toEqual({
      resolve: ['user', 'native'],
      load: ['user', 'adapter-fallback'],
    });
```

- [ ] **Step 4: Run the metadata test and verify it fails**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/resolvers.test.ts -t "exposes named strategy order"
```

Expected: FAIL because `./node.js` does not exist yet.

- [ ] **Step 5: Commit the dependency/test setup**

Run:

```bash
git add yarn.lock packages/tree-shaking-plugin/package.json packages/tree-shaking-plugin/rollup.config.mjs packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts
git commit -m "test: add node module access resolver coverage"
```

## Task 2: Implement Node Module Access Core

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/resolvers/node.ts`
- Test: `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`

- [ ] **Step 1: Create the Node adapter implementation**

Create `packages/tree-shaking-plugin/src/lib/resolvers/node.ts` with:

```ts
import type {
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
  ResolveStrategy,
} from './common.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ResolverFactory } from 'oxc-resolver';
import {
  createQraftModuleAccess,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
  stripQueryAndHash,
} from './common.js';

type ResolverFactoryOptions = NonNullable<
  ConstructorParameters<typeof ResolverFactory>[0]
>;

export type NodeResolverOptions = Partial<ResolverFactoryOptions>;

export type NodeModuleAccessOptions = {
  root?: string;
  tsconfig?: 'auto' | string;
  resolverOptions?: NodeResolverOptions;
  moduleAccess?: QraftModuleAccessOptions;
};

function normalizeTsconfig(
  root: string,
  tsconfig: NodeModuleAccessOptions['tsconfig']
): ResolverFactoryOptions['tsconfig'] {
  if (tsconfig === undefined || tsconfig === 'auto') return 'auto';

  return {
    configFile: path.resolve(root, tsconfig),
    references: 'auto',
  };
}

function createNodeResolveStrategy({
  root = process.cwd(),
  tsconfig,
  resolverOptions,
}: NodeModuleAccessOptions): ResolveStrategy {
  const resolvedRoot = path.resolve(root);
  const resolver = new ResolverFactory({
    conditionNames: ['node', 'import'],
    extensions: ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    },
    ...resolverOptions,
    tsconfig: normalizeTsconfig(resolvedRoot, tsconfig),
  });

  return {
    name: 'native',
    async resolve({ specifier, importer }) {
      try {
        const result = await resolver.resolveFileAsync(importer, specifier);
        if (result.error || result.builtin || !result.path) return null;

        return result.path;
      } catch {
        return null;
      }
    },
  };
}

function createNodeFileLoadStrategy(): LoadStrategy {
  return {
    name: 'adapter-fallback',
    async load({ id }) {
      try {
        return await fs.readFile(stripQueryAndHash(id), 'utf8');
      } catch {
        return null;
      }
    },
  };
}

export function createNodeModuleAccess(
  options: NodeModuleAccessOptions = {}
): QraftModuleAccess {
  return createQraftModuleAccess(
    [
      createUserResolverStrategy(options.moduleAccess?.resolve),
      createNodeResolveStrategy(options),
    ],
    [
      createUserSourceLoaderStrategy(options.moduleAccess?.load),
      createNodeFileLoadStrategy(),
    ]
  );
}
```

- [ ] **Step 2: Run the metadata test and verify it passes**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/resolvers.test.ts -t "exposes named strategy order"
```

Expected: PASS.

- [ ] **Step 3: Run TypeScript and apply the known type fallback if needed**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS.

If this fails because `ResolverFactoryOptions['tsconfig']` has a narrower type
than the inferred object, replace `normalizeTsconfig(...)` with this version:

```ts
function normalizeTsconfig(
  root: string,
  tsconfig: NodeModuleAccessOptions['tsconfig']
) {
  if (tsconfig === undefined || tsconfig === 'auto') return 'auto';

  return {
    configFile: path.resolve(root, tsconfig),
    references: 'auto',
  } satisfies NonNullable<ResolverFactoryOptions['tsconfig']>;
}
```

Then run the same command again and expect PASS.

- [ ] **Step 4: Commit the core adapter**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/resolvers/node.ts
git commit -m "feat: add node module access adapter"
```

## Task 3: Probe Filesystem Strategy, Then Add Node Resolver And Loader Unit Tests

**Files:**
- Create/delete during probe: `packages/tree-shaking-plugin/src/lib/resolvers/node-fs-strategy.test.ts`
- Create: `packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts`

- [ ] **Step 1: Create a temporary filesystem strategy probe**

Create `packages/tree-shaking-plugin/src/lib/resolvers/node-fs-strategy.test.ts` with:

```ts
import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createNodeModuleAccess } from './node.js';

describe('node resolver filesystem strategy probe', () => {
  it('checks whether oxc-resolver can read virtual filesystem fixtures', async () => {
    const root = '/virtual/qraft-node-resolver-probe';
    const importer = path.join(root, 'src/App.tsx');
    const apiIndex = path.join(root, 'src/api/index.ts');

    await fs.mkdir(path.dirname(importer), { recursive: true });
    await fs.mkdir(path.dirname(apiIndex), { recursive: true });
    await fs.writeFile(importer, '');
    await fs.writeFile(apiIndex, '');

    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('./api', importer)).resolves.toBe(apiIndex);
  });
});
```

- [ ] **Step 2: Run the filesystem strategy probe**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/node-fs-strategy.test.ts
```

Expected:

- PASS means `oxc-resolver` can read virtual filesystem fixtures. Use the
  virtual fixture helper block in Step 4.
- FAIL where the resolved value is `null` means `oxc-resolver` does not observe
  the virtual filesystem mock. Use the real temporary filesystem helper block in
  Step 4.

Do not keep both strategies in the final test file.

- [ ] **Step 3: Delete the temporary probe file**

Run:

```bash
rm packages/tree-shaking-plugin/src/lib/resolvers/node-fs-strategy.test.ts
```

Expected: the probe file is removed before any commit. Its result only chooses
which fixture helper block to paste in Step 4.

- [ ] **Step 4: Create `node.test.ts` with one chosen fixture strategy**

If the probe PASSed, create `packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts` with this virtual filesystem helper block:

```ts
import '@qraft/test-utils/vitestFsMock';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createNodeModuleAccess } from './node.js';

async function createResolverFixtureRoot() {
  return `/virtual/qraft-node-resolver-${randomUUID()}`;
}

async function writeResolverFile(
  root: string,
  relativePath: string,
  content = ''
) {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  return filePath;
}

async function writeResolverJson(
  root: string,
  relativePath: string,
  value: unknown
) {
  return writeResolverFile(root, relativePath, JSON.stringify(value, null, 2));
}

async function readResolverFile(filePath: string) {
  return fs.readFile(filePath, 'utf8');
}

function slash(filePath: string) {
  return filePath.split(path.sep).join('/');
}
```

If the probe FAILed with `null`, create `packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts` with this real temporary filesystem helper block:

```ts
import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createNodeModuleAccess } from './node.js';

const realFs =
  await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises'
  );

async function createResolverFixtureRoot() {
  return realFs.mkdtemp(path.join(os.tmpdir(), 'qraft-node-resolver-'));
}

async function writeResolverFile(
  root: string,
  relativePath: string,
  content = ''
) {
  const filePath = path.join(root, relativePath);
  await realFs.mkdir(path.dirname(filePath), { recursive: true });
  await realFs.writeFile(filePath, content);
  return filePath;
}

async function writeResolverJson(
  root: string,
  relativePath: string,
  value: unknown
) {
  return writeResolverFile(root, relativePath, JSON.stringify(value, null, 2));
}

async function readResolverFile(filePath: string) {
  return realFs.readFile(filePath, 'utf8');
}

function slash(filePath: string) {
  return filePath.split(path.sep).join('/');
}
```

Both helper blocks keep `@qraft/test-utils/vitestFsMock` imported. With the real
temporary filesystem strategy, the adapter `load(...)` still reads through the
mocked `node:fs/promises` module, and `unionfs` can fall through to the real
files written by `realFs`.

- [ ] **Step 5: Add virtual filesystem smoke coverage for adapter loading**

Append:

```ts
describe('createNodeModuleAccess', () => {
  it('loads files through the virtual filesystem mock', async () => {
    const virtualFile = '/virtual/qraft-node-resolver/src/api.ts';
    await fs.mkdir(path.dirname(virtualFile), { recursive: true });
    await fs.writeFile(virtualFile, 'export const marker = true;');
    const access = createNodeModuleAccess();

    await expect(access.load(`${virtualFile}?raw#factory`)).resolves.toBe(
      'export const marker = true;'
    );
  });
});
```

- [ ] **Step 6: Run the virtual filesystem smoke test**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/node.test.ts -t "virtual filesystem mock"
```

Expected: PASS. This proves the adapter's own filesystem loader follows the
same mocked `node:fs/promises` path as the existing tree-shaking core harness.

- [ ] **Step 7: Add relative import and index resolution tests**

Append:

```ts
  it('resolves relative imports to TypeScript index files', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.tsx');
    const apiIndex = await writeResolverFile(root, 'src/api/index.ts');
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('./api', importer)).resolves.toBe(apiIndex);
  });
```

- [ ] **Step 8: Run the new focused test**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/node.test.ts -t "relative imports"
```

Expected: PASS.

- [ ] **Step 9: Add extension alias coverage**

Add inside the same `describe` block:

```ts
  it('resolves JavaScript import specifiers to TypeScript source files', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.ts');
    const apiSource = await writeResolverFile(root, 'src/api.ts');
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('./api.js', importer)).resolves.toBe(
      apiSource
    );
  });
```

- [ ] **Step 10: Add tsconfig paths coverage**

Add inside the same `describe` block:

```ts
  it('resolves TypeScript path aliases through tsconfig auto discovery', async () => {
    const root = await createResolverFixtureRoot();
    await writeResolverJson(root, 'tsconfig.json', {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@api/*': ['src/api/*'],
        },
      },
    });
    const importer = await writeResolverFile(root, 'src/App.tsx');
    const apiIndex = await writeResolverFile(
      root,
      'src/api/generated/index.ts'
    );
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('@api/generated', importer)).resolves.toBe(
      apiIndex
    );
  });
```

- [ ] **Step 11: Add monorepo auto-discovery coverage**

Add inside the same `describe` block:

```ts
  it('discovers tsconfig from nested package importers', async () => {
    const root = await createResolverFixtureRoot();
    await writeResolverJson(root, 'packages/app/tsconfig.json', {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@app-api': ['src/api/index.ts'],
        },
      },
    });
    const importer = await writeResolverFile(root, 'packages/app/src/App.tsx');
    const apiIndex = await writeResolverFile(
      root,
      'packages/app/src/api/index.ts'
    );
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('@app-api', importer)).resolves.toBe(apiIndex);
  });
```

- [ ] **Step 12: Add package exports coverage**

Add inside the same `describe` block:

```ts
  it('resolves package subpaths through package exports', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.ts');
    await writeResolverJson(root, 'node_modules/@scope/api/package.json', {
      name: '@scope/api',
      type: 'module',
      exports: {
        '.': './dist/index.js',
        './services/PetsService': './dist/services/PetsService.js',
      },
    });
    const publicServiceFile = await writeResolverFile(
      root,
      'node_modules/@scope/api/dist/services/PetsService.js'
    );
    await writeResolverFile(root, 'node_modules/@scope/api/dist/private.js');
    const access = createNodeModuleAccess({ root });

    await expect(
      access.resolve('@scope/api/services/PetsService', importer)
    ).resolves.toBe(publicServiceFile);
  });
```

- [ ] **Step 13: Add load and user hook coverage**

Add inside the same `describe` block:

```ts
  it('loads source files and strips query and hash suffixes', async () => {
    const root = await createResolverFixtureRoot();
    const sourceFile = await writeResolverFile(
      root,
      'src/api.ts',
      'export const marker = true;'
    );
    const access = createNodeModuleAccess({ root });

    await expect(access.load(`${sourceFile}?raw#factory`)).resolves.toBe(
      'export const marker = true;'
    );
  });

  it('uses user resolve and load hooks before native strategies', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.ts');
    const resolve = vi.fn(async () => '/virtual/api.ts');
    const load = vi.fn(async () => 'export const virtualApi = true;');
    const access = createNodeModuleAccess({
      root,
      moduleAccess: { resolve, load },
    });

    await expect(access.resolve('virtual:api', importer)).resolves.toBe(
      '/virtual/api.ts'
    );
    await expect(access.load('/virtual/api.ts')).resolves.toBe(
      'export const virtualApi = true;'
    );
    expect(resolve).toHaveBeenCalledWith('virtual:api', importer);
    expect(load).toHaveBeenCalledWith('/virtual/api.ts');
  });
```

- [ ] **Step 14: Run all Node adapter unit tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/node.test.ts
```

Expected: PASS.

- [ ] **Step 15: Commit Node adapter behavior tests**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts
git commit -m "test: cover node module access behavior"
```

## Task 4: Add Transform Integration Smoke

**Files:**
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts`

- [ ] **Step 1: Add transform imports to the test file**

At the top of `packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts`, add:

```ts
import { transformQraftTreeShaking } from '../../core.js';
import { createGeneratedMetadataCache } from '../transform/generated-metadata.js';
```

- [ ] **Step 2: Add generated API fixture helpers**

Add this helper after `readResolverFile(...)`:

```ts
async function writeGeneratedApiFixture(root: string) {
  await writeResolverJson(root, 'tsconfig.json', {
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '@api/my-api': ['src/api/index.ts'],
        '@api/my-api/*': ['src/api/*'],
      },
    },
  });
  await writeResolverFile(
    root,
    'src/api/index.ts',
    `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { APIClientContext } from './APIClientContext';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createReactAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, APIClientContext);
}
`
  );
  await writeResolverFile(
    root,
    'src/api/APIClientContext.ts',
    'export const APIClientContext = {};'
  );
  await writeResolverFile(
    root,
    'src/api/services/index.ts',
    `
import { petsService } from './PetsService';

export const services = {
  pets: petsService,
} as const;
`
  );
  await writeResolverFile(
    root,
    'src/api/services/PetsService.ts',
    `
export const getPets = { schema: { method: 'get', url: '/pets' } };

export const petsService = {
  getPets,
} as const;
`
  );
}
```

- [ ] **Step 3: Add the integration smoke test**

Add inside the existing `describe('createNodeModuleAccess', ...)` block:

```ts
  it('supports core transform analysis without leaking physical paths into emitted imports', async () => {
    const root = await createResolverFixtureRoot();
    await writeGeneratedApiFixture(root);
    const appFile = await writeResolverFile(
      root,
      'src/App.tsx',
      `
import { createReactAPIClient } from '@api/my-api';

const reactAPIClient = createReactAPIClient();

export function App() {
  return reactAPIClient.pets.getPets.useQuery();
}
`
    );
    const code = await readResolverFile(appFile);
    const access = createNodeModuleAccess({ root });

    const result = await transformQraftTreeShaking(
      code,
      appFile,
      {
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
      },
      access,
      undefined,
      createGeneratedMetadataCache(),
      {}
    );

    expect(result?.code).toContain(
      'from "@api/my-api/services/PetsService"'
    );
    expect(result?.code).toContain('from "@api/my-api"');
    expect(slash(result?.code ?? '')).not.toContain(slash(root));
  });
```

- [ ] **Step 4: Run the integration smoke**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/node.test.ts -t "core transform analysis"
```

Expected: PASS.

- [ ] **Step 5: Run all Node adapter tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/node.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the transform integration smoke**

Run:

```bash
git add packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts
git commit -m "test: verify node module access transform integration"
```

## Task 5: Final Verification And Documentation Note

**Files:**
- Modify: `docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md`

- [ ] **Step 1: Add an implementation note to the design spec**

Append this section to `docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md`:

```md
## Implementation Notes

Task 1 implemented the Node module access adapter as an internal resolver module
backed by `oxc-resolver`. The adapter is intentionally not documented as public
API yet; the public surface should be decided together with the standalone
project transform utility in Task 2.
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/lib/resolvers/resolvers.test.ts src/lib/resolvers/node.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS.

- [ ] **Step 4: Run package build**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
```

Expected: PASS.

- [ ] **Step 5: Inspect git diff**

Run:

```bash
git status --short
git diff --stat
```

Expected:

- only Task 1 files changed;
- no unrelated files modified;
- `dist/` is not committed unless this repository branch already tracks package build artifacts for this package.

- [ ] **Step 6: Commit final verification/docs note**

Run:

```bash
git add docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md
git commit -m "docs: record node module access implementation"
```

If the spec note is the only remaining change, this commit contains only the docs note. If the previous tasks were intentionally squashed during execution, include all Task 1 files in a single final commit instead:

```bash
git add yarn.lock packages/tree-shaking-plugin/package.json packages/tree-shaking-plugin/rollup.config.mjs packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts packages/tree-shaking-plugin/src/lib/resolvers/node.ts packages/tree-shaking-plugin/src/lib/resolvers/node.test.ts docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md
git commit -m "feat: add node module access adapter"
```

## Execution Notes

- Keep this adapter internal in Task 1. Do not add package exports or README docs for `createNodeModuleAccess(...)` yet.
- Do not implement project file discovery, preview mode, write mode, config loading, or CLI behavior in this plan.
- Do not change `transformQraftTreeShaking(...)` semantics.
- Do not emit physical resolved paths into transformed source. The integration smoke must keep this boundary visible.
