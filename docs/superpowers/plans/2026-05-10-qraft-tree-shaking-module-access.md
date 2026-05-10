# Qraft Tree-Shaking Module Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace direct filesystem reads in the tree-shaking transform with a bundler-aware module access contract that resolves and loads generated modules through adapters.

**Architecture:** Introduce a `QraftModuleAccess` boundary with `resolve()` and `load()` so `plan.ts` can inspect generated clients, re-export barrels, services indexes, and precreated-client export chains without importing `node:fs/promises`. Rollup/Vite, webpack, rspack, and esbuild adapters own their loading strategy; core transform only consumes module source and cleanly skips when source is unavailable. The public DX stays simple: normal users keep passing the same `createAPIClientFn` and `apiClient` options, while advanced users can override `moduleAccess` only when their bundler uses a custom source provider.

**Tech Stack:** TypeScript, unplugin, Babel parser/traverse/types, Vitest, Yarn 4, multi-bundler e2e fixture.

---

### File Structure

- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/common.ts` — replace the resolver-only contract with `QraftModuleAccess`, `QraftModuleAccessFactory`, and resolver/source-loader strategy helpers.
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/agnostic.ts` — expose `createAgnosticModuleAccess(...)` for unit tests and direct `transformQraftTreeShaking(...)` calls.
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/rollup-like.ts` — expose `createRollupLikeModuleAccess(...)` that uses Rollup/Vite resolution and module loading.
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/webpack-like.ts` — expose `createWebpackLikeModuleAccess(...)` that uses webpack `getResolve` and `loadModule`.
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/rspack.ts` — expose `createRspackModuleAccess(...)` with rspack resolution and source loading through the loader context when available.
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/esbuild.ts` — expose `createEsbuildModuleAccess(...)`; keep esbuild source loading adapter-local because esbuild exposes `build.resolve` but not an arbitrary `build.load` API.
- Modify: `packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts` — create a module-access instance instead of a resolver instance and pass it into core.
- Modify: `packages/tree-shaking-plugin/src/{vite,rollup,webpack,rspack,esbuild}.ts` — switch each entrypoint to the new factory names.
- Modify: `packages/tree-shaking-plugin/src/core.ts` — add `moduleAccess?: QraftModuleAccessOptions` option support, change the transform signature, and keep default agnostic behavior for unit tests.
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts` — replace every `fs.readFile(...)` call with `moduleAccess.load(...)`; keep parsing local to `plan.ts`.
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts` — cover resolve and load behavior per adapter.
- Modify: `packages/tree-shaking-plugin/src/core.test.ts` — update fixture helpers to provide in-memory module access and add a regression proving core fails/skips when a resolved module cannot be loaded instead of reading disk.
- Modify: `packages/tree-shaking-plugin/README.md` — document the module-access boundary and the optional advanced override.
- Modify only if needed: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs` and `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs` — add a narrow barrel/provider regression only if existing scenarios do not already prove the contract across all bundlers.

---

### Test Commands

**Unit loop:**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/lib/resolvers/resolvers.test.ts
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "does not read generated modules from the filesystem"
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
```

**Fast e2e loop inside the monorepo fixture:**

Use this after source changes when `e2e/projects/tree-shaking-bundlers/node_modules` is already installed.

```bash
# 1. Build the plugin package.
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build

# 2. Sync the fresh plugin dist into the installed fixture package.
rm -rf e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist
cp -R packages/tree-shaking-plugin/dist \
  e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist

# 3. Build every bundler/scenario in place.
cd e2e/projects/tree-shaking-bundlers
npm run build

# 4. Assert the emitted bundle shape and source maps.
npm run e2e:post-build
```

Expected: `npm run e2e:post-build` prints the fixture success message and exits `0`.

**Full e2e loop through Verdaccio:**

Use this before final completion because it validates publish/install behavior. The runner already builds publishable packages, removes `e2e/verdaccio-storage` once before publishing, publishes to Verdaccio, updates the copied fixture under `/Users/radist/w/qraft-e2e`, builds it, and unpublishes on cleanup.

```bash
cd /Users/radist/WebstormProjects/qraft/e2e
corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: the command exits `0` after building `tree-shaking-bundlers` from the copied project. If Verdaccio was already running with stale package state, stop it, then rerun the command; do not manually edit fixture `node_modules` during the full loop.

---

### Task 1: Introduce `QraftModuleAccess` and Lock the Resolver Boundary

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/common.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/agnostic.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`

- [x] **Step 1: Add failing tests for module-access resolve/load composition**

Append these tests to `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts` inside the existing `describe('resolver composition', ...)` block:

```ts
it('uses a custom module loader after custom resolution', async () => {
  const resolve = vi.fn(async (specifier: string, importer: string) => {
    expect(specifier).toBe('./api');
    expect(importer).toBe('/tmp/src/App.tsx');
    return '/tmp/src/api/index.ts';
  });
  const load = vi.fn(async (id: string) => {
    expect(id).toBe('/tmp/src/api/index.ts');
    return 'export const marker = true;';
  });

  const access = createAgnosticModuleAccess({ resolve, load });

  await expect(access.resolve('./api', '/tmp/src/App.tsx')).resolves.toBe(
    '/tmp/src/api/index.ts'
  );
  await expect(access.load('/tmp/src/api/index.ts')).resolves.toBe(
    'export const marker = true;'
  );
  expect(resolve).toHaveBeenCalledTimes(1);
  expect(load).toHaveBeenCalledTimes(1);
});

it('returns null from load when no source loader is configured', async () => {
  const access = createAgnosticModuleAccess({
    resolve: async () => '/tmp/src/api/index.ts',
  });

  await expect(access.load('/tmp/src/api/index.ts')).resolves.toBeNull();
});
```

Expected initial failure: TypeScript/Vitest cannot find `createAgnosticModuleAccess`.

- [x] **Step 2: Run the resolver test to verify it fails**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/lib/resolvers/resolvers.test.ts -t "custom module loader"
```

Expected: FAIL with a missing export or missing identifier error for `createAgnosticModuleAccess`.

- [x] **Step 3: Replace resolver-only types with module-access types**

In `packages/tree-shaking-plugin/src/lib/resolvers/common.ts`, keep `QraftResolver` as a compatibility alias, then add the module-access types and source-loader strategy helpers:

```ts
export type QraftResolver = (
  specifier: string,
  importer: string
) => Promise<string | null> | string | null;

export type QraftSourceLoader = (
  resolvedId: string
) => Promise<string | null> | string | null;

export type QraftModuleAccess = {
  resolve: QraftResolver;
  load: QraftSourceLoader;
};

export type QraftModuleAccessOptions = {
  resolve?: QraftResolver;
  load?: QraftSourceLoader;
};

export type QraftModuleAccessFactory<TRuntimeContext = unknown> = (
  ctx: TRuntimeContext,
  userAccess?: QraftModuleAccessOptions
) => QraftModuleAccess;
```

Leave `ResolveRequest`, `ResolveStrategy`, `createResolverChain(...)`, and `createUserResolverStrategy(...)` in place. Add loader strategy equivalents below them:

```ts
export type LoadRequest = {
  id: string;
};

export type LoadStrategy = (
  request: LoadRequest
) => Promise<string | null> | string | null;

export function createSourceLoaderChain(
  strategies: LoadStrategy[]
): QraftSourceLoader {
  const cache = new Map<string, Promise<string | null>>();

  return (id) => {
    let pending = cache.get(id);
    if (!pending) {
      pending = loadWithStrategies(strategies, id);
      cache.set(id, pending);
    }
    return pending;
  };
}

async function loadWithStrategies(
  strategies: LoadStrategy[],
  id: string
): Promise<string | null> {
  for (const strategy of strategies) {
    try {
      const loaded = await strategy({ id });
      if (loaded !== null && loaded !== undefined) return loaded;
    } catch {
      // Try the next strategy.
    }
  }

  return null;
}

export function createUserSourceLoaderStrategy(
  userLoad?: QraftSourceLoader
): LoadStrategy {
  return async ({ id }) => {
    if (!userLoad) return null;
    const loaded = await userLoad(id);
    return loaded ?? null;
  };
}
```

- [x] **Step 4: Add the agnostic module-access factory**

Replace the body of `packages/tree-shaking-plugin/src/lib/resolvers/agnostic.ts` with:

```ts
import type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './common.js';
import {
  createResolverChain,
  createSourceLoaderChain,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
} from './common.js';

export function createAgnosticResolver(
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([createUserResolverStrategy(userResolve)]);
}

export function createAgnosticModuleAccess(
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return {
    resolve: createAgnosticResolver(userAccess.resolve),
    load: createSourceLoaderChain([
      createUserSourceLoaderStrategy(userAccess.load),
    ]),
  };
}
```

- [x] **Step 5: Update resolver test imports**

In `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`, change:

```ts
import { createAgnosticResolver } from './agnostic.js';
```

to:

```ts
import {
  createAgnosticModuleAccess,
  createAgnosticResolver,
} from './agnostic.js';
```

- [x] **Step 6: Run resolver tests**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/lib/resolvers/resolvers.test.ts
```

Expected: PASS.

- [x] **Step 7: Commit the boundary type change**

```bash
git add packages/tree-shaking-plugin/src/lib/resolvers/common.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/agnostic.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts
git commit -m "refactor(tree-shaking): introduce module access boundary"
```

---

### Task 2: Make Core and Plan Consume `QraftModuleAccess`

**Files:**

- Modify: `packages/tree-shaking-plugin/src/core.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [ ] **Step 1: Add a failing regression that proves core does not read generated files directly**

In `packages/tree-shaking-plugin/src/core.test.ts`, add this test near the existing barrel/precreated factory tests:

```ts
it('does not read generated modules from the filesystem when module access cannot load them', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-'));
  await writeFixtureFiles(root, {
    ...PRECREATED_BASE_FILES,
  });
  const sourceFile = path.join(root, 'src/App.tsx');
  const resolvedApiFile = path.join(root, 'src/api/index.ts');

  const result = await transformQraftTreeShakingImpl(
    `
import { createAPIClient } from './api';

const api = createAPIClient({ queryClient: {} });
api.pets.getPets.invalidateQueries();
`,
    sourceFile,
    {
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
      moduleAccess: {
        resolve: async (specifier, importer) => {
          if (specifier === './api' && importer === sourceFile) {
            return resolvedApiFile;
          }
          return null;
        },
        load: async () => null,
      },
    }
  );

  expect(result).toBeNull();
});
```

Expected initial failure: TypeScript rejects `moduleAccess` on options, or the transform returns generated code because `plan.ts` still reads `resolvedApiFile` from disk.

- [ ] **Step 2: Run the new regression and confirm it fails**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "does not read generated modules from the filesystem"
```

Expected: FAIL for the reason above.

- [ ] **Step 3: Update the public options and transform signature**

In `packages/tree-shaking-plugin/src/core.ts`, update imports:

```ts
import type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './lib/resolvers/common.js';
import { createAgnosticModuleAccess } from './lib/resolvers/agnostic.js';
```

Add the option:

```ts
export type QraftTreeShakeOptions = {
  createAPIClientFn?: QraftFactoryConfig[];
  apiClient?: QraftPrecreatedClientConfig[];
  resolve?: QraftResolver;
  moduleAccess?: QraftModuleAccessOptions;
  include?: FilterPattern;
  exclude?: FilterPattern;
  debug?: boolean;
};
```

Change the transform function parameters from resolver to module access:

```ts
export async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  moduleAccess: QraftModuleAccess = createAgnosticModuleAccess({
    resolve: options.moduleAccess?.resolve ?? options.resolve,
    load: options.moduleAccess?.load,
  }),
  inputSourceMap?: SourceMapInput
) {
```

Change the plan call:

```ts
const plan = await createTransformPlan(code, id, options, moduleAccess);
```

- [ ] **Step 4: Replace `QraftResolver` usage in `plan.ts`**

In `packages/tree-shaking-plugin/src/lib/transform/plan.ts`, update imports:

```ts
import type { QraftModuleAccess } from '../resolvers/common.js';
import { createAgnosticModuleAccess } from '../resolvers/agnostic.js';
```

Change `createTransformPlan(...)` signature:

```ts
export async function createTransformPlan(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  moduleAccess: QraftModuleAccess = createAgnosticModuleAccess({
    resolve: options.moduleAccess?.resolve ?? options.resolve,
    load: options.moduleAccess?.load,
  })
): Promise<TransformPlan> {
```

Inside `createTransformPlan`, add:

```ts
const resolver = moduleAccess.resolve;
```

This keeps existing resolver call sites compiling while the read paths are migrated.

- [ ] **Step 5: Replace direct generated-client reads with `moduleAccess.load`**

Change `readGeneratedClientInfo(...)` signature from:

```ts
async function readGeneratedClientInfo(
  importerId: string,
  clientFile: string,
  factory: QraftFactoryConfig,
  resolver: QraftResolver,
  debug = false,
  servicesDirName = 'services'
): Promise<GeneratedClientInfo | null> {
```

to:

```ts
async function readGeneratedClientInfo(
  importerId: string,
  clientFile: string,
  factory: QraftFactoryConfig,
  moduleAccess: QraftModuleAccess,
  debug = false,
  servicesDirName = 'services'
): Promise<GeneratedClientInfo | null> {
  const resolver = moduleAccess.resolve;
```

Replace its file read:

```ts
let source: string;
try {
  source = await fs.readFile(clientFile, 'utf8');
} catch {
  return skip('generated client file was not readable');
}
```

with:

```ts
const source = await moduleAccess.load(clientFile);
if (source === null) {
  return skip('generated client source was not available');
}
```

Update recursive calls and every caller to pass `moduleAccess` instead of `resolver`.

- [ ] **Step 6: Replace precreated export-chain reads with `moduleAccess.load`**

Change `readExportedDeclarationChain(...)` signature to accept module access:

```ts
async function readExportedDeclarationChain(
  startFile: string,
  exportName: string,
  moduleAccess: QraftModuleAccess,
  seen = new Set<string>()
): Promise<ExportedDeclarationResolution | null> {
  const resolver = moduleAccess.resolve;
```

Replace:

```ts
let source: string;
try {
  source = await fs.readFile(sourceFile, 'utf8');
} catch {
  return null;
}
```

with:

```ts
const source = await moduleAccess.load(sourceFile);
if (source === null) return null;
```

Update recursive calls and every caller to pass `moduleAccess`.

- [ ] **Step 7: Replace services index reads with `moduleAccess.load`**

Change `readServiceImportPaths(...)` signature:

```ts
async function readServiceImportPaths(
  clientFile: string,
  servicesDir: string,
  moduleAccess: QraftModuleAccess
): Promise<Record<string, string>> {
  const resolver = moduleAccess.resolve;
```

Replace:

```ts
let source: string;
try {
  source = await fs.readFile(servicesIndexFile, 'utf8');
} catch {
  return {};
}
```

with:

```ts
const source = await moduleAccess.load(servicesIndexFile);
if (source === null) return {};
```

Update the call in `readGeneratedClientInfo(...)`:

```ts
const serviceImportPaths = await readServiceImportPaths(
  clientFile,
  servicesDir,
  moduleAccess
);
```

- [ ] **Step 8: Remove the production `fs` import from `plan.ts`**

Delete this import from `packages/tree-shaking-plugin/src/lib/transform/plan.ts`:

```ts
import fs from 'node:fs/promises';
```

Then run:

```bash
rg -n "node:fs|fs\\.readFile|readFile\\(" packages/tree-shaking-plugin/src/lib/transform/plan.ts
```

Expected: no matches in `plan.ts`.

- [ ] **Step 9: Update core test fixture helper to pass source-aware module access**

In `packages/tree-shaking-plugin/src/core.test.ts`, update the wrapper helper so ordinary tests still load fixture files from the existing in-memory fs mock:

```ts
async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: TransformOptions,
  inputSourceMap?: SourceMapInput
) {
  const fixtureRoot = path.dirname(path.dirname(id));
  const fixtureResolver = createFixtureResolver(fixtureRoot);
  return transformQraftTreeShakingWithInputSourceMap(
    code,
    id,
    {
      ...options,
      moduleAccess: {
        resolve: fixtureResolver,
        load: async (resolvedId) => fs.readFile(resolvedId, 'utf8'),
      },
    },
    undefined,
    inputSourceMap
  );
}
```

This keeps disk reads in test fixtures only; production `plan.ts` remains source-provider agnostic.

- [ ] **Step 10: Run the focused core regression**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/core.test.ts -t "does not read generated modules from the filesystem"
```

Expected: PASS.

- [ ] **Step 11: Run all plugin unit tests**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
```

Expected: PASS.

- [ ] **Step 12: Commit core module-access migration**

```bash
git add packages/tree-shaking-plugin/src/core.ts \
        packages/tree-shaking-plugin/src/lib/transform/plan.ts \
        packages/tree-shaking-plugin/src/core.test.ts
git commit -m "refactor(tree-shaking): load generated modules through module access"
```

---

### Task 3: Implement Bundler Module-Access Adapters

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/rollup-like.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/webpack-like.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/rspack.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/esbuild.ts`
- Modify: `packages/tree-shaking-plugin/src/{vite,rollup,webpack,rspack,esbuild}.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`

- [ ] **Step 1: Add adapter loading tests**

In `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`, add these tests after the existing bundler resolver tests:

```ts
it('loads source through the rollup-like context before custom loader fallback', async () => {
  const ctx: BundlerResolveContext = {
    resolve: vi.fn(async () => ({ id: '/tmp/api.ts', external: false })),
    load: vi.fn(async (request: { id: string }) => {
      expect(request).toEqual({ id: '/tmp/api.ts' });
      return {
        code: 'export const fromRollup = true;',
      };
    }),
  };

  const access = createRollupLikeModuleAccess(ctx);
  await expect(access.resolve('./api', '/tmp/App.tsx')).resolves.toBe(
    '/tmp/api.ts'
  );
  await expect(access.load('/tmp/api.ts')).resolves.toBe(
    'export const fromRollup = true;'
  );
});

it('loads source through webpack loadModule', async () => {
  const loadModule = vi.fn((request: string, callback: (...args: unknown[]) => void) => {
    expect(request).toBe('/tmp/generated-api/index.ts');
    callback(null, Buffer.from('export const fromWebpack = true;'), null, {});
  });

  const access = createWebpackLikeModuleAccess({
    getNativeBuildContext() {
      return {
        framework: 'webpack',
        loaderContext: {
          getResolve: () => async () => '/tmp/generated-api/index.ts',
          loadModule,
        },
      };
    },
  });

  await expect(access.load('/tmp/generated-api/index.ts')).resolves.toBe(
    'export const fromWebpack = true;'
  );
  expect(loadModule).toHaveBeenCalledTimes(1);
});

it('uses the custom source loader before esbuild file fallback', async () => {
  const access = createEsbuildModuleAccess(
    {
      getNativeBuildContext() {
        return {
          framework: 'esbuild',
          build: {
            resolve: async () => ({ path: '/tmp/api.ts', errors: [] }),
          },
        };
      },
    },
    {
      load: async (id) =>
        id === '/tmp/api.ts' ? 'export const fromUserLoader = true;' : null,
    }
  );

  await expect(access.load('/tmp/api.ts')).resolves.toBe(
    'export const fromUserLoader = true;'
  );
});
```

Expected initial failure: missing `load` field in `BundlerResolveContext` and missing module-access factory exports.

Also update imports at the top of `packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts`:

```ts
import {
  createAgnosticModuleAccess,
  createAgnosticResolver,
} from './agnostic.js';
import {
  createEsbuildModuleAccess,
  createEsbuildResolver,
} from './esbuild.js';
import {
  createRollupLikeModuleAccess,
  createRollupLikeResolver,
} from './rollup-like.js';
import {
  createRspackModuleAccess,
  createRspackResolver,
} from './rspack.js';
import {
  createWebpackLikeModuleAccess,
  createWebpackLikeResolver,
} from './webpack-like.js';
```

- [ ] **Step 2: Run adapter tests and confirm failure**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/lib/resolvers/resolvers.test.ts -t "loads source"
```

Expected: FAIL with missing types/exports.

- [ ] **Step 3: Extend bundler context types**

In `packages/tree-shaking-plugin/src/lib/resolvers/common.ts`, add the Rollup-like load type:

```ts
export type RollupLikeLoad = (
  request: { id: string }
) =>
  | Promise<{ code?: string | null } | string | null | undefined>
  | { code?: string | null }
  | string
  | null
  | undefined;
```

Update `BundlerNativeBuildContext`:

```ts
export type BundlerNativeBuildContext = {
  framework?: string;
  build?: EsbuildLikeBuild;
  compiler?: unknown;
  compilation?: unknown;
  loaderContext?: unknown;
  inputSourceMap?: unknown;
};
```

Keep existing fields and update `BundlerResolveContext`:

```ts
export type BundlerResolveContext = {
  resolve?: RollupLikeResolve;
  load?: RollupLikeLoad;
  getNativeBuildContext?: () => BundlerNativeBuildContext | null;
};
```

- [ ] **Step 4: Implement Rollup/Vite module access**

In `packages/tree-shaking-plugin/src/lib/resolvers/rollup-like.ts`, add imports:

```ts
import {
  createResolverChain,
  createSourceLoaderChain,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
} from './common.js';
```

Add source loader strategy:

```ts
function createRollupLoadStrategy(ctx: BundlerResolveContext): LoadStrategy {
  return async ({ id }) => {
    if (typeof ctx.load !== 'function') return null;
    const loaded = await ctx.load({ id });
    if (typeof loaded === 'string') return loaded;
    if (loaded && typeof loaded.code === 'string') return loaded.code;
    return null;
  };
}
```

Add the factory:

```ts
export function createRollupLikeModuleAccess(
  ctx: BundlerResolveContext,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return {
    resolve: createResolverChain([
      createRollupResolveStrategy(ctx),
      createUserResolverStrategy(userAccess.resolve),
    ]),
    load: createSourceLoaderChain([
      createRollupLoadStrategy(ctx),
      createUserSourceLoaderStrategy(userAccess.load),
    ]),
  };
}
```

Keep `createRollupLikeResolver(...)` as compatibility wrapper:

```ts
export function createRollupLikeResolver(
  ctx: BundlerResolveContext,
  userResolve?: QraftResolver
): QraftResolver {
  return createRollupLikeModuleAccess(ctx, { resolve: userResolve }).resolve;
}
```

- [ ] **Step 5: Implement webpack module access**

In `packages/tree-shaking-plugin/src/lib/resolvers/webpack-like.ts`, add a loader context type:

```ts
type WebpackLoadModule = (
  request: string,
  callback: (
    error: Error | null,
    source: string | Buffer | null,
    sourceMap: unknown,
    module: unknown
  ) => void
) => void;

type WebpackLoaderRuntimeContext = {
  getResolve?: (options?: { dependencyType?: string }) => WebpackResolveFn;
  loadModule?: WebpackLoadModule;
};
```

Add loader extraction helper:

```ts
function getWebpackLoaderContext(
  ctx: WebpackLoaderContextLike
): WebpackLoaderRuntimeContext | undefined {
  return ctx.getNativeBuildContext?.()?.loaderContext as
    | WebpackLoaderRuntimeContext
    | undefined;
}
```

Use it in the existing resolve strategy, then add:

```ts
function createWebpackLoadStrategy(
  ctx: WebpackLoaderContextLike
): LoadStrategy {
  return async ({ id }) => {
    const loaderContext = getWebpackLoaderContext(ctx);
    if (typeof loaderContext?.loadModule !== 'function') return null;

    return new Promise<string | null>((resolve) => {
      loaderContext.loadModule(id, (error, source) => {
        if (error || source === null || source === undefined) {
          resolve(null);
          return;
        }
        resolve(Buffer.isBuffer(source) ? source.toString('utf8') : source);
      });
    });
  };
}
```

Export:

```ts
export function createWebpackLikeModuleAccess(
  ctx: WebpackLoaderContextLike,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return {
    resolve: createResolverChain([
      createWebpackResolveStrategy(ctx),
      createUserResolverStrategy(userAccess.resolve),
    ]),
    load: createSourceLoaderChain([
      createWebpackLoadStrategy(ctx),
      createUserSourceLoaderStrategy(userAccess.load),
    ]),
  };
}
```

Keep `createWebpackLikeResolver(...)` as a compatibility wrapper.

- [ ] **Step 6: Implement rspack module access**

In `packages/tree-shaking-plugin/src/lib/resolvers/rspack.ts`, mirror the webpack load strategy because rspack exposes webpack-compatible loader context in this plugin path:

```ts
type RspackLoadModule = (
  request: string,
  callback: (
    error: Error | null,
    source: string | Buffer | null,
    sourceMap: unknown,
    module: unknown
  ) => void
) => void;

function createRspackLoadStrategy(ctx: BundlerResolveContext): LoadStrategy {
  return async ({ id }) => {
    const loaderContext = ctx.getNativeBuildContext?.()?.loaderContext as
      | { loadModule?: RspackLoadModule }
      | undefined;
    if (typeof loaderContext?.loadModule !== 'function') return null;

    return new Promise<string | null>((resolve) => {
      loaderContext.loadModule(id, (error, source) => {
        if (error || source === null || source === undefined) {
          resolve(null);
          return;
        }
        resolve(Buffer.isBuffer(source) ? source.toString('utf8') : source);
      });
    });
  };
}
```

Export `createRspackModuleAccess(...)` with the existing rspack resolve strategy plus the loader strategy, and keep `createRspackResolver(...)` as a wrapper.

- [ ] **Step 7: Implement esbuild module access with adapter-local file fallback**

In `packages/tree-shaking-plugin/src/lib/resolvers/esbuild.ts`, import `fs` locally:

```ts
import fs from 'node:fs/promises';
```

Add file loader strategy:

```ts
function createEsbuildFileLoadStrategy(): LoadStrategy {
  return async ({ id }) => {
    try {
      return await fs.readFile(id, 'utf8');
    } catch {
      return null;
    }
  };
}
```

Export:

```ts
export function createEsbuildModuleAccess(
  ctx: BundlerResolveContext,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return {
    resolve: createResolverChain([
      createEsbuildResolveStrategy(ctx),
      createUserResolverStrategy(userAccess.resolve),
    ]),
    load: createSourceLoaderChain([
      createUserSourceLoaderStrategy(userAccess.load),
      createEsbuildFileLoadStrategy(),
    ]),
  };
}
```

Keep `createEsbuildResolver(...)` as a wrapper. Add a comment above `createEsbuildFileLoadStrategy()`:

```ts
// Esbuild exposes build.resolve but no arbitrary build.load API. Keep this
// fallback adapter-local; core transform must not read the filesystem directly.
```

- [ ] **Step 8: Update plugin factory to accept module access factories**

In `packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts`, update types:

```ts
import { type QraftModuleAccessFactory } from '../resolvers/common.js';
```

Replace `QraftResolverFactory` with:

```ts
export type QraftResolverFactory<TRuntimeContext = unknown> =
  QraftModuleAccessFactory<TRuntimeContext>;
```

Rename the argument:

```ts
export function createQraftTreeShakePlugin<TRuntimeContext = unknown>(
  createModuleAccess: QraftModuleAccessFactory<TRuntimeContext>
) {
```

Update the handler:

```ts
handler(this: any, code, id) {
  const moduleAccess = createModuleAccess(this, {
    resolve: options.moduleAccess?.resolve ?? options.resolve,
    load: options.moduleAccess?.load,
  });
  return transformQraftTreeShaking(
    code,
    id,
    options,
    moduleAccess,
    this.inputSourceMap
  );
},
```

- [ ] **Step 9: Update entrypoint imports**

Change each entrypoint:

```ts
// vite.ts and rollup.ts
import { createRollupLikeModuleAccess } from './lib/resolvers/rollup-like.js';
createQraftTreeShakePlugin<BundlerResolveContext>(
  createRollupLikeModuleAccess
)
```

```ts
// webpack.ts
import { createWebpackLikeModuleAccess } from './lib/resolvers/webpack-like.js';
createQraftTreeShakePlugin<BundlerResolveContext>(
  createWebpackLikeModuleAccess
)
```

```ts
// rspack.ts
import { createRspackModuleAccess } from './lib/resolvers/rspack.js';
createQraftTreeShakePlugin<BundlerResolveContext>(createRspackModuleAccess)
```

```ts
// esbuild.ts
import { createEsbuildModuleAccess } from './lib/resolvers/esbuild.js';
createQraftTreeShakePlugin<BundlerResolveContext>(createEsbuildModuleAccess)
```

- [ ] **Step 10: Run adapter tests**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test src/lib/resolvers/resolvers.test.ts
```

Expected: PASS.

- [ ] **Step 11: Run typecheck**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS.

- [ ] **Step 12: Commit adapter work**

```bash
git add packages/tree-shaking-plugin/src/lib/plugin/create-qraft-tree-shake-plugin.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/common.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/rollup-like.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/webpack-like.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/rspack.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/esbuild.ts \
        packages/tree-shaking-plugin/src/vite.ts \
        packages/tree-shaking-plugin/src/rollup.ts \
        packages/tree-shaking-plugin/src/webpack.ts \
        packages/tree-shaking-plugin/src/rspack.ts \
        packages/tree-shaking-plugin/src/esbuild.ts \
        packages/tree-shaking-plugin/src/lib/resolvers/resolvers.test.ts
git commit -m "feat(tree-shaking): load module source through bundler adapters"
```

---

### Task 4: Document the New Developer Experience

**Files:**

- Modify: `packages/tree-shaking-plugin/README.md`
- Modify: `packages/tree-shaking-plugin/src/core.ts`

- [ ] **Step 1: Add README documentation for normal and advanced usage**

In `packages/tree-shaking-plugin/README.md`, find the existing `createAPIClientFn` or resolver section and add:

````md
### Module access

The plugin resolves and inspects generated Qraft modules through the active
bundler adapter. Normal Vite, Rollup, webpack, Rspack, and esbuild users do not
need to configure this:

```ts
qraftTreeShakeVite({
  createAPIClientFn: [
    {
      name: 'createAPIClient',
      module: './src/api',
      context: 'APIClientContext',
      contextModule: './src/api/APIClientContext',
    },
  ],
})
```

If a build uses virtual modules or a non-standard source provider that the
bundler adapter cannot load directly, provide `moduleAccess.load` as an
advanced escape hatch:

```ts
qraftTreeShakeVite({
  createAPIClientFn: [{ name: 'createAPIClient', module: 'virtual:qraft-api' }],
  moduleAccess: {
    load: async (resolvedId) => {
      return resolvedId === 'virtual:qraft-api'
        ? `export { createAPIClient } from './actual-api'`
        : null
    },
  },
})
```

The transform core does not read generated modules from Node's filesystem. If a
resolved generated module cannot be loaded through module access, the plugin
skips that optimization and, with `debug: true`, prints the skipped module
reason.
````

- [ ] **Step 2: Add an exported options type comment**

In `packages/tree-shaking-plugin/src/core.ts`, add a short comment above `moduleAccess`:

```ts
  /**
   * Advanced source-provider override. Normal bundler integrations provide
   * this automatically; use it only for virtual modules or custom filesystems.
   */
  moduleAccess?: QraftModuleAccessOptions;
```

- [ ] **Step 3: Run docs-free typecheck**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit docs**

```bash
git add packages/tree-shaking-plugin/README.md packages/tree-shaking-plugin/src/core.ts
git commit -m "docs(tree-shaking): document module access override"
```

---

### Task 5: Verify Real Bundlers and Decide Whether E2E Fixture Needs a New Scenario

**Files:**

- Modify only if needed: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify only if needed: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [ ] **Step 1: Run the fast local fixture loop**

From repo root:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
rm -rf e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist
cp -R packages/tree-shaking-plugin/dist \
  e2e/projects/tree-shaking-bundlers/node_modules/@openapi-qraft/tree-shaking-plugin/dist
cd e2e/projects/tree-shaking-bundlers
npm run build
npm run e2e:post-build
```

Expected: PASS for Vite, Rollup, webpack, Rspack, and esbuild scenarios.

- [ ] **Step 2: If a bundler fails because its adapter cannot load generated modules, inspect only that bundler output**

Run one scenario at a time from `e2e/projects/tree-shaking-bundlers`:

```bash
QRAFT_TREE_SHAKE_SCENARIO=barrel-context-relative npm run build
node ./scripts/assert-dist.mjs
```

Expected: the focused scenario either passes or points to a specific `NO TRANSFORM`/missing token. Fix the corresponding adapter, not the fixture assertion, unless the emitted shape is intentionally different and still equivalent.

- [ ] **Step 3: Add a fixture scenario only if existing coverage does not prove barrel source loading**

If the existing `barrel-*` scenarios already fail before the adapter fix and pass after it, do not add new fixture files. If no existing scenario exercises re-exported factory source loading after direct `fs` removal, add a scenario in `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs` that imports a generated factory through a barrel while the config points at the direct generated module.

Use this shape for the scenario entry if needed:

```ts
import { createRelativeAPIClient } from './generated-api';

const api = createRelativeAPIClient();

export const barrelModuleAccessProof =
  api.pets.getPets.getQueryKey({ path: {}, query: {} });
```

Then assert the exact token in `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`:

```js
{
  scenario: 'barrel-module-access-proof',
  includes: ['barrelModuleAccessProof', 'qraftAPIClient', 'getPets'],
  excludes: ['createRelativeAPIClient', 'storesService'],
}
```

Keep this step skipped if existing scenarios already cover the behavior.

- [ ] **Step 4: Commit any e2e fixture changes**

If Step 3 changed fixture files:

```bash
git add e2e/projects/tree-shaking-bundlers
git commit -m "test(tree-shaking): cover module-access barrel loading in bundlers"
```

If Step 3 made no changes, do not create an empty commit.

- [ ] **Step 5: Run the full Verdaccio e2e loop**

```bash
cd /Users/radist/WebstormProjects/qraft/e2e
corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: PASS. This command is the slow path and is required before claiming the refactor is complete.

---

### Task 6: Final Verification and Cleanup

**Files:**

- Inspect: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Inspect: `packages/tree-shaking-plugin/src/lib/resolvers/*.ts`
- Inspect: `packages/tree-shaking-plugin/src/core.ts`

- [ ] **Step 1: Prove core transform no longer imports filesystem APIs**

```bash
rg -n "node:fs|fs\\.readFile|readFile\\(" packages/tree-shaking-plugin/src/core.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts
```

Expected: no matches.

- [ ] **Step 2: Confirm any remaining filesystem reads are adapter-local or test-only**

```bash
rg -n "node:fs|fs\\.readFile|readFile\\(" packages/tree-shaking-plugin/src
```

Expected: matches are limited to tests and adapter-local code such as `src/lib/resolvers/esbuild.ts`; no match appears in `src/core.ts` or `src/lib/transform/plan.ts`.

- [ ] **Step 3: Run final package verification**

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

Expected: all commands exit `0`.

- [ ] **Step 4: Run final full e2e verification**

```bash
cd /Users/radist/WebstormProjects/qraft/e2e
corepack yarn e2e:tree-shaking-bundlers-local
```

Expected: exits `0`.

- [ ] **Step 5: Commit final cleanup if needed**

If final verification required cleanup:

```bash
git add packages/tree-shaking-plugin e2e/projects/tree-shaking-bundlers
git commit -m "chore(tree-shaking): finalize module access cleanup"
```

If there are no changes after verification, do not create a commit.

---

### Notes for Implementers

- Keep code comments in English.
- Do not weaken bundle assertions to make a failing bundler pass. A failure after removing `fs` usually means that adapter `load()` cannot see the generated module source.
- `plan.ts` may still parse source code with Babel. The issue this plan fixes is the source provider boundary, not AST parsing itself.
- Keep `resolve?: QraftResolver` for compatibility during development, but treat `moduleAccess` as the stronger contract. If both are provided, `moduleAccess.resolve` wins in direct core calls; bundler entrypoints should pass `options.resolve` into their adapter as the user fallback.
- Esbuild is intentionally different: it has `build.resolve` but not a public arbitrary `build.load` API. Its fallback may read ordinary file paths inside `src/lib/resolvers/esbuild.ts`, but core transform must remain filesystem-free.
