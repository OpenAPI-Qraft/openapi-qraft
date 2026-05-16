# @openapi-qraft/tree-shaking-plugin

Tree-shaking plugin for OpenAPI Qraft API clients. Use it with Vite, Rollup, Webpack, Rspack, or esbuild through [unplugin](https://github.com/unjs/unplugin).

## Install

```bash
npm install --save-dev @openapi-qraft/tree-shaking-plugin
```

## What gets optimized

There is no special runtime magic here. `qraftReactAPIClient` and `qraftAPIClient` are ordinary runtime functions, and the plugin rewrites generated full-client usage into smaller tree-shake-friendly calls.

The rewritten code stays type-safe because the plugin preserves the generated types while narrowing the emitted runtime imports.

The configuration below shows a single `apis.pets` entry in Redocly so it is clear where these client families live. It shows both generated client families this README refers to: a full Node.js client and a full React client. Both are generated with complete coverage so the plugin can tree-shake what is actually used.

```yaml
apis:
  pets:
    root: ./openapi.json
    x-openapi-qraft:
      plugin:
        tanstack-query-react: true
        openapi-typescript: true
      output-dir: src/api
      create-api-client-fn:
        # Generated client factories are emitted from modules like ./create-node-api-client and ./create-react-api-client
        createNodeAPIClient:
          filename: create-node-api-client
          services: all
          callbacks: all
        createReactAPIClient:
          filename: create-react-api-client
          context: APIClientContext
          services: all
          callbacks: all
```

## Supported client modes

- `kind: 'clientFactory'` for factory imports such as `createReactAPIClient` and the resulting `reactAPIClient`.

  ```ts
  import { createReactAPIClient } from './api';

  const reactAPIClient = createReactAPIClient();

  export function PetList() {
    return reactAPIClient.pets.getPets.useQuery();
  }
  ```

- `kind: 'precreatedClient'` for clients that are already created and exported from another module, for example `export const nodeAPIClient = createNodeAPIClient(createNodeAPIClientOptions())`.

  ```ts filename=src/client.ts
  // src/client.ts
  import { createNodeAPIClient } from './api';
  import { createNodeAPIClientOptions } from './client-options';

  export const nodeAPIClient = createNodeAPIClient(
    createNodeAPIClientOptions()
  );
  ```

  ```ts filename=src/App.tsx
  // src/App.tsx
  import { nodeAPIClient } from './client';

  export function PetList() {
    return nodeAPIClient.pets.getPets.useQuery();
  }
  ```

## Setup

The setup snippets below use this `entrypoints` value:

```ts
const entrypoints = [
  {
    kind: 'clientFactory',
    factory: { exportName: 'createReactAPIClient', moduleSpecifier: './api' },
    reactContext: {
      exportName: 'APIClientContext',
      moduleSpecifier: './api/APIClientContext',
    },
  },
];
```

### Vite

```ts
import { qraftTreeShakeVite } from '@openapi-qraft/tree-shaking-plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [qraftTreeShakeVite({ entrypoints })],
});
```

### Rollup

```ts
import { qraftTreeShakeRollup } from '@openapi-qraft/tree-shaking-plugin/rollup';

export default {
  plugins: [qraftTreeShakeRollup({ entrypoints })],
};
```

### Webpack

```ts
const {
  qraftTreeShakeWebpack,
} = require('@openapi-qraft/tree-shaking-plugin/webpack');

module.exports = {
  plugins: [qraftTreeShakeWebpack({ entrypoints })],
};
```

### Rspack

Rspack uses the same plugin entrypoint, but it also needs the resolver package as an optional peer dependency:

```bash
npm install --save-dev @rspack/resolver
```

If you use TypeScript path aliases or explicit `.js` imports, make sure your Rspack `resolve` config is set up accordingly:

```ts
resolve: {
  tsConfig: path.resolve(process.cwd(), 'tsconfig.json'),
  extensionAlias: {
    '.js': ['.ts', '.js'],
    '.mjs': ['.mts', '.mjs'],
    '.cjs': ['.cts', '.cjs'],
  },
},
```

```ts
import { qraftTreeShakeRspack } from '@openapi-qraft/tree-shaking-plugin/rspack';

export default {
  plugins: [qraftTreeShakeRspack({ entrypoints })],
};
```

### esbuild

```ts
import { qraftTreeShakeEsbuild } from '@openapi-qraft/tree-shaking-plugin/esbuild';
import { build } from 'esbuild';

await build({
  plugins: [qraftTreeShakeEsbuild({ entrypoints })],
});
```

## Configuration

### `entrypoints`

`entrypoints` describes the generated client surfaces that the plugin is allowed to optimize. Every target uses named exports and bundler-resolvable module specifiers, either relative to the bundler's resolution root or alias/third-party imports.

```ts
qraftTreeShakeVite({
  entrypoints: [
    {
      kind: 'clientFactory',
      factory: { exportName: 'createReactAPIClient', moduleSpecifier: './api' },
      reactContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: './api/APIClientContext',
      },
    },
    {
      kind: 'precreatedClient',
      client: { exportName: 'nodeAPIClient', moduleSpecifier: './client' },
      factory: {
        exportName: 'createNodeAPIClient',
        moduleSpecifier: './create-node-api-client',
      },
      optionsFactory: {
        exportName: 'createNodeAPIClientOptions',
        moduleSpecifier: './client-options',
      },
    },
  ],
});
```

#### `kind: 'clientFactory'`

Use this when your application imports a factory such as `createReactAPIClient` and creates clients at the call site.

**⬇️ Input**

```ts
import { createReactAPIClient } from './api';

const reactAPIClient = createReactAPIClient();

export function App() {
  return reactAPIClient.pets.getPets.useQuery();
}
```

**⬆️ Output**

```ts
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
import { APIClientContext } from './api/APIClientContext';
import { getPets } from './api/services/PetsService';

const reactAPIClient_pets_getPets = qraftReactAPIClient(
  getPets,
  { useQuery },
  APIClientContext
);

export function App() {
  return reactAPIClient_pets_getPets.useQuery();
}
```

Configuration:

```ts
entrypoints: [
  {
    kind: 'clientFactory',
    factory: { exportName: 'createReactAPIClient', moduleSpecifier: './api' },
    reactContext: {
      exportName: 'APIClientContext',
      moduleSpecifier: './api/APIClientContext',
    },
  },
];
```

`factory` points at the generated client factory export. `reactContext` is optional; use it when zero-argument React clients should keep context-backed runtime semantics. Omit `reactContext` for explicit-options clients such as `createNodeAPIClient(options)`.

### Module access

Normal Vite, Rollup, webpack, Rspack, and esbuild integrations do not need any extra configuration. The active bundler adapter resolves and loads generated modules for the tree-shaking transform.

Use `moduleAccess.load` only when a build relies on virtual modules or a custom source provider that the bundler adapter cannot load directly:

```ts
qraftTreeShakeVite({
  entrypoints: [
    {
      kind: 'clientFactory',
      factory: {
        exportName: 'createAPIClient',
        moduleSpecifier: 'virtual:qraft-api',
      },
    },
  ],
  moduleAccess: {
    load: async (resolvedId) => {
      return resolvedId === 'virtual:qraft-api'
        ? "export { createAPIClient } from './actual-api';"
        : null;
    },
  },
});
```

If a resolved module cannot be loaded through module access for a configured transform candidate, `diagnostics` controls the result: `'error'` throws, `'warn'` prints a warning and skips the candidate, and `'off'` skips it silently.

#### `kind: 'precreatedClient'`

Use this when the client is already created and exported from a module.

**⬇️ Input**

**File Name** `src/client.ts`

```ts
import { createNodeAPIClient } from './api';
import { createNodeAPIClientOptions } from './client-options';

export const nodeAPIClient = createNodeAPIClient(createNodeAPIClientOptions());
```

**File Name** `src/client-options.ts`

```ts
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';

export const clientOptions = {
  requestFn,
  queryClient: new QueryClient(),
  baseUrl: 'https://api.example.com/v1',
} as const;

export function createNodeAPIClientOptions() {
  return clientOptions;
}
```

**File Name** `src/App.tsx`

```ts
import { nodeAPIClient } from './client';

export function App() {
  return nodeAPIClient.pets.getPets.useQuery();
}
```

**⬆️ Output**

**File Name** `src/App.tsx`

```ts
import { qraftAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
import { getPets } from './api/services/PetsService';
import { createNodeAPIClientOptions } from './client-options';

const nodeAPIClient_pets_getPets = qraftAPIClient(
  getPets,
  { useQuery },
  createNodeAPIClientOptions()
);

export function App() {
  return nodeAPIClient_pets_getPets.useQuery();
}
```

Configuration:

```ts
entrypoints: [
  {
    kind: 'precreatedClient',
    client: { exportName: 'nodeAPIClient', moduleSpecifier: './client' },
    factory: {
      exportName: 'createNodeAPIClient',
      moduleSpecifier: './create-node-api-client',
    },
    optionsFactory: {
      exportName: 'createNodeAPIClientOptions',
      moduleSpecifier: './client-options',
    },
  },
];
```

`client` points at the exported precreated client. `factory` points at the generated factory used to create that client. `optionsFactory` points at the function the plugin should call when it emits smaller `qraftAPIClient(...)` helpers.

> Top-level generated clients still tree-shake. Bundlers can drop any generated operation that is never used in a chunk.

`createNodeAPIClientOptions()` should return the same object each time. Keeping `queryClient` in a shared top-level `clientOptions` object makes that explicit and keeps the `QueryClient` instance stable.

### Other options

- `resolve` - custom resolver used as a fallback when the bundler cannot resolve a specifier.
- `include` / `exclude` - filter which files are transformed.
- `diagnostics` - controls unresolved transform candidates:
  - `'error'` (default) throws when configured source looks transformable but generated metadata or operation ownership cannot be proven.
  - `'warn'` prints a warning and skips the candidate.
  - `'off'` skips unresolved candidates silently.
- `debug` - temporary backward-compatible legacy logging for skipped files and skip reasons.

## Transformation Examples

### Context-based factories

Use this when the client is created in component code and a nested callback creates a fresh client from the current context.

The snippets below show only the files that matter in this flow, so the before/after shape stays easy to follow.

**⬇️ Input**

**File Name** `src/App.tsx`

```ts
import { useContext } from 'react';
import { APIClientContext, createReactAPIClient } from './api';

const reactAPIClient = createReactAPIClient();

function PetUpdateForm({ petId }: { petId: number }) {
  const apiClientOptions = useContext(APIClientContext);
  const petParams = { path: { petId } };

  reactAPIClient.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const miniQraft = createReactAPIClient(apiClientOptions);
      await miniQraft.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = miniQraft.pets.getPetById.getQueryData(petParams);
      miniQraft.pets.getPetById.setQueryData(petParams, (oldData) => ({
        ...oldData,
        ...variables.body,
      }));
      return { prevPet };
    },
    async onSuccess(updatedPet) {
      const miniQraft = createReactAPIClient(apiClientOptions);
      miniQraft.pets.getPetById.setQueryData(petParams, updatedPet);
      await miniQraft.pets.findPetsByStatus.invalidateQueries();
    },
  });
}
```

**⬆️ Output**

The `reactAPIClient_pets_*` bindings keep the client family and operation name together, which makes the rewrite easy to trace.

**File Name** `src/App.tsx`

```ts
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { cancelQueries } from '@openapi-qraft/react/callbacks/cancelQueries';
import { getQueryData } from '@openapi-qraft/react/callbacks/getQueryData';
import { invalidateQueries } from '@openapi-qraft/react/callbacks/invalidateQueries';
import { setQueryData } from '@openapi-qraft/react/callbacks/setQueryData';
import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
import { useContext } from 'react';
import { APIClientContext } from './api';
import {
  findPetsByStatus,
  getPetById,
  updatePet,
} from './api/services/PetsService';

const reactAPIClient_pets_updatePet = qraftReactAPIClient(
  updatePet,
  { useMutation },
  APIClientContext
);

function PetUpdateForm({ petId }: { petId: number }) {
  const apiClientOptions = useContext(APIClientContext);
  const petParams = { path: { petId } };

  reactAPIClient_pets_updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const reactAPIClient_pets_getPetById = qraftReactAPIClient(
        getPetById,
        { cancelQueries, getQueryData, setQueryData },
        apiClientOptions
      );
      await reactAPIClient_pets_getPetById.cancelQueries({
        parameters: petParams,
      });
      const prevPet = reactAPIClient_pets_getPetById.getQueryData(petParams);
      reactAPIClient_pets_getPetById.setQueryData(petParams, (oldData) => ({
        ...oldData,
        ...variables.body,
      }));
      return { prevPet };
    },
    async onSuccess(updatedPet) {
      const reactAPIClient_pets_getPetById = qraftReactAPIClient(
        getPetById,
        { setQueryData },
        apiClientOptions
      );
      const reactAPIClient_pets_findPetsByStatus = qraftReactAPIClient(
        findPetsByStatus,
        { invalidateQueries },
        apiClientOptions
      );
      reactAPIClient_pets_getPetById.setQueryData(petParams, updatedPet);
      await reactAPIClient_pets_findPetsByStatus.invalidateQueries();
    },
  });
}
```

### Precreated clients

Use this when the client is exported from `client.ts` and the options factory lives in a separate module.

The snippets below show the minimum files involved in the precreated flow.

**⬇️ Input**

**File Name** `src/client.ts`

```ts
import { createNodeAPIClientOptions } from './client-options';
import { createNodeAPIClient } from './create-node-api-client';

export const nodeAPIClient = createNodeAPIClient(createNodeAPIClientOptions());
```

**File Name** `src/client-options.ts`

```ts
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function createNodeAPIClientOptions() {
  return {
    requestFn,
    queryClient,
    baseUrl: 'https://api.example.com/v1',
  };
}
```

**File Name** `src/App.tsx`

```ts
import { nodeAPIClient } from './client';

const petParams = { path: { petId: 1 } };

export function App() {
  nodeAPIClient.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      await nodeAPIClient.pets.getPetById.cancelQueries({
        parameters: petParams,
      });
      const prevPet = nodeAPIClient.pets.getPetById.getQueryData(petParams);
      nodeAPIClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));
      return { prevPet };
    },
    async onSuccess(updatedPet) {
      nodeAPIClient.pets.getPetById.setQueryData(petParams, updatedPet);
      await nodeAPIClient.pets.findPetsByStatus.invalidateQueries();
    },
  });
}
```

**⬆️ Output**

The `nodeAPIClient_pets_*` bindings keep the client family and operation name together, which makes the rewrite easy to trace.

**File Name** `src/App.tsx`

```ts
import { qraftAPIClient } from '@openapi-qraft/react';
import { cancelQueries } from '@openapi-qraft/react/callbacks/cancelQueries';
import { getQueryData } from '@openapi-qraft/react/callbacks/getQueryData';
import { invalidateQueries } from '@openapi-qraft/react/callbacks/invalidateQueries';
import { setQueryData } from '@openapi-qraft/react/callbacks/setQueryData';
import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
import {
  findPetsByStatus,
  getPetById,
  updatePet,
} from './api/services/PetsService';
import { createNodeAPIClientOptions } from './client-options';

const nodeAPIClient_pets_updatePet = qraftAPIClient(
  updatePet,
  { useMutation },
  createNodeAPIClientOptions()
);
const nodeAPIClient_pets_getPetById = qraftAPIClient(
  getPetById,
  { cancelQueries, getQueryData, setQueryData },
  createNodeAPIClientOptions()
);
const nodeAPIClient_pets_findPetsByStatus = qraftAPIClient(
  findPetsByStatus,
  { invalidateQueries },
  createNodeAPIClientOptions()
);

const petParams = { path: { petId: 1 } };

export function App() {
  nodeAPIClient_pets_updatePet.useMutation(undefined, {
    async onMutate(variables) {
      await nodeAPIClient_pets_getPetById.cancelQueries({
        parameters: petParams,
      });
      const prevPet = nodeAPIClient_pets_getPetById.getQueryData(petParams);
      nodeAPIClient_pets_getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));
      return { prevPet };
    },
    async onSuccess(updatedPet) {
      nodeAPIClient_pets_getPetById.setQueryData(petParams, updatedPet);
      await nodeAPIClient_pets_findPetsByStatus.invalidateQueries();
    },
  });
}
```

> **Why top-level clients?**
>
> The operation-specific clients are hoisted to the module top level so the bundler can see every referenced operation up front.
> **This does not block tree-shaking.** If a given chunk does not use one of these generated clients, normal bundler analysis can still drop it.
