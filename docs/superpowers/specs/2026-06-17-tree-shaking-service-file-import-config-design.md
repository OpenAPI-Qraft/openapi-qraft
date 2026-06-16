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

The same ESM-extension concern applies to other imports emitted by the
transform: the React context import for generated context clients and the
options factory import for pre-created clients. Those imports should receive
their own explicit extension configuration because their public modules may live
under a different layout from service files.

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

When optimizing context-backed generated clients, the transform may also emit a
configured React context import from `reactContext.moduleSpecifier`. That
specifier is currently inserted as configured, with no way to request an ESM
extension when the config uses a path-like source specifier.

When optimizing pre-created clients, the transform emits an options factory
import from `optionsFactory.moduleSpecifier`. Path-like options factory imports
can be recomposed relative to the transformed source file, but the helper still
strips source extensions and offers no way to append `.js`.

## Public API

Extend `ServicesTarget` with two optional fields:

```ts
export type ReactContextTarget = {
  exportName: string;
  moduleSpecifier?: string;
  importExtension?: string;
};

export type OptionsFactoryTarget = {
  exportName: string;
  moduleSpecifier: string;
  importExtension?: string;
};

export type ServicesTarget = {
  moduleSpecifierBase?: string;
  directory?: string;
  fileNamePostfix?: string;
  importExtension?: string;
};
```

Use `OptionsFactoryTarget` for
`QraftPrecreatedClientEntrypointConfig.optionsFactory`. Do not add
`importExtension` to `factory` or `client`; those module specifiers are
primarily matching and resolution inputs, not newly emitted optimized imports.

Normalize these fields into internal config objects:

```ts
export type ReactContextConfig = {
  exportName: string;
  moduleSpecifier: string;
  importExtension: string;
};

export type ImportTarget = {
  exportName: string;
  moduleSpecifier: string;
  importExtension?: string;
};

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

All new import extension fields default to an empty string. Empty string means
"do not append an extension".

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

Context imports can opt in independently:

```ts
reactContext: {
  exportName: "InternalReactAPIClientContext",
  moduleSpecifier: "./fixtures/files-api/InternalReactAPIClientContext",
  importExtension: ".js",
}
```

Pre-created options imports can opt in independently:

```ts
optionsFactory: {
  exportName: "createOptions",
  moduleSpecifier: "./client-options",
  importExtension: ".js",
}
```

The transform should not provide a top-level `importExtension` shortcut in this
design. Service files, context modules, and pre-created options modules can have
different public layouts, so each emitted import target owns its extension.

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

Do not mutate bare module specifiers with import extensions. A configured
specifier such as `@api/my-api` or `@scope/client/options` must stay exactly as
configured, even when it contains a package subpath. Users who need an
extension in a package subpath should provide that exact module specifier
themselves.

Do not alter runtime callback selection, generated source ownership checks,
resolver behavior, diagnostics levels, or standalone project file discovery.

## Data Flow

Keep defaults in `normalizeServices(...)` so the rest of the transform receives
a fully normalized service import configuration.

Keep React context extension defaults in `normalizeReactContext(...)`. Keep
pre-created options factory extension defaults while normalizing pre-created
entrypoints.

The new service fields flow through the existing model:

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

For context imports, `GeneratedClientInfo.contextImportPath` should hold the
fully emitted context import specifier. If `reactContext.importExtension` is
configured and `reactContext.moduleSpecifier` is path-like, append the extension
unless the specifier already ends with that extension.

For pre-created options imports, `resolvePrecreatedOptionsImportPath(...)`
should accept the configured `optionsFactory.importExtension`. It should keep
bare specifiers unchanged, preserve the existing relative recomposition behavior
for path-like specifiers, and append the configured extension to the emitted
path-like specifier when needed.

Use one shared path-rendering helper for appending configured extensions to
path-like import specifiers. The helper should:

- leave bare specifiers unchanged;
- leave empty extensions unchanged;
- avoid duplicating an extension that is already present;
- strip TypeScript source extensions before appending the configured extension;
- preserve query/hash handling already used by resolved source paths.

## Entrypoint Keys And Caching

Include the new normalized extension fields in entrypoint keys:

- `services.fileNamePostfix`;
- `services.importExtension`;
- `reactContext.importExtension`;
- `optionsFactory.importExtension`.

Different emitted import layouts must not share cached generated metadata or
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
- omitted `reactContext.importExtension` and
  `optionsFactory.importExtension` normalize to `""`;
- explicit `reactContext.importExtension` and
  `optionsFactory.importExtension` are preserved;
- normalized keys include all new fields.

`path-rendering.test.ts`:

- service import paths can append `.js`;
- configured extension replaces stripped `.ts`/`.tsx`/`.mts`/`.cts` source
  extensions instead of duplicating them;
- path-like context and options imports can append `.js`;
- bare context and options module specifiers are unchanged;
- existing `.js` specifiers do not become `.js.js`;
- default empty extension preserves current snapshots.

Core transform coverage, in `create-api-client-fn.test.ts` unless a more local
existing case is extended:

- a generated factory entrypoint with
  `services: { fileNamePostfix: "", importExtension: ".js" }` rewrites
  `api.pets.getPets.useQuery()` to import the operation from
  `./api/services/Pets.js`;
- a context-backed generated factory with
  `reactContext: { moduleSpecifier: "./api/APIClientContext", importExtension: ".js" }`
  emits the context import from `./api/APIClientContext.js`;
- existing default snapshots continue to emit `PetsService` without an
  extension.

Pre-created transform coverage, in `precreated-api-client.test.ts`:

- a pre-created client entrypoint with
  `optionsFactory: { moduleSpecifier: "./client-options", importExtension: ".js" }`
  emits the options import from `./client-options.js`;
- a bare options factory module specifier stays bare when `importExtension` is
  configured.

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
},
reactContext: {
  exportName: "InternalReactAPIClientContext",
  moduleSpecifier: `${filesApiModule}/index`,
  importExtension: ".js",
}
```

This mirrors the generated fixture shape where files live at
`services/Files.ts` and public ESM imports point at `services/Files.js`.
The context module also needs an emitted `.js` specifier when configured through
a path-like generated-client module.

## Success Criteria

- Existing tree-shaking tests pass without snapshot churn outside the intended
  import specifier cases.
- The standalone transform can rewrite
  `generatedEmbeddedCustomContextApi.files.getFileList` to import
  `getFileList` from `./fixtures/files-api/services/Files.js`.
- Context-backed rewrites can import a configured path-like React context with
  `.js`.
- Pre-created client rewrites can import a configured path-like options factory
  with `.js`.
- Existing users with default generated service names continue to get
  `*Service`, context, and options imports with no explicit extension unless
  they opt in.
