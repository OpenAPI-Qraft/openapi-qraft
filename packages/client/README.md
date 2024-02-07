# @radist2s/qraft

`@radist2s/qraft` is a modular TypeScript client designed to facilitate type-safe API requests in React applications,
leveraging the power of Tanstack Query. It utilizes a Proxy-based architecture to dynamically generate Tanstack Query
hooks with typed parameters, ensuring that your API requests are both type-safe and efficient.

## Features

- **Type-safe API Requests:** Utilize TypeScript for type-safe API requests, reducing runtime errors and improving
  developer experience.
- **Modular Design:** Customize the utility with a set of callbacks to handle API calls according to your project's
  needs.
- **Integration with [Tanstack Query](https://tanstack.com/query/v5):** Seamlessly integrate with _Tanstack Query_ for
  handling server state, caching, and data synchronization.
- **Dynamic Proxy-Based Hooks:** Automatically generate React Query hooks for your API endpoints without manual
  boilerplate.

## Installation

```bash
npm install @radist2s/qraft
```

## Getting Started

To get started with `@radist2s/qraft`, you'll need to set up your client by passing in your API services and a set of
callbacks to handle various React Query functionalities.

## 1. Define Your API Services

Before utilizing `@radist2s/qraft` to make typed requests, you need to define your API services by generating types and
schemas from your OpenAPI Specification. This ensures that your requests are type-safe and that your development
experience benefits from TypeScript's power. Follow the steps below to generate your API services:

### Generating TypeScript Definitions

First, generate TypeScript definitions from your OpenAPI schema using `openapi-typescript`. This will provide you with
the necessary types for your API requests and responses.

```bash
npx openapi-typescript https://api.dev.monite.com/openapi.json?version=2023-09-01 --output src/api/openapi.d.ts
```

### Generating Qraft Services

Next, use `@radist2s/qraft-cli` to generate the services and typed React Query hooks. Ensure to specify the path to the
TypeScript definitions generated in the previous step. This creates a seamless integration between your OpenAPI schema
and React Query, providing you with type-safe hooks for data fetching and mutation operations.

```bash
npx @radist2s/qraft-cli https://api.dev.monite.com/openapi.json?version=2023-09-01 --output-dir src/api --schema-types-path ../openapi.d.ts
```

By completing these steps, you will generate `openapi.d.ts`, which serves as a TypeScript representation of the
specified OpenAPI, _along with a set of services_ in `src/api/services`. These elements are key to enhancing your
development workflow with type
safety and auto-completion features.

### 2. Set Up Callbacks

Define callbacks to handle queries, mutations, and more. These callbacks integrate directly with Tanstack Query's hooks
and utilities.

```ts
// callbacks.ts
import { getInfiniteQueryData } from '@radist2s/qraft/callbacks/getInfiniteQueryData';
import { getInfiniteQueryKey } from '@radist2s/qraft/callbacks/getInfiniteQueryKey';
import { getMutationKey } from '@radist2s/qraft/callbacks/getMutationKey';
import { getQueryData } from '@radist2s/qraft/callbacks/getQueryData';
import { getQueryKey } from '@radist2s/qraft/callbacks/getQueryKey';
import { mutationFn } from '@radist2s/qraft/callbacks/mutationFn';
import { queryFn } from '@radist2s/qraft/callbacks/queryFn';
import { setInfiniteQueryData } from '@radist2s/qraft/callbacks/setInfiniteQueryData';
import { setQueryData } from '@radist2s/qraft/callbacks/setQueryData';
import { useInfiniteQuery } from '@radist2s/qraft/callbacks/useInfiniteQuery';
import { useMutation } from '@radist2s/qraft/callbacks/useMutation';
import { useQuery } from '@radist2s/qraft/callbacks/useQuery';

export const callbacks = {
  getInfiniteQueryData,
  getInfiniteQueryKey,
  getMutationKey,
  getQueryData,
  getQueryKey,
  mutationFn,
  queryFn,
  setInfiniteQueryData,
  setQueryData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} as const;
```

### 3. API Client stitching

Now, create the Qraft client by providing it with your services and callbacks. This step dynamically generates typed
hooks for your API endpoints.

```ts
import { qraftAPIClient } from '@radist2s/qraft';

import { services, Services } from './api';
// '--output-dir' path to your generated services
import { callbacks } from './callbacks';

// just created 'callbacks.ts'

const qraft = qraftAPIClient<Services, typeof callbacks>(services, callbacks);
```

Define callbacks to handle queries, mutations, and more. These callbacks integrate directly with Tanstack Query's React
Hooks and utilities.

This setup provides you with a powerful, type-safe way to interact with your backend APIs using React Query.
The `qraftAPIClient` function generates a client (`qraft`) that allows you to make API calls with type-checked
parameters, ensuring that your application remains robust and error-free.

### 4. Provide Request Client

Finally, provide the request client to the `QraftContext` to enable the generated hooks to make API requests.

Every request will be handled by `requestClient`, which can be customized to fit your project's needs.

```tsx
import { useMemo } from 'react';

import { request, bodySerializer, urlSerializer } from '@radist2s/qraft';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <QraftContext.Provider
        value={{
          /**
           * Request client will be invoked for every request
           */
          requestClient(schema, options) {
            return request(
              {
                baseUrl: 'https://api.sandbox.monite.com/v1',
              },
              {
                ...schema,
                ...options,
                headers: {
                  Authorization: 'Bearer token', // Specify your authorization token here
                },
              },
              { urlSerializer, bodySerializer } // Serializers for request body and URL
            );
          },
        }}
      >
        {children}
      </QraftContext.Provider>
    </QueryClientProvider>
  );
}
```

> The Qraft is designed to be as modular as possible, enabling you to integrate your own request client and serializers.
> To ensure optimal tree-shaking, we do not include default serializers in the functions.

## Usage

With the client set up, you can now use the generated hooks in your React components to fetch data, execute mutations,
and more.

### useQuery

```ts
/**
 * GET /approval_policies/1?items_order=asc
 * x-monite-version: '2023-09-01'
 *
 * Used Open API: GET /approval_policies/{approval_policy_id}
 **/
const { data, error, isLoading } =
  qraft.approvalPolicies.getApprovalPoliciesId.useQuery({
    header: {
      'x-monite-version': '2023-09-01',
    },
    path: {
      approval_policy_id: '1',
    },
    query: {
      items_order: 'asc',
    },
  });
```

### useMutation

#### Without predefined parameters

It happens that at the time of calling the Mutation Hook, you don't yet know what query parameters to be passed. In this case,
you will need to pass the _parameters and the body_ of the request when you call `mutate()` function:

```ts
/**
 * POST /entities/1/documents
 * Content-Type: application/json
 * {"document_title": "Agreement of Intent"}
 *
 * Used Open API: POST /entities/{entity_id}/documents
 **/
const mutation = qraft.entities.postEntitiesIdDocuments.useMutation();

mutation.mutate({
  path: {
    entity_id: '1',
  },
  body: {
    document_title: 'Agreement of Intent',
  },
});
```

#### With predefined parameters

In case you know the query parameters that are needed for mutation, you can preset them. In this case, you must pass
only `body` when calling `mutate()` function:

```ts
/**
 * POST /entities/1/documents
 * Content-Type: application/json
 * {"document_title": "Agreement of Intent"}
 *
 * Used Open API: POST /entities/{entity_id}/documents
 **/
const mutation = qraft.entities.postEntitiesIdDocuments.useMutation({
  path: {
    entity_id: '1',
  },
});

mutation.mutate({
  document_title: 'Agreement of Intent',
});
```

### useInfiniteQuery

`todo::Add Description`

```ts
/**
 * GET /files?search=Agreements&limit=10&page=1
 * Content-Type: application/json
 * {"document_title": "Agreement of Intent"}
 *
 * Used Open API: GET /files
 **/
const infiniteQuery = qraft.files.getFiles.useInfiniteQuery(
  {
    query: {
      search: 'Agreements',
      limit: 10,
    },
  },
  {
    getNextPageParam: (lastPage, allPages, lastPageParams) => {
      if (lastPage.length < 10) return;
      return {
        query: {
          page: lastPageParams.query?.page
            ? lastPageParams.query.page + 1
            : undefined,
        },
      };
    },
    initialPageParam: {
      query: {
        page: 1,
      },
    },
  }
);

infiniteQuery.fetchNextPage(); // will execute GET /files?search=Agreements&limit=10&page=2
```

## Contributing

Contributions are welcome! If you have suggestions or want to improve `@radist2s/qraft`, please feel free to submit a
pull request or open an issue.

## License

`@radist2s/qraft` is licensed under the MIT License. See the LICENSE file for more details.
