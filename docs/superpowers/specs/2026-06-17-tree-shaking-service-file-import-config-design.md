# Tree-Shaking Service File Import Config Design

## Purpose

Add explicit service-file import configuration to
`@openapi-qraft/tree-shaking-plugin` so optimized operation imports can match
generated API clients that use a custom `--postfix-services` value and explicit
ESM import extensions.

The motivating regression is a generated client whose runtime services index
imports `./services/Files.js`, while the tree-shaking transform currently emits
`./services/FilesService`. The transform assumes the generated service file base
is always the capitalized service property plus `Service`, and it always strips
source import extensions from operation import specifiers.

## Current Behavior

For a usage such as:

```ts
generatedEmbeddedCustomContextApi.files.getFileList.getQueryKey();
```

the transform extracts `files` as the service name and `getFileList` as the
operation name. `resolveOperationImport(...)` then computes the service file
base with `serviceNameToFileBase("files")`, which currently returns
`FilesService`.

The emitted operation import is composed from:

- `services.moduleSpecifierBase`;
- `services.directory`;
- the computed service file base.

This makes the current default output:

```ts
import { getFileList } from "./fixtures/files-api/services/FilesService";
```

That path is wrong when the generated OpenAPI Qraft client was created with a
custom service postfix, for example `--postfix-services ""`, because generated
files are named `Files.ts` and their ESM imports use `Files.js`.

## Public API

Extend `ServicesTarget` with two optional fields:

```ts
export type ServicesTarget = {
  moduleSpecifierBase?: string;
  directory?: string;
  fileNamePostfix?: string;
  importExtension?: string;
};
```

Normalize these fields into `ServicesConfig`:

```ts
export type ServicesConfig = {
  moduleSpecifierBase: string;
  directory: string;
  fileNamePostfix: string;
  importExtension: string;
};
```

Defaults preserve existing behavior:

- `fileNamePostfix: "Service"`;
- `importExtension: ""`.

The motivating fixture can opt in with:

```ts
services: {
  fileNamePostfix: "",
  importExtension: ".js",
}
```

This emits:

```ts
import { getFileList } from "./fixtures/files-api/services/Files.js";
```

## Non-Goals

Do not infer service file names from `services/index.ts` in this change. That
would make emitted import specifiers depend on parsed generated internals and
would add fragile cases around aliases, re-exports, type-only imports, and
custom layouts. The tree-shaking plugin already treats generated source as an
analysis input while emitted imports follow the public entrypoint config, so the
new configuration should stay explicit.

Do not change generated client output. The generator already exposes
`--postfix-services` and `--explicit-import-extensions`; this design only lets
the tree-shaking plugin mirror those choices when rewriting user code.

Do not alter runtime callback selection, generated source ownership checks,
resolver behavior, diagnostics levels, or standalone project file discovery.

## Data Flow

Keep defaults in `normalizeServices(...)` so the rest of the transform receives
a fully normalized service import configuration.

The new fields flow through the existing model:

```txt
ServicesTarget
  -> ServicesConfig
  -> GeneratedClientInfo
  -> resolveOperationImport(...)
  -> composeServiceOperationImportPath(...)
```

`resolveOperationImport(...)` should compute the service file base from the
service property and normalized postfix:

```ts
serviceNameToFileBase("files", "Service") // "FilesService"
serviceNameToFileBase("files", "")        // "Files"
```

`composeServiceOperationImportPath(...)` should append the normalized import
extension after stripping TypeScript source extensions and trailing `/index`.
This keeps existing behavior for default config while allowing ESM specifiers:

```ts
composeServiceOperationImportPath("./api", "./services", "./Files", ".js")
// "./api/services/Files.js"
```

If the incoming service import path already has a TypeScript source extension,
the helper should still emit a single configured extension:

```ts
composeServiceOperationImportPath("./api", "./services", "./Files.ts", ".js")
// "./api/services/Files.js"
```

## Entrypoint Keys And Caching

Include `fileNamePostfix` and `importExtension` in normalized entrypoint keys.
Different service-file layouts must not share cached generated metadata or
operation import information.

Operation import cache keys should also include the normalized postfix and
extension, either directly or by using the generated info fields that now carry
them. This prevents the same generated factory from reusing an import path from
a previous transform with different service import config.

## Testing

Add focused coverage at three levels.

`entrypoints.test.ts`:

- omitted service fields normalize to `fileNamePostfix: "Service"` and
  `importExtension: ""`;
- explicit `fileNamePostfix` and `importExtension` are preserved;
- normalized keys include both new fields.

`path-rendering.test.ts`:

- service import paths can append `.js`;
- configured extension replaces stripped `.ts`/`.tsx`/`.mts`/`.cts` source
  extensions instead of duplicating them;
- default empty extension preserves current snapshots.

Core transform coverage, in `create-api-client-fn.test.ts` unless a more local
existing case is extended:

- a generated factory entrypoint with
  `services: { fileNamePostfix: "", importExtension: ".js" }` rewrites
  `api.pets.getPets.useQuery()` to import the operation from
  `./api/services/Pets.js`;
- existing default snapshots continue to emit `PetsService` without an
  extension.

Standalone coverage can be added by extending the project transform smoke test
only if the implementation touches standalone-specific behavior. The public
standalone config uses the same `QraftTreeShakeOptions` type, so core transform
tests are the primary contract.

## React Client Fixture Config

After the transform supports the new fields,
`packages/react-client/qraft-tree-shake.config.ts` should configure the
embedded files API entrypoint with:

```ts
services: {
  fileNamePostfix: "",
  importExtension: ".js",
}
```

This mirrors the generated fixture shape where files live at
`services/Files.ts` and public ESM imports point at `services/Files.js`.

## Success Criteria

- Existing tree-shaking tests pass without snapshot churn outside the intended
  import specifier cases.
- The standalone transform can rewrite
  `generatedEmbeddedCustomContextApi.files.getFileList` to import
  `getFileList` from `./fixtures/files-api/services/Files.js`.
- Existing users with default generated service names continue to get
  `*Service` imports with no explicit extension unless they opt in.
