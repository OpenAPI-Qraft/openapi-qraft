# Tree-Shaking Standalone Transform Design

## Purpose

Define a standalone transformation path for
`@openapi-qraft/tree-shaking-plugin` that can optimize an existing codebase
without requiring users to enable a bundler plugin.

The design is intentionally split into two tasks:

1. build a Node module access adapter that can resolve and load generated
   modules outside a bundler;
2. build a project-level transform utility and CLI on top of that adapter.

This keeps module resolution testable on its own before any file-discovery,
diff, or write-mode behavior is added.

## Background

The current plugin core already exposes the right boundary:

```ts
transformQraftTreeShaking(
  code,
  id,
  options,
  moduleAccess,
  inputSourceMap,
  generatedMetadataCache,
  sourceFilters
);
```

Bundler integrations supply `moduleAccess.resolve` and `moduleAccess.load`
through Vite, Rollup, Webpack, Rspack, or esbuild adapters. A standalone tool
should keep using the same core transform and provide a Node/filesystem
`QraftModuleAccess` implementation instead of duplicating transform logic.

Resolver output is still an analysis input only. Emitted imports must continue
to follow the public config boundary: `factory.moduleSpecifier`,
`services.moduleSpecifierBase`, and `reactContext.moduleSpecifier`. The
standalone resolver must not leak physical filesystem paths into transformed
source.

## Task 1: Node Module Access Adapter

### Goal

Add an internal module, tentatively
`packages/tree-shaking-plugin/src/lib/resolvers/node.ts`, that creates a
`QraftModuleAccess` object for non-bundler environments.

The first version should be internal. It can become public when the standalone
project transform is ready and the package surface is documented.

### API Shape

The adapter should expose a factory along these lines:

```ts
export type NodeModuleAccessOptions = {
  root?: string;
  tsconfig?: 'auto' | string;
  resolverOptions?: NodeResolverOptions;
  moduleAccess?: QraftModuleAccessOptions;
};

export function createNodeModuleAccess(
  options?: NodeModuleAccessOptions
): QraftModuleAccess;
```

Exact option names can change during implementation, but the boundary should
stay small:

- `root` anchors relative config paths and diagnostics;
- `tsconfig` defaults to `'auto'`;
- `resolverOptions` passes through supported resolver tuning;
- `moduleAccess` preserves user `resolve` and `load` escape hatches.

### Resolver Library

Use an existing resolver library rather than implementing module resolution
manually. The recommended baseline is `oxc-resolver` because it supports modern
Node/TypeScript resolution concerns that matter for this feature:

- relative and absolute imports;
- package `exports`;
- TypeScript `baseUrl` and `paths`;
- TypeScript project references and `tsconfig` auto-discovery;
- extension probing;
- extension aliases such as `.js` imports resolving to `.ts` sources.

The adapter should translate `oxc-resolver` results into the existing
`QraftModuleAccess` contract:

```ts
{
  async resolve(specifier, importer) {
    // user resolve first, then oxc resolver, then null on miss
  },
  async load(resolvedId) {
    // user load first, then filesystem read, then null on miss
  },
}
```

### Defaults

Use defaults that match generated TypeScript source projects:

- `tsconfig: 'auto'`;
- `conditionNames: ['node', 'import']`;
- `extensions: ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']`;
- `extensionAlias` for `.js`, `.mjs`, and `.cjs` imports to corresponding
  TypeScript sources before JavaScript sources.

These defaults are intentionally not a full Vite/Webpack/Rspack compatibility
promise. Projects with bundler-specific aliases or virtual modules should use
the existing user `moduleAccess.resolve` and `moduleAccess.load` hooks.

### Error Handling

Resolution and loading misses should return `null`, matching the current
`QraftModuleAccess` contract. Unexpected user hook errors should be captured in
module access traces the same way existing resolver chains do.

The adapter should preserve trace compatibility by building on
`createQraftModuleAccess(...)` and strategy helpers where possible, rather than
returning an untraceable plain object.

### Tests

Task 1 should be validated independently with temporary fixture workspaces:

- relative import: `./api` resolves to `src/api/index.ts`;
- extension alias: `./api.js` resolves to TypeScript source when present;
- TypeScript paths: `@api/*` resolves through `tsconfig.paths`;
- nested monorepo shape: `tsconfig: 'auto'` resolves from
  `packages/app/src/App.tsx`;
- package exports: a public package/subpath import resolves through `exports`;
- load behavior: `load(resolvedId)` reads source files and strips query/hash;
- user hooks: explicit `moduleAccess.resolve` and `moduleAccess.load` can
  override or provide virtual modules.

Add one integration smoke test that uses the adapter with
`transformQraftTreeShaking(...)`. The assertion should prove that physical
resolved paths are used for generated-source analysis while emitted operation
and context imports remain public-specifier-first.

## Task 2: Standalone Project Transform Utility

### Goal

Build a project-level transformation utility on top of Task 1. This utility can
later be exposed as a CLI binary.

The default behavior should be preview-only. Writing transformed files must
require an explicit opt-in such as `--write`.

### API Shape

Add a project transform API along these lines:

```ts
export type TransformQraftProjectOptions = {
  root?: string;
  files?: string[];
  include?: FilterPattern;
  exclude?: FilterPattern;
  treeShakeOptions: QraftTreeShakeOptions;
  mode?: 'preview' | 'write';
};

export async function transformQraftProject(
  options: TransformQraftProjectOptions
): Promise<TransformQraftProjectResult>;
```

The project utility should be responsible for file iteration and reporting. It
should not add new AST transform semantics.

### Data Flow

For each selected source file:

1. read the file from disk;
2. reuse one `GeneratedMetadataCache` for the whole project run;
3. create or reuse the Node `QraftModuleAccess`;
4. call `transformQraftTreeShaking(...)`;
5. record unchanged, changed, skipped, and failed files;
6. in preview mode, keep the transformed code in memory for diff/reporting;
7. in write mode, write only files whose code changed.

Source maps are out of scope for the initial project rewrite unless a later
implementation plan proves a practical file-level contract.

### CLI

The CLI should be a thin wrapper around `transformQraftProject(...)`.

Suggested defaults:

- command name: `qraft-tree-shake`;
- default mode: preview;
- write mode: `--write`;
- config file: `qraft-tree-shake.config.ts` or explicit `--config`;
- exit non-zero on diagnostics errors or filesystem failures;
- print a compact summary of changed, unchanged, skipped, and failed files.

The config file should wrap existing plugin options rather than inventing a
second transform config:

```ts
export default {
  root: process.cwd(),
  include: ['src/**/*.{ts,tsx,mts,cts,js,jsx}'],
  treeShakeOptions: {
    entrypoints: [
      {
        kind: 'clientFactory',
        factory: {
          exportName: 'createReactAPIClient',
          moduleSpecifier: './api',
        },
        reactContext: {
          exportName: 'APIClientContext',
          moduleSpecifier: './api',
        },
      },
    ],
  },
};
```

### Safety

Preview mode is the safe default because this tool rewrites user source files.

Write mode should:

- write only when transformed code differs;
- avoid touching generated API source files unless users include them
  explicitly;
- preserve the existing diagnostics policy from `QraftTreeShakeOptions`;
- fail clearly when configured entrypoints look transformable but cannot be
  resolved or loaded.

### Tests

Task 2 should reuse Task 1 fixtures and add project-level coverage:

- preview mode reports changed files without writing;
- write mode updates only changed files;
- unchanged files are left untouched;
- diagnostics errors are surfaced with the existing tree-shaking error shape;
- user config can provide custom module access hooks for virtual or unusual
  source layouts;
- integration snapshots match existing core transform snapshots for equivalent
  source/config inputs.

## Out Of Scope

- Reimplementing bundler-specific resolution behavior.
- Guaranteeing parity with every Vite/Webpack/Rspack plugin or virtual module.
- Changing tree-shaking transform semantics.
- Emitting physical filesystem import paths from resolved generated modules.
- Formatting preservation beyond the existing Babel generator output.
- Source map writing for project rewrite mode.

## Success Criteria

Task 1 is successful when the Node module access adapter can resolve and load
realistic TypeScript project layouts without a bundler, and the transform core
can use it for generated-source analysis.

Task 2 is successful when users can run a preview of the current tree-shaking
transform against a source tree, inspect what would change, and explicitly opt
into writing the optimized TypeScript back to disk.

## Implementation Notes

Task 1 implemented the Node module access adapter as an internal resolver module
backed by `oxc-resolver`. The adapter is intentionally not documented as public
API yet; the public surface should be decided together with the standalone
project transform utility in Task 2.
