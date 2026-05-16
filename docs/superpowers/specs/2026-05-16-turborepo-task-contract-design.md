# Turborepo Task Contract Design

Date: 2026-05-16

## Goal

Make the Turborepo setup reliable on a clean cache and easier to diagnose when running a single package task. The target state is a task graph where every dependency edge, input, and output describes real work that the package task needs.

This design is intentionally focused on Turborepo configuration and validation. It does not rename package scripts, change build tools, or refactor package source code unless a script/config boundary requires it.

## Current Findings

The repository uses Yarn 4.9.1 and Turborepo 2.9.6. The root `turbo.json` uses the modern `tasks` field and package-local configs extend the root with `extends: ["//"]`.

Several current task definitions make clean-cache behavior harder to trust:

- Root `build`, `typecheck`, `lint`, and `codegen` resolve with `inputs: []` for many tasks. For file-reading tasks this makes the cache key too opaque and can miss real source/config inputs.
- Root `build.dependsOn` includes local `codegen` and `write-package-version-file` for every package. Packages without those scripts still receive `<NONEXISTENT>` tasks in dry-run output.
- Root `codegen.dependsOn` includes `^build`, which can add upstream build edges even for packages that do not have real code generation.
- Package-local overrides can unintentionally replace important root dependencies. `packages/react-client/turbo.json` currently narrows `typecheck.dependsOn` to `["build"]`.
- `packages/ts-factory-code-generator/turbo.json` declares `codegen.inputs: []`, even though the generator script reads local files.
- `packages/tanstack-query-react-plugin/turbo.json` declares `codegen.inputs: ["generate-ts-factory.mjs"]`. That does not express the full generation contract because the script consumes built workspace code from `@openapi-qraft/ts-factory-code-generator`.

## Turborepo Rules To Follow

Turborepo package configs with `extends: ["//"]` override or define package-specific task behavior. They are useful for local differences, but an override must restate the full task contract it needs.

File-producing tasks must declare outputs so Turbo can restore generated artifacts from cache. File-reading tasks should rely on the default inputs or explicitly include `$TURBO_DEFAULT$` plus additional config files. Empty `inputs` should be reserved only for tasks that truly have no file inputs.

Environment variables that affect outputs must be modeled with `env` or `globalEnv`. Secrets that only need to be available at runtime should use `passThroughEnv` or `globalPassThroughEnv` instead of becoming hash inputs.

## Target Task Model

### Root Tasks

The root `turbo.json` should describe generic task behavior only:

- `build`: depends on `^build`, caches package build output, and uses normal file inputs.
- `test`: depends on local `build` only when the package tests require local build output; otherwise package-local overrides can choose a narrower contract.
- `typecheck`: depends on `^build` by default and on local generation only in packages that read generated source.
- `lint`: depends on generation only in packages that lint generated source or source that imports generated files.
- `dev`: remains uncached and persistent.
- `clean`: remains uncached.

The root `build` should not depend on local `codegen` or `write-package-version-file` for every package. Those dependencies belong in package-local configs for packages that actually have those scripts and consume their outputs.

### Generated Version File

`write-package-version-file` should stay as a cacheable task shape with:

- `inputs`: `["package.json"]`
- `outputs`: `["src/packageVersion.ts"]`

Only packages with the script and a build/typecheck dependency on `src/packageVersion.ts` should depend on it. Packages without the script should not receive a graph edge to a nonexistent task.

### Code Generation

`codegen` should be package-local by default. Each package with a real `codegen` script should declare:

- The command's true generated outputs.
- Inputs that include `$TURBO_DEFAULT$` unless there is a narrow, proven reason not to.
- Upstream `^build` only when the generator imports built workspace packages at runtime.

Packages without `codegen` scripts should not inherit a meaningful `codegen` task from the root.

### Self-Generating Factory Package

`@openapi-qraft/ts-factory-code-generator#codegen` should include the generator script and source files it reads as inputs. Its build should depend on local codegen and emit `dist/**`.

The desired behavior is:

- Changes to `generate-factory-code-generator.mjs` invalidate `codegen`.
- Changes to source files consumed by the generator invalidate `codegen`.
- Clean-cache runs can restore `src/generateFactoryCode.ts` before build.

### TanStack Query React Plugin Factory Generation

`@openapi-qraft/tanstack-query-react-plugin#codegen` should stay package-local with narrow outputs:

- `src/ts-factory/service-operation.generated/**/*.ts`

Its inputs should include the local generator entrypoint and any local templates/config that affect emitted files. The task should depend on the built `@openapi-qraft/ts-factory-code-generator` package because the script uses that generator as executable code.

### React Client

`@openapi-qraft/react#typecheck` should not narrow the dependency graph to only local `build` unless that is proven sufficient. The target contract is:

- Local generated API exists before typecheck.
- Workspace package dependencies are built before typecheck when imports resolve to package build outputs.
- Coverage output stays package-local for tests.

## Validation Plan

Use dry-run graph inspection before trusting task success:

- `yarn turbo run build --filter @openapi-qraft/react --dry=json`
- `yarn turbo run typecheck --filter @openapi-qraft/react --dry=json`
- `yarn turbo run codegen --filter @openapi-qraft/tanstack-query-react-plugin --dry=json`
- `yarn turbo run build --filter @openapi-qraft/ts-factory-code-generator --dry=json`
- `yarn turbo run typecheck --filter playground --dry=json`

For each dry run, inspect:

- No unexpected `<NONEXISTENT>` tasks on the critical path.
- Local generation appears only for packages with real generation scripts.
- Version-file generation appears only for packages with the script and consumer dependency.
- Outputs match generated/build artifacts.
- Inputs are not empty for file-reading tasks.

After graph inspection, run representative clean-cache validation:

- Remove package build/generated outputs for selected packages.
- Run filtered tasks from a clean local Turbo cache or with `--force`.
- Confirm the task graph recreates generated artifacts before build/typecheck.

## Non-Goals

- Do not change package manager, Turborepo version, or workspace layout.
- Do not rename public package scripts unless graph correctness cannot be achieved otherwise.
- Do not introduce remote cache configuration.
- Do not refactor source code generators beyond what is necessary to model inputs and outputs correctly.

## Acceptance Criteria

- Filtered package runs have a readable task graph with no unexplained nonexistent tasks on the required path.
- Clean-cache runs for representative packages regenerate required files before consuming them.
- Package-local Turborepo overrides restate full dependencies intentionally.
- Cache keys include real source/config inputs for generation and build tasks.
- The final implementation is verified with `turbo --dry=json` graph checks and representative package commands.
