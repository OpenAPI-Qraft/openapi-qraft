# Tree-Shaking External Import Specifiers Design

## Purpose

Capture follow-up design notes for `@openapi-qraft/tree-shaking-plugin` import
specifier handling when a generated client factory is imported through an alias,
bare package specifier, or third-party module.

This is a temporary review spec. It records risks and target behavior before an
implementation plan is written.

## Problem

The current transform can use a resolver to recognize a configured generated
factory:

```ts
import { createMyAPIClient } from '@api/my-api';
```

with config:

```ts
{
  kind: 'clientFactory',
  factory: {
    exportName: 'createMyAPIClient',
    moduleSpecifier: '@api/my-api',
  },
  reactContext: {
    exportName: 'APIClientContext',
  },
}
```

The resolver may map `@api/my-api` to a physical source file such as
`src/api/index.ts`. The transform currently uses that physical file path to
compose emitted operation and context imports:

```ts
import { getPets } from "./api/services/PetsService";
import { APIClientContext } from "./api/APIClientContext";
```

That behavior is risky. Resolving paths is useful for validation and metadata
loading, but resolved physical paths should not automatically become public
emitted import specifiers.

For real third-party packages this can produce imports such as:

```ts
import { getPets } from "../../node_modules/@scope/api/dist/services/PetsService";
import { APIClientContext } from "../../node_modules/@scope/api/dist/APIClientContext";
```

Those imports can bypass package `exports`, depend on package manager layout,
break under pnpm symlinks or virtual stores, and couple user output to private
package internals.

## Target Behavior

Resolver output may be used to:

- validate that a configured factory points to a generated client;
- load generated client metadata;
- inspect the generated factory to infer services and context relationships;
- resolve local source files while analyzing the generated client.

Resolver output must not, by itself, decide the import specifiers emitted into
the transformed user module.

For aliased, bare, or third-party factory imports, emitted imports should
preserve a public/module-specifier-based boundary. When
`reactContext.moduleSpecifier` is omitted, the context import should come from
the same public module specifier as `factory.moduleSpecifier`:

```ts
{
  kind: 'clientFactory',
  factory: {
    exportName: 'createMyAPIClient',
    moduleSpecifier: '@api/my-api',
  },
  reactContext: {
    exportName: 'APIClientContext',
  },
}
```

the transform should emit:

```ts
import { getPets } from "@api/my-api/services/PetsService";
import { APIClientContext } from "@api/my-api";
```

not physical relative paths derived from the resolver target.

When the context lives in a different public module, users can configure it
explicitly:

```ts
{
  kind: 'clientFactory',
  factory: {
    exportName: 'createMyAPIClient',
    moduleSpecifier: '@api/my-api',
  },
  reactContext: {
    exportName: 'APIClientContext',
    moduleSpecifier: '@api/my-api/APIClientContext',
  },
}
```

the transform should emit:

```ts
import { getPets } from "@api/my-api/services/PetsService";
import { APIClientContext } from "@api/my-api/APIClientContext";
```

This explicit path is also the escape hatch for aliased generated factory
internals, such as a factory that imports
`APIClientContext as InternalContext` and passes `InternalContext` as the third
argument to `qraftReactAPIClient(...)`.

## Service Import Configuration

The plugin needs a way to describe the public module specifier used for generated
services when it cannot safely infer that path.

Add an entrypoint-level services import configuration for `clientFactory`
entrypoints. The config should specify only the service module base specifier,
not an export name:

```ts
{
  kind: 'clientFactory',
  factory: {
    exportName: 'createMyAPIClient',
    moduleSpecifier: '@api/my-api',
  },
  services: {
    moduleSpecifier: '@api/my-api/services',
  },
  reactContext: {
    exportName: 'APIClientContext',
    moduleSpecifier: '@api/my-api/APIClientContext',
  },
}
```

Operation imports can then be composed from that public services base:

```ts
import { getPets } from "@api/my-api/services/PetsService";
```

The service export name does not need to be configurable for this design. The
generated services object is already discovered from the generated client, and
operation export names such as `getPets` still come from service files.

## Inference Rules

The transform should prefer emitted import specifiers in this order:

1. Explicit config:
   - `reactContext.moduleSpecifier` for context imports;
   - `services.moduleSpecifier` for operation imports.
2. Default public context import:
   - when `reactContext.exportName` is configured but
     `reactContext.moduleSpecifier` is omitted, import that context export from
     `factory.moduleSpecifier`.
3. Safe public service inference from the configured factory module specifier
   and the generated factory's own conventional services import.
4. Existing relative source-path composition only when the configured factory
   module specifier is itself local/path-like and the emitted file is expected
   to import the generated source tree directly.

If the configured factory uses a bare specifier and the transform cannot infer a
safe public service import specifier, it should skip the transform candidate
through diagnostics rather than emit physical relative paths into `node_modules`
or another resolved dependency location.

The transform should not infer emitted context import specifiers for bare
factory imports from the generated factory's physical source file. Use
`factory.moduleSpecifier` by default, or `reactContext.moduleSpecifier` when the
context is not exported from the factory module.

## Test Coverage To Add

- Aliased local factory import:
  - `import { createMyAPIClient } from '@api/my-api';`
  - resolver maps it to a local generated client;
  - emitted imports use `@api/my-api/services/PetsService` and
    `@api/my-api` for the default context import, not `./api/...`.
- Explicit context module:
  - `reactContext.moduleSpecifier: '@api/my-api/APIClientContext'`;
  - emitted context import uses `@api/my-api/APIClientContext`.
- Aliased generated context internals:
  - generated factory imports
    `APIClientContext as InternalContext` from `./APIClientContext`;
  - without `reactContext.moduleSpecifier`, emitted context import uses
    `factory.moduleSpecifier`;
  - with explicit `reactContext.moduleSpecifier`, emitted context import uses
    that explicit module.
- Third-party-style factory import:
  - resolver maps `@scope/api` to a fixture path under `node_modules`;
  - emitted imports do not contain `node_modules` or physical relative paths.
- Missing public services config:
  - if safe inference is unavailable for a bare factory module specifier, the
    candidate is skipped/reported via diagnostics instead of emitting unsafe
    imports.
- Existing local relative imports:
  - keep current relative emitted import behavior for `./api` style generated
    clients.

## Non-Goals

- Do not stop using the resolver for validation or metadata loading.
- Do not require users to configure service export names.
- Do not make bundler resolution decisions inside the transform. The transform
  should emit stable public specifiers and let the bundler resolve them.
- Do not broaden this into a full entrypoint API redesign beyond import
  specifier ownership.

## Open Review Notes

- Confirm the exact config shape before implementation. This spec uses
  `services.moduleSpecifier` as the proposed shape.
- Decide whether safe public inference from `factory.moduleSpecifier` should be
  enabled for all non-relative specifiers or only when the generated factory's
  services import has the conventional `./services/index` shape.
- Confirm whether default context imports from `factory.moduleSpecifier` require
  the generated factory module to re-export the configured context symbol, or
  whether this should be treated as a user-provided public contract.
