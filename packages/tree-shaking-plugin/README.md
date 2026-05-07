# @openapi-qraft/tree-shaking-plugin

Build plugin that eliminates dead code from [OpenAPI Qraft](https://openapi-qraft.github.io/openapi-qraft/) context API clients. Instead of bundling the full `createAPIClient()` client and all its service callbacks, the plugin rewrites each call site to import only the specific operation schema and the exact callbacks actually used at that location.

Supports **Vite**, **Rollup**, **Webpack**, **Rspack**, and **esbuild** via [unplugin](https://github.com/unjs/unplugin).

## How it works

Given a generated API client:

```ts
// src/api/index.ts  (generated, simplified for brevity)
export function createAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, APIClientContext);
}
```

And a component that uses it:

```ts
// src/App.tsx  (your code, before)
import { createAPIClient } from './api';

const api = createAPIClient();

export function PetList() {
  const { data: pets } = api.pets.getPets.useQuery();
  return pets?.map((pet) => <li key={pet.id}>{pet.name}</li>);
}
```

The plugin transforms it at build time into:

```ts
// src/App.tsx  (after transformation)
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
import { getPets } from './api/services/PetsService';
import { APIClientContext } from './api/APIClientContext';

const api_pets_getPets = qraftReactAPIClient(getPets, { useQuery }, APIClientContext);

export function PetList() {
  const { data: pets } = api_pets_getPets.useQuery();
  return pets?.map((pet) => <li key={pet.id}>{pet.name}</li>);
}
```

Only `getPets`, `useQuery`, and `APIClientContext` end up in the bundle — everything else is tree-shaken by the bundler.

## Installation

```bash
npm install --save-dev @openapi-qraft/tree-shaking-plugin
```

## Setup

### Vite

```ts
// vite.config.ts
import { qraftTreeShakeVite } from '@openapi-qraft/tree-shaking-plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    qraftTreeShakeVite({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    }),
  ],
});
```

### Rollup

```ts
// rollup.config.mjs
import { qraftTreeShakeRollup } from '@openapi-qraft/tree-shaking-plugin/rollup';

export default {
  plugins: [
    qraftTreeShakeRollup({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    }),
  ],
};
```

### Webpack

```ts
// webpack.config.js
const {
  qraftTreeShakeWebpack,
} = require('@openapi-qraft/tree-shaking-plugin/webpack');

module.exports = {
  plugins: [
    qraftTreeShakeWebpack({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    }),
  ],
};
```

### Rspack

Rspack uses the same plugin entrypoint, but it also needs the resolver package as an optional peer dependency:

```bash
npm install --save-dev @rspack/resolver
```

Make sure your Rspack `resolve` config includes TypeScript-aware resolution:

```ts
resolve: {
  tsConfig: path.resolve(process.cwd(), 'tsconfig.json'),
  // Optional. This is mainly needed when you use explicit import extensions
  // and want .js imports to resolve to .ts/.tsx files.
  extensionAlias: {
    '.js': ['.ts', '.js'],
    '.mjs': ['.mts', '.mjs'],
    '.cjs': ['.cts', '.cjs'],
  },
},
```

```ts
// rspack.config.mjs
import { qraftTreeShakeRspack } from '@openapi-qraft/tree-shaking-plugin/rspack';

export default {
  plugins: [
    qraftTreeShakeRspack({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    }),
  ],
};
```

### esbuild

```ts
import { qraftTreeShakeEsbuild } from '@openapi-qraft/tree-shaking-plugin/esbuild';
import { build } from 'esbuild';

await build({
  plugins: [
    qraftTreeShakeEsbuild({
      createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
    }),
  ],
});
```

## Options

```ts
type QraftTreeShakeOptions = {
  /**
   * Required. Each entry pairs an exported function name with the module
   * specifier that identifies the generated factory. The plugin resolves the
   * specifier through the bundler first, so aliases, workspace packages, bare
   * modules, and relative paths all work when the bundler can resolve them.
   * Re-export barrels that forward the factory to a `.js`-suffixed file are
   * supported.
   */
  createAPIClientFn: Array<{
    name: string;
    module: string;
    context?: string;
    contextModule?: string;
  }>;

  /**
   * Custom resolver, primarily for testing without a live bundler.
   * Called when the bundler's own resolver returns null.
   * Return the absolute path of the resolved file, or null to skip.
   */
  resolve?: (
    specifier: string,
    importer: string
  ) => string | null | Promise<string | null>;

  /** Files to include. Defaults to all JS/TS source files. */
  include?: string | RegExp | Array<string | RegExp>;

  /** Files to exclude. Defaults to /node_modules/. */
  exclude?: string | RegExp | Array<string | RegExp>;

  /** Log skipped files and the reason to stderr. */
  debug?: boolean;
};
```

### `createAPIClientFn`

The central configuration. Each entry tells the plugin which function to treat as an API client factory and where it lives:

```ts
createAPIClientFn: [
  // Relative path to a directory — resolves index.ts automatically
  { name: 'createAPIClient', module: './api' },

  // Explicit file path with extension — resolves the exact file, no guessing
  { name: 'createAPIClient', module: './api/create-api-client.ts' },

  // TypeScript path alias
  { name: 'createAPIClient', module: '@/api/client' },

  // Multiple API client functions from different modules
  { name: 'createPetsClient', module: '@api/pets' },
  { name: 'createStoresClient', module: '@api/stores' },
];
```

`module` is resolved through the bundler first, so path aliases, bare modules,
and monorepo workspace packages all work automatically. If you use a relative
or absolute path, it must be resolvable from the importing file through the
bundler's own resolver.

`context` defaults to `APIClientContext`; `contextModule` can override the context import source when the generated factory does not colocate it with the default file name.

If two imports share the same `name` but resolve to different files, only the one matching a configured entry is transformed. This prevents false positives when an unrelated module happens to export a function with the same name.

## Context client inside a component

A common pattern is to use a context client for rendering (top-level `const api = createAPIClient()`) and a fresh options client inside mutation callbacks to perform cache updates with the current context value. Both are optimized in a single pass:

```ts
// src/PetUpdateForm.tsx  (before)
import { useContext } from 'react';
import { APIClientContext, createAPIClient } from './api';

const api = createAPIClient();

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const apiClient = createAPIClient(apiContext!);

      await apiClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient.pets.getPetById.getQueryData(petParams);
      apiClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      return { prevPet };
    },
  });
}
```

After transformation only the three operations and four callbacks appear in the bundle — the rest of the generated client is gone:

```ts
// src/PetUpdateForm.tsx  (after)
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { cancelQueries } from '@openapi-qraft/react/callbacks/cancelQueries';
import { getQueryData } from '@openapi-qraft/react/callbacks/getQueryData';
import { setQueryData } from '@openapi-qraft/react/callbacks/setQueryData';
import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
import { useContext } from 'react';
import { APIClientContext } from './api';
import { getPetById, updatePet } from './api/services/PetsService';

const api_pets_updatePet = qraftReactAPIClient(
  updatePet,
  { useMutation },
  APIClientContext
);

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api_pets_updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const apiClient_pets_getPetById = qraftReactAPIClient(
        getPetById,
        { cancelQueries, getQueryData, setQueryData },
        apiContext!
      );

      await apiClient_pets_getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient_pets_getPetById.getQueryData(petParams);
      apiClient_pets_getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      return { prevPet };
    },
  });
}
```

Note how the plugin handles both clients differently:

- The outer `createAPIClient()` (no arguments) is hoisted to a module-level constant bound to `APIClientContext`.
- The inner `createAPIClient(apiContext!)` stays inline at the call site, receiving the runtime context value directly.

## What gets transformed

### Named client (created once, used in many places)

```ts
// context client (no arguments — uses React context)
const api = createAPIClient();
api.pets.getPets.useQuery();
api.pets.getPets.getQueryKey({});

// options client (explicit requestFn / queryClient / baseUrl)
const api = createAPIClient({ requestFn, baseUrl: '/v1' });
api.pets.getPets.useQuery();
```

### Inline client (created at the call site)

```ts
createAPIClient(apiContext).pets.getPetById.invalidateQueries();
```

### Direct invocation (no callback name — calls `operationInvokeFn`)

```ts
api.pets.getPets();
```

## What is NOT transformed

- **Exported clients** — `export const api = createAPIClient()` is left intact because the plugin cannot know what callbacks consumers will use.
- **Clients passed as arguments or stored in objects** — only simple `const name = createAPIClient()` declarations are recognized.
- **Non-matching imports** — any import where the specifier does not resolve to a configured `createAPIClientFn` entry is left untouched.
- **Files in `node_modules`** — always skipped.

## Resolver chain

Inside the `transform` hook the plugin resolves import specifiers using the following priority:

1. **Bundler native** (`this.resolve`) — covers Rollup, Vite, Webpack, and Rspack loaders; handles all aliases and workspace packages.
2. **esbuild `build.resolve`** — used when running under esbuild (via `getNativeBuildContext`).
3. **`options.resolve`** — your custom override, useful in unit tests or environments without a bundler.
