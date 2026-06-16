# Tree-Shaking Standalone Project Transform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Keep the checklist current as work lands. Do not merge unrelated refactors into these commits.

**Goal:** Build a standalone project transform API and CLI that can preview or write `@openapi-qraft/tree-shaking-plugin` transforms across source files without a bundler plugin.

**Architecture:** Reuse `transformQraftTreeShaking(...)` and the existing Node `QraftModuleAccess` adapter. Add a small project layer for file discovery, project-level cache reuse, result reporting, config loading, and a thin `qraft-tree-shake` binary. Keep transform semantics unchanged: the standalone utility only supplies source files and module access.

**Tech Stack:** TypeScript, Node `fs/promises`, Node `util.parseArgs`, `tinyglobby` for file discovery, `jiti` for `.ts` config loading, Vitest temporary filesystem fixtures, existing Babel transform core.

---

## Scope Decisions

- Implement the project transform utility and CLI now.
- Expose the project API as `@openapi-qraft/tree-shaking-plugin/standalone`.
- Add a package binary named `qraft-tree-shake`.
- Use Node `parseArgs` instead of adding `commander`; this CLI has a small option surface.
- Do not expose `createNodeModuleAccess(...)` as a public subpath. It remains internal behind the project transform API.
- Do not add bundler-specific resolver behavior.
- Do not add source map file writing.
- Do not add a full diff renderer in the first version. Preview mode reports changed files and returns transformed code through the programmatic result.
- Use real temporary filesystem fixtures for tests. This validates the actual Node resolver, file IO, globbing, and `jiti` behavior that the utility depends on.

## Public API Contract

`packages/tree-shaking-plugin/src/standalone.ts` should export:

```ts
export type {
  QraftTreeShakeProjectConfig,
  TransformQraftProjectFileResult,
  TransformQraftProjectMode,
  TransformQraftProjectOptions,
  TransformQraftProjectResult,
  TransformQraftProjectSummary,
} from './lib/standalone/project.js';
export {
  formatTransformQraftProjectSummary,
  transformQraftProject,
} from './lib/standalone/project.js';
export {
  findTransformQraftProjectConfig,
  loadTransformQraftProjectConfig,
} from './lib/standalone/config.js';
```

Use this project result shape:

```ts
export type TransformQraftProjectMode = 'preview' | 'write';

export type TransformQraftProjectOptions = {
  root?: string;
  files?: string[];
  include?: string | string[];
  exclude?: string | string[];
  treeShakeOptions: QraftTreeShakeOptions;
  mode?: TransformQraftProjectMode;
};

export type QraftTreeShakeProjectConfig = TransformQraftProjectOptions;

export type TransformQraftProjectFileResult =
  | {
      status: 'changed';
      filePath: string;
      code: string;
      outputCode: string;
      written: boolean;
    }
  | {
      status: 'skipped';
      filePath: string;
      code: string;
      written: false;
    }
  | {
      status: 'failed';
      filePath: string;
      code: string;
      written: false;
      error: unknown;
    };

export type TransformQraftProjectSummary = {
  total: number;
  changed: number;
  skipped: number;
  failed: number;
  written: number;
};

export type TransformQraftProjectResult = {
  root: string;
  mode: TransformQraftProjectMode;
  files: TransformQraftProjectFileResult[];
  summary: TransformQraftProjectSummary;
};
```

Default file discovery:

```ts
const defaultProjectInclude = ['src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'];
const defaultProjectExclude = ['node_modules/**', 'dist/**', '**/*.d.ts'];
```

When creating Node module access, preserve both modern `treeShakeOptions.moduleAccess` and legacy `treeShakeOptions.resolve`:

```ts
const moduleAccess = createNodeModuleAccess({
  root,
  moduleAccess: {
    ...options.treeShakeOptions.moduleAccess,
    resolve:
      options.treeShakeOptions.moduleAccess?.resolve ??
      options.treeShakeOptions.resolve,
  },
});
```

## File Structure

- Modify: `packages/tree-shaking-plugin/package.json`
- Modify: `packages/tree-shaking-plugin/rollup.config.mjs`
- Create: `packages/tree-shaking-plugin/bin.mjs`
- Create: `packages/tree-shaking-plugin/src/standalone.ts`
- Create: `packages/tree-shaking-plugin/src/bin.ts`
- Create: `packages/tree-shaking-plugin/src/lib/standalone/project.ts`
- Create: `packages/tree-shaking-plugin/src/lib/standalone/config.ts`
- Create: `packages/tree-shaking-plugin/src/lib/standalone/project.test.ts`
- Create: `packages/tree-shaking-plugin/src/lib/standalone/config.test.ts`
- Create: `packages/tree-shaking-plugin/src/bin.test.ts`
- Modify: `packages/tree-shaking-plugin/README.md`
- Modify: `docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md`

---

## Task 1: Package Surface And Dependency Setup

**Files:**
- Modify: `packages/tree-shaking-plugin/package.json`
- Modify: `packages/tree-shaking-plugin/rollup.config.mjs`
- Create: `packages/tree-shaking-plugin/bin.mjs`
- Create: `packages/tree-shaking-plugin/src/standalone.ts`
- Create: `packages/tree-shaking-plugin/src/bin.ts`

- [ ] **Step 1: Add dependencies**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin add jiti tinyglobby
```

Expected:

- `packages/tree-shaking-plugin/package.json` has `jiti` and `tinyglobby` under `dependencies`.
- `yarn.lock` is updated.

- [ ] **Step 2: Add package export and binary metadata**

In `packages/tree-shaking-plugin/package.json`, add:

```json
  "bin": {
    "qraft-tree-shake": "./bin.mjs"
  }
```

Add this package export:

```json
    "./standalone": {
      "types": "./dist/types/standalone.d.ts",
      "import": "./dist/esm/standalone.js",
      "require": "./dist/cjs/standalone.cjs"
    }
```

Keep `./package.json` unchanged.

- [ ] **Step 3: Update Rollup entries**

In `packages/tree-shaking-plugin/rollup.config.mjs`:

- Add `./standalone` to the package entry list.
- Add a separate Rollup config for `src/bin.ts`.
- Add `jiti` and `tinyglobby` to `externalDependencies`.
- Keep `treeshake: false`, matching existing plugin package output.

Target structure:

```js
const exportedEntries = [
  '.',
  './vite',
  './rollup',
  './webpack',
  './rspack',
  './esbuild',
  './standalone',
];

const binConfig = rollupConfig(
  {
    import: './dist/esm/bin.js',
    require: './dist/cjs/bin.cjs',
  },
  {
    treeshake: false,
    input: 'src/bin.ts',
    externalDependencies,
  }
);

export default [...exportedConfigs, binConfig];
```

- [ ] **Step 4: Create binary wrapper**

Create `packages/tree-shaking-plugin/bin.mjs`:

```js
#!/usr/bin/env node
'use strict';

/**
 * Workaround to allow `rimraf dist/` on rebuilds and keep `bin` executable
 * without a need `yarn install`.
 */
import { main } from './dist/esm/bin.js';

const exitCode = await main(process.argv);

if (typeof exitCode === 'number') {
  process.exitCode = exitCode;
}
```

- [ ] **Step 5: Create temporary stub exports**

Create `packages/tree-shaking-plugin/src/standalone.ts`:

```ts
export {};
```

Create `packages/tree-shaking-plugin/src/bin.ts`:

```ts
export async function main() {
  throw new Error('qraft-tree-shake is not implemented yet.');
}
```

- [ ] **Step 6: Verify the package builds**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
```

Expected: PASS. The binary can still throw at runtime because the implementation is stubbed.

- [ ] **Step 7: Commit package surface setup**

Run:

```bash
git add yarn.lock packages/tree-shaking-plugin/package.json packages/tree-shaking-plugin/rollup.config.mjs packages/tree-shaking-plugin/bin.mjs packages/tree-shaking-plugin/src/standalone.ts packages/tree-shaking-plugin/src/bin.ts
git commit -m "build: add standalone tree-shake entrypoints"
```

---

## Task 2: Project Transform API

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/standalone/project.ts`
- Create: `packages/tree-shaking-plugin/src/lib/standalone/project.test.ts`
- Modify: `packages/tree-shaking-plugin/src/standalone.ts`

- [ ] **Step 1: Write failing project API tests**

Create `packages/tree-shaking-plugin/src/lib/standalone/project.test.ts`.

Test with real temporary roots created through `fs.mkdtemp(...)`. Reuse the generated API fixture shape from `src/lib/resolvers/node.test.ts`:

- `tsconfig.json` with `baseUrl` and `paths` for `@api/my-api`.
- Generated API entry exporting `createReactAPIClient`.
- `APIClientContext.ts`.
- `services/index.ts`.
- `services/PetsService.ts`.

Cover these cases:

- Preview mode transforms changed files and does not write to disk.
- Write mode writes changed files and reports `written: 1`.
- Unchanged files are reported as `skipped`.
- A missing API module records a `failed` file with the original `Error`.
- Explicit `files` bypass glob discovery.
- `include` and `exclude` globs discover only project source files and ignore `node_modules`, `dist`, and `*.d.ts` by default.

Use `satisfies` for project option fixtures:

```ts
const options = {
  root,
  include: ['src/App.tsx', 'src/unchanged.ts'],
  treeShakeOptions: {
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
} satisfies TransformQraftProjectOptions;
```

- [ ] **Step 2: Run tests and confirm red state**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest --run src/lib/standalone/project.test.ts
```

Expected: FAIL because `src/lib/standalone/project.ts` does not exist yet.

- [ ] **Step 3: Implement project transform API**

Create `packages/tree-shaking-plugin/src/lib/standalone/project.ts`.

Implementation requirements:

- Resolve `root` with `path.resolve(options.root ?? process.cwd())`.
- Use `mode = options.mode ?? 'preview'`.
- Resolve project files with:
  - `options.files`, if provided, normalized to absolute paths relative to `root`.
  - otherwise `tinyglobby.glob(include, { cwd: root, absolute: true, ignore: exclude, onlyFiles: true })`.
- Use default include and exclude patterns when options omit them.
- Sort and deduplicate resolved file paths for stable output.
- Create one `generatedMetadataCache` per project run and reuse it for every file.
- Create one Node `moduleAccess` per project run.
- Preserve `treeShakeOptions.moduleAccess` and legacy `treeShakeOptions.resolve` when constructing Node module access.
- Reuse `resolvePluginSourceFilterOptions(...)` for the core transform source gate.
- For every source file:
  - Read UTF-8 code.
  - Call `transformQraftTreeShaking(...)`.
  - Report `skipped` when transform returns `undefined` or unchanged code.
  - In `write` mode, write changed code back to the same file.
  - Catch per-file transform errors and report `failed` without stopping the run.
- Implement `formatTransformQraftProjectSummary(result)` with a compact plain-text summary listing changed and failed files relative to `root`.

Avoid new abstraction unless tests force it. Small private helpers are enough:

- `resolveProjectFiles(...)`
- `normalizePatterns(...)`
- `summarizeProjectTransform(...)`
- `formatFileList(...)`

- [ ] **Step 4: Export standalone API**

Update `packages/tree-shaking-plugin/src/standalone.ts` to export project types and values listed in the public API contract.

- [ ] **Step 5: Verify focused project tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest --run src/lib/standalone/project.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit project API**

Run:

```bash
git add packages/tree-shaking-plugin/src/standalone.ts packages/tree-shaking-plugin/src/lib/standalone/project.ts packages/tree-shaking-plugin/src/lib/standalone/project.test.ts
git commit -m "feat: add standalone project transform API"
```

---

## Task 3: Config Discovery And Loading

**Files:**
- Create: `packages/tree-shaking-plugin/src/lib/standalone/config.ts`
- Create: `packages/tree-shaking-plugin/src/lib/standalone/config.test.ts`
- Modify: `packages/tree-shaking-plugin/src/standalone.ts`

- [ ] **Step 1: Write failing config tests**

Create `packages/tree-shaking-plugin/src/lib/standalone/config.test.ts`.

Cover:

- `findTransformQraftProjectConfig(root)` returns the first existing default config filename.
- Default config order:
  - `qraft-tree-shake.config.ts`
  - `qraft-tree-shake.config.mts`
  - `qraft-tree-shake.config.js`
  - `qraft-tree-shake.config.mjs`
  - `qraft-tree-shake.config.cjs`
  - `qraft-tree-shake.config.cts`
- `findTransformQraftProjectConfig(root)` returns `null` when no config exists.
- `loadTransformQraftProjectConfig(configFile)` loads a TypeScript default export.
- `loadTransformQraftProjectConfig(configFile)` loads a CommonJS export.

Use temp files and keep config content minimal:

```ts
export default {
  include: ['src/App.tsx'],
  treeShakeOptions: {
    entrypoints: [],
  },
} satisfies import('../../standalone.js').QraftTreeShakeProjectConfig;
```

If `jiti` cannot resolve type-only package imports from the temp config during the test, remove the type import from the fixture. The runtime loader should not depend on the config importing this package.

- [ ] **Step 2: Run tests and confirm red state**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest --run src/lib/standalone/config.test.ts
```

Expected: FAIL because `src/lib/standalone/config.ts` does not exist yet.

- [ ] **Step 3: Implement config discovery/loading**

Create `packages/tree-shaking-plugin/src/lib/standalone/config.ts`.

Implementation requirements:

- Export `defaultTransformQraftProjectConfigFiles`.
- Implement `findTransformQraftProjectConfig(root = process.cwd())`.
- Resolve `root` to an absolute path.
- Check default filenames in order with `fs.access(...)`.
- Return the first absolute config path or `null`.
- Implement `loadTransformQraftProjectConfig(configFile)`.
- Use `createJiti(pathToFileURL(resolvedConfigFile).href)` and `await jiti.import(resolvedConfigFile, { default: true })`.
- Cast at the config trust boundary only:

```ts
return loadedConfig as QraftTreeShakeProjectConfig;
```

This `as` is acceptable because runtime validation is explicitly out of scope for the first version and external config loading is a trust boundary.

- [ ] **Step 4: Export config API**

Update `packages/tree-shaking-plugin/src/standalone.ts` to export:

- `findTransformQraftProjectConfig`
- `loadTransformQraftProjectConfig`

- [ ] **Step 5: Verify focused config tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest --run src/lib/standalone/config.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit config loading**

Run:

```bash
git add packages/tree-shaking-plugin/src/standalone.ts packages/tree-shaking-plugin/src/lib/standalone/config.ts packages/tree-shaking-plugin/src/lib/standalone/config.test.ts
git commit -m "feat: load standalone tree-shake config"
```

---

## Task 4: CLI Entrypoint

**Files:**
- Modify: `packages/tree-shaking-plugin/src/bin.ts`
- Create: `packages/tree-shaking-plugin/src/bin.test.ts`

- [ ] **Step 1: Write failing CLI tests**

Create `packages/tree-shaking-plugin/src/bin.test.ts`.

Use temp roots and call `main(processArgv, io)` directly. Do not spawn a child process for unit tests.

Cover:

- `--help` prints usage and returns `0`.
- Missing config returns `1` and prints a clear error.
- Preview mode with a config returns `0`, prints the summary, and does not write files.
- `--write` writes changed files.
- A transform failure returns `1` and prints the summary to stderr.
- `--root` changes config discovery root.
- `--config` loads an explicit config path.

Use a tiny IO test double:

```ts
const io = {
  log: vi.fn(),
  error: vi.fn(),
} satisfies QraftTreeShakeCliIo;
```

- [ ] **Step 2: Run tests and confirm red state**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest --run src/bin.test.ts
```

Expected: FAIL because `src/bin.ts` is still a stub.

- [ ] **Step 3: Implement CLI main**

Update `packages/tree-shaking-plugin/src/bin.ts`.

Implementation requirements:

- Export `QraftTreeShakeCliIo`.
- Export `main(processArgv = process.argv, io = console): Promise<number>`.
- Parse only these options:
  - `--help`
  - `--config <path>`
  - `--root <path>`
  - `--write`
- Print usage for `--help`.
- Resolve root before config discovery.
- If `--config` is passed, resolve it relative to `root` unless absolute.
- If `--config` is absent, call `findTransformQraftProjectConfig(root)`.
- Return `1` with an error if config is missing.
- Load config through `loadTransformQraftProjectConfig(...)`.
- Call `transformQraftProject(...)` with:

```ts
const projectOptions = {
  ...config,
  root,
  mode: values.write ? 'write' : config.mode ?? 'preview',
} satisfies QraftTreeShakeProjectConfig;
```

- Print `formatTransformQraftProjectSummary(result)`.
- Return `1` if `result.summary.failed > 0`, otherwise `0`.
- Catch top-level errors, print the message to stderr, and return `1`.

Usage text:

```text
Usage: qraft-tree-shake [--config <path>] [--root <path>] [--write]

Options:
  --config <path>  Path to qraft-tree-shake config
  --root <path>    Project root for config discovery and relative paths
  --write          Write transformed code back to source files
  --help           Show this help
```

- [ ] **Step 4: Verify focused CLI tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest --run src/bin.test.ts
```

Expected: PASS.

- [ ] **Step 5: Verify binary smoke path**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
node packages/tree-shaking-plugin/bin.mjs --help
```

Expected: `--help` prints usage and exits with code `0`.

- [ ] **Step 6: Commit CLI**

Run:

```bash
git add packages/tree-shaking-plugin/src/bin.ts packages/tree-shaking-plugin/src/bin.test.ts packages/tree-shaking-plugin/bin.mjs
git commit -m "feat: add qraft tree-shake CLI"
```

---

## Task 5: Documentation And Final Verification

**Files:**
- Modify: `packages/tree-shaking-plugin/README.md`
- Modify: `docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md`

- [ ] **Step 1: Document standalone transform usage**

Add a README section named `Standalone transform`.

Include:

- `qraft-tree-shake` preview command.
- `qraft-tree-shake --write` write command.
- A TypeScript config example:

````md
```ts
import type { QraftTreeShakeProjectConfig } from '@openapi-qraft/tree-shaking-plugin/standalone';

export default {
  include: ['src/**/*.{ts,tsx}'],
  treeShakeOptions: {
    entrypoints: [
      {
        kind: 'clientFactory',
        factory: {
          moduleSpecifier: '@api/my-api',
          exportName: 'createReactAPIClient',
        },
        reactContext: {
          exportName: 'APIClientContext',
        },
      },
    ],
  },
} satisfies QraftTreeShakeProjectConfig;
```
````

Explain briefly:

- Preview mode does not write files.
- `--write` rewrites changed source files.
- The CLI returns a non-zero exit code when at least one file fails to transform.

- [ ] **Step 2: Record implementation note in design spec**

Append to `docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md` under `Implementation Notes`:

```md
- Task 2 implemented the standalone project transform API and `qraft-tree-shake` CLI. The implementation reuses the Node module access adapter from Task 1, keeps the Babel transform semantics unchanged, and uses real filesystem tests to validate resolver, glob, config, and write behavior.
```

- [ ] **Step 3: Run focused standalone tests**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin vitest --run src/lib/standalone/project.test.ts src/lib/standalone/config.test.ts src/bin.test.ts
```

Expected: PASS.

- [ ] **Step 4: Run full package verification**

Run:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
corepack yarn workspace @openapi-qraft/tree-shaking-plugin build
node packages/tree-shaking-plugin/bin.mjs --help
```

Expected:

- All commands PASS.
- Existing Node deprecation warnings are acceptable if they match the current resolver test warnings.
- `node packages/tree-shaking-plugin/bin.mjs --help` prints usage and exits `0`.

- [ ] **Step 5: Verify repository status**

Run:

```bash
git status --short
```

Expected:

- Only intentional source, docs, package, and lockfile changes are present before the final docs commit.
- No generated `dist/` files are tracked.

- [ ] **Step 6: Commit documentation**

Run:

```bash
git add packages/tree-shaking-plugin/README.md docs/superpowers/specs/2026-06-16-tree-shaking-standalone-transform-design.md
git commit -m "docs: document standalone tree-shake CLI"
```

---

## Final Review Checklist

- [ ] Public API is available from `@openapi-qraft/tree-shaking-plugin/standalone`.
- [ ] Binary is available as `qraft-tree-shake`.
- [ ] Preview mode never writes changed files.
- [ ] Write mode writes only changed files.
- [ ] Project transform reuses one generated metadata cache per run.
- [ ] Project transform catches per-file failures and returns them in the result.
- [ ] CLI returns non-zero when any file fails.
- [ ] Config loading supports TypeScript and CommonJS configs.
- [ ] Tests use real temporary filesystem fixtures.
- [ ] Full package test, typecheck, lint, and build pass.
