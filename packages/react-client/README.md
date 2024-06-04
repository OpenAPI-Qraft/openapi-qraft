# @openapi-qraft/react

`@openapi-qraft/react` is a modular TypeScript client designed to facilitate type-safe API requests in React
applications,
leveraging the power of **TanStack Query v5**. It utilizes a Proxy-based architecture to dynamically generate
hooks with typed parameters, ensuring that your API requests are both type-safe and efficient.

## Features

- **Type-safe API Requests:** Utilize TypeScript for type-safe API requests, reducing runtime errors and improving
  developer experience.
- **Modular Design:** Customize the utility with a set of callbacks to handle API calls according to your project's
  needs.
- **Integration with [TanStack Query v5](https://tanstack.com/query/v5):** Seamlessly integrate with _TanStack Query_
  for handling server state, caching, and data synchronization.
- **Dynamic Proxy-Based Hooks:** Automatically generate React Query hooks for your API endpoints without manual
  boilerplate.

## Installation

First, install the core package for your project:

```bash
npm install @openapi-qraft/react
```

If your project doesn't already include `@tanstack/react-query`, you'll also need to install it. This package is
essential for handling server state in React applications:

```bash
npm install @tanstack/react-query
```

## Getting Started

To get started with `@openapi-qraft/react`, you'll need to set up your client by passing in your API services and a set
of
callbacks to handle various React Query functionalities.

### 1. Generate API Types

Before utilizing `@openapi-qraft/react` to make typed requests, you need to define your API services by generating types
and
schemas from your OpenAPI specification. This ensures that your requests are type-safe and that your development
experience benefits from TypeScript's power. Follow the steps below to generate your API services:

#### Generating TypeScript Definitions

First, generate TypeScript definitions from your OpenAPI schema
using [`openapi-typescript`](https://www.npmjs.com/package/openapi-typescript). This will provide you with
the necessary types for your API requests and responses.

```bash
npx openapi-typescript https://api.dev.monite.com/openapi.json?version=2023-09-01 --output src/api/openapi.d.ts
```

#### Generating Qraft Services

Next, use `@openapi-qraft/cli` to generate the services and typed TanStack Query React Hooks. Ensure to specify the path
to the TypeScript definitions generated in the previous step.

```bash
npx @openapi-qraft/cli https://api.dev.monite.com/openapi.json?version=2023-09-01 --output-dir src/api --openapi-types-import-path '../openapi.d.ts'
```

By completing these steps, you will generate `openapi.d.ts`, which serves as a TypeScript representation of the
specified OpenAPI, _along with a set of services_ in `src/api/services`. These elements are key to enhancing your
development workflow with type
safety and auto-completion features.

### 2. Create API Client

Now, create the API Client to utilize typed React Hooks for your API endpoints.

```ts
// where `./api` is the '--output-dir' path to the services you generated
import { createAPIClient } from './api';

const qraft = createAPIClient();
```

This setup provides you with a powerful, type-safe way to interact with your backend APIs using React Query.
The `createAPIClient` function generates a client that allows you to make API calls with type-checked
parameters, ensuring that your application remains robust and error-free.

### 3. Provide Request Client

Finally, provide the request client to the `QraftContext` to enable the generated hooks to make API requests.

Every request will be handled by `request` function, which can be customized to fit your project's needs.

```tsx
import { useMemo } from 'react';

import { QraftContext, requestFn } from '@openapi-qraft/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// where `./api` is the '--output-dir' path to the services you generated with `@openapi-qraft/cli`
import { createAPIClient } from './api';

// create a client anywhere
const qraft = createAPIClient();

function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <QraftContext.Provider
        value={{
          baseUrl: 'https://api.sandbox.monite.com/v1', // base URL for all requests
          requestFn, // `requestFn(...)` will be invoked for every request
        }}
      >
        {children}
      </QraftContext.Provider>
    </QueryClientProvider>
  );
}

function Example() {
  const { isPending, error, data } =
    qraft.approvalPolicies.getApprovalPoliciesId.useQuery({
      header: {
        'x-monite-version': '2023-09-01',
        'x-monite-entity-id': '3e3e-3e3e-3e3e',
      },
      path: {
        approval_policy_id: '1',
      },
    });

  if (isPending) return 'Loading...';

  if (error) return 'An error has occurred: ' + error.message;

  return <div>Name: {data?.name}</div>;
}

function App() {
  return (
    <Providers>
      <Example />
    </Providers>
  );
}
```

> The Qraft is designed to be as modular as possible, enabling you to integrate your own request client and serializers.
> To ensure optimal tree-shaking, we do not include default serializers in the functions.

## Supported Hooks

- [x] [`useQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useQuery)
- [x] [`useMutation(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useMutation)
- [x] [`useInfiniteQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useInfiniteQuery)
- [x] [`useQueries(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useQueries)
- [x] [`useSuspenseQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useSuspenseQuery)
- [x] [`useSuspenseInfiniteQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useSuspenseInfiniteQuery)
- [x] [`useSuspenseQueries(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useSuspenseQueries)
- [x] [`useIsFetching(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useIsFetching)
- [x] [`useMutationState(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useMutationState)
- [x] [`useIsMutating(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useIsMutating)

## `QueryClient` methods

- [x] [`fetchQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/fetchQuery)
- [x] [`fetchInfiniteQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/fetchInfiniteQuery)
- [x] [`prefetchQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/prefetchQuery)
- [x] [`prefetchInfiniteQuery(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/prefetchInfiniteQuery)
- [x] [`getQueryData(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getQueryData)
- [x] [`getQueriesData(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getQueriesData)
- [x] [`setQueryData(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/setQueryData)
- [x] [`getQueryState(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getQueryState)
- [x] [`setQueriesData(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/setQueriesData)
- [x] [`invalidateQueries(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/invalidateQueries)
- [x] [`refetchQueries(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/refetchQueries)
- [x] [`cancelQueries(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/cancelQueries)
- [x] [`removeQueries(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/removeQueries)
- [x] [`resetQueries(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/resetQueries)
- [x] [`isFetching(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/isFetching)
- [x] [`isMutating(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/isMutating)

## Qraft Utility Functions

- [x] [`getQueryKey(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getQueryKey)
- [x] [`setInfiniteQueryData(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/setInfiniteQueryData)
- [x] [`getInfiniteQueryKey(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getInfiniteQueryKey)
- [x] [`getInfiniteQueryData(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getInfiniteQueryData)
- [x] [`getInfiniteQueryState(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getInfiniteQueryState)
- [x] [`getMutationKey(...)`](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getMutationKey)

## Usage

With the client set up, you can now use the generated Hooks in your React Components to fetch data, execute mutations,
and more.

### [useQuery(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useQuery)

```ts
/**
 * Will execute the request:
 * ###
 * GET /entities?sort=updated_at
 * x-monite-version: 2023-09-01
 **/
const { data, error, isPending } = qraft.entities.getEntities.useQuery({
  header: {
    'x-monite-version': '2023-09-01',
  },
  query: {
    sort: 'updated_at',
  },
});
```

### [useMutation(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useMutation)

#### With predefined parameters

In case you know the query parameters that are needed for mutation, you can preset them. In this case, you must pass
only `body` when calling `mutate()` function:

```ts
const mutation = qraft.entities.postEntitiesIdDocuments.useMutation({
  path: {
    entity_id: '3e3e-3e3e-3e3e',
  },
  header: {
    'x-monite-version': '2023-09-01',
  },
});

/**
 * Will execute the request when call `mutation.mutate(...)`:
 * ###
 * POST /entities/3e3e-3e3e-3e3e/documents
 * x-monite-version: 2023-09-01
 *
 * {"company_tax_id_verification": ["verification-id"]}
 **/
mutation.mutate({
  company_tax_id_verification: ['verification-id'],
});
```

#### Without predefined parameters

It happens that at the time of calling the Mutation Hook, you don't yet know what query parameters to be passed. In this
case,
you will need to pass the _parameters and the body_ of the request when you call `mutate()` function:

```ts
const mutation = qraft.entities.postEntitiesIdDocuments.useMutation();

/**
 * Will execute the request when call `mutation.mutate(...)`:
 * ###
 * POST /entities/3e3e-3e3e-3e3e/documents
 * x-monite-version: 2023-09-01
 *
 * {"company_tax_id_verification": ["verification-id"]}
 **/
mutation.mutate({
  path: {
    entity_id: '3e3e-3e3e-3e3e',
  },
  header: {
    'x-monite-version': '2023-09-01',
  },
  body: {
    company_tax_id_verification: ['verification-id'],
  },
});
```

### [useMutationState(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useMutationState)

Mutation state is a helper hook that provides the current state of a mutation globally.
It could be used to track the status of a mutation in any component, which is useful for showing loading spinners or
disabling buttons.

```ts
const { mutate } = qraft.entities.postEntitiesIdDocuments.useMutation({
  path: {
    entity_id: '3e3e-3e3e-3e3e',
  },
  header: {
    'x-monite-version': '2023-09-01',
  },
});

const mutationState = qraft.entities.postEntitiesIdDocuments
  // You can pass Partial parameters, or even `undefined` to specify filters
  .useMutationState({ path: { entity_id: '3e3e-3e3e-3e3e' } })
  ?.at(0);

useEffect(() => {
  if (!mutationState || mutationState.status === 'iddle') {
    mutate({ company_tax_id_verification: ['verification-id'] });
  }
}, [mutate, mutationState?.status]);
```

### [useInfiniteQuery(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useInfiniteQuery)

#### _Offset-based_

```ts
/**
 * Will execute the initial request:
 * ###
 * GET /posts?limit=10&page=1
 **/
const infiniteQuery = qraft.posts.getPosts.useInfiniteQuery(
  { query: { limit: 10 } },
  {
    // * required by TanStack Query
    getNextPageParam: (lastPage, allPages, lastPageParams) => {
      if (lastPage.length < 10) return; // if less than 10 items, there are no more pages
      return {
        query: {
          page: Number(lastPageParams.query?.page) + 1,
        },
      };
    },
    // * required by TanStack Query
    initialPageParam: {
      query: {
        page: 1, // will be used in initial request
      },
    },
  }
);

// ⬇︎ will execute GET /posts?limit=10&page=2
infiniteQuery.fetchNextPage();
```

#### _Pagination token_ based

If your API uses pagination tokens, the Infinite Queries implementation becomes quite laconically:

```ts
/**
 * Will execute the initial request:
 * ###
 * GET /data_exports
 * x-monite-version: 2023-09-01
 * x-monite-entity-id: 3e3e-3e3e-3e3e
 **/
const infiniteQuery = qraft.dataExports.getDataExports.useInfiniteQuery(
  {
    header: {
      'x-monite-version': '2023-09-01',
      'x-monite-entity-id': '3e3e-3e3e-3e3e',
    },
  },
  {
    // * required by TanStack Query
    initialPageParam: {
      query: { pagination_token: undefined }, // will be used in initial request
    },
    // * required by TanStack Query
    getNextPageParam: (lastPage, allPages, lastPageParam) => ({
      query: { pagination_token: lastPage.next_pagination_token },
    }),
    // * optional
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => ({
      query: { pagination_token: firstPage.prev_pagination_token },
    }),
  }
);

// ⬇︎ will execute GET /data_exports?pagination_token=<NEXT_PAGINATION_TOKEN>
infiniteQuery.fetchNextPage();

// ⬇︎ will execute GET /data_exports?pagination_token=<PREV_PAGINATION_TOKEN>
infiniteQuery.fetchPreviousPage();
```

### [useQueries(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useQueries)

```ts
/**
 * Will execute the request two queries:
 * ###
 * GET /entities/3e3e-3e3e-3e3e
 * x-monite-version: 2023-09-01
 * ###
 * GET /entities/5c5c-5c5c-5c5c
 * x-monite-version: 2023-09-01
 **/
qraft.entities.getEntities.useQueries({
  queries: [
    {
      parameters: {
        header: {
          'x-monite-version': '2023-09-01',
        },
        path: {
          entity_id: '3e3e-3e3e-3e3e',
        },
      },
    },
    {
      parameters: {
        header: {
          'x-monite-version': '2023-09-01',
        },
        path: {
          entity_id: '5c5c-5c5c-5c5c',
        },
      },
    },
  ],
  combine: (results) => results.map((result) => result.data),
});
```

## [`QueryClient`](https://tanstack.com/query/latest/docs/reference/QueryClient) Methods

#### [setQueryData(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/setQueryData)

```ts
qraft.pet.getPetById.setQueryData(
  { path: { petId: 123 } }, // Query Key parameters
  { id: 123, name: 'Rex' }, // Data to set
  queryClient
);
```

### [invalidateQueries(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/invalidateQueries)

[Queries Invalidation 🔗](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) is possible
using `<operation>.invalidateQueries(...)` method.
This method is a wrapper around the `queryClient.invalidateQueries(...)`.

##### Invalidation with _parameters_:

To invalidate queries, with the specified parameters, you can use the `invalidateQueries` method:

```ts
/**
 * Will invalidate the queries with the specified parameters:
 * ###
 * GET /entities/3e3e-3e3e-3e3e
 * x-monite-version: 2023-09-01
 **/
qraft.entities.getEntities.invalidateQueries(
  {
    parameters: {
      header: {
        'x-monite-version': '2023-09-01',
      },
      path: {
        entity_id: '3e3e-3e3e-3e3e',
      },
    },
  },
  queryClient
);
```

#### Invalidation without _parameters_:

To invalidate all queries for a specific endpoint, you can call `invalidateQueries` without any parameters:

```ts
/**
 * Will invalidate the queries matching the specified endpoint:
 * ###
 * GET /entities/3e3e-3e3e-3e3e
 * x-monite-version: 2023-09-01
 * ###
 * GET /entities/4c4c-4c4c-4c4c
 * x-monite-version: 2023-09-01
 **/
qraft.entities.getEntities.invalidateQueries(queryClient);
```

#### Invalidation with _queryKey_:

It could be useful to invalidate queries using `queryKey` directly:

```ts
/**
 * Will invalidate the queries matching the specified endpoint:
 * ###
 * GET /entities/3e3e-3e3e-3e3e
 * x-monite-version: 2023-09-01
 **/
qraft.entities.getEntities.invalidateQueries(
  {
    // `queryKey` is fully typed to `qraft.entities.getEntities`
    queryKey: qraft.entities.getEntities.getQueryKey({
      header: {
        'x-monite-version': '2023-09-01',
      },
      path: {
        entity_id: '3e3e-3e3e-3e3e',
      },
    }),
  },
  queryClient
);
```

#### [Invalidation with predicate: 🔗](https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters)

The `predicate(...)` function will be used as a final filter on all matching queries.

```ts
/**
 * Will invalidate the queries matching the specified endpoint and predicate:
 * ###
 * GET /entities/3e3e-3e3e-3e3e
 * x-monite-version: 2023-09-01
 **/
qraft.entities.getEntities.invalidateQueries(
  {
    parameters, // * optional, or specific parameters, alternatively, you can use `queryKey`
    predicate: (query) => {
      // `infinite`⬇︎ property will preset for Infinite Queries
      if ('infinite' in query.queryKey[0]) return false;

      // `queryKey`⬇︎ is fully typed to `qraft.entities.getEntities` operation parameters
      if (query.queryKey[1].path.entity_id === '4c4c-4c4c-4c4c') return false;

      return true;
    },
  },
  queryClient
);
```

### [fetchQuery(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/fetchQuery)

```ts
/**
 * Will execute the request:
 * ###
 * GET /posts?limit=10
 **/
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

const posts = qraft.posts.getPosts.fetchQuery(
  {
    parameters: { query: { limit: 10 } },
    /**
     * Request function should be provided, otherwise it will throw an error
     * if default `queryFn` is not set previously using
     * `QueryClient.setDefaultOptions(...)` method
     */
    requestFn: requestFn,
    baseUrl: 'https://api.sandbox.monite.com/v1', // must be provided if `requestFn` is set
  },
  queryClient
);
```

### [fetchInfiniteQuery(...) 🔗](https://openapi-qraft.github.io/openapi-qraft/docs/query-client/fetchInfiniteQuery)

```ts
/**
 * Will execute the initial request:
 * ###
 * GET /posts?limit=10&page=1
 * ###
 * And then will execute the next page request:
 * GET /posts?limit=10&page=2
 **/
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

const posts = qraft.posts.getPosts.fetchInfiniteQuery(
  {
    parameters: { query: { limit: 10 } },
    pages: 2, // How many pages to fetch
    initialPageParam: {
      query: { pagination_token: undefined }, // will be used in initial request
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => ({
      query: { pagination_token: lastPage.next_pagination_token },
    }),
    /**
     * Request function should be provided, otherwise it will throw an error
     * if default `queryFn` is not set previously using
     * `QueryClient.setDefaultOptions(...)` method
     */
    requestFn: requestFn,
    baseUrl: 'https://api.sandbox.monite.com/v1', // must be provided if `requestFn` is set
  },
  queryClient
);

console.log(
  posts.pages, // all fetched pages
  posts.pageParams // all page parameters
);
```

### Authorization and Custom Requests

To override any request, you can provide a custom `request` function to the `QraftContext`.

In the example below, we provide a custom `request` function to the `QraftContext` to handle the authorization token
using a custom `fetchToken` async function.

```tsx
import { QraftContext, requestFn } from '@openapi-qraft/react';

import { fetchToken } from './auth';

function QraftProvider({ children }: { children: React.ReactNode }) {
  return (
    <QraftContext.Provider
      value={{
        baseUrl: 'https://api.sandbox.monite.com/v1',
        async requestFn(schema, requestInfo) {
          const token = await fetchToken();

          return requestFn(schema, {
            ...requestInfo,
            /** Specify your predefined Headers **/
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        },
      }}
    >
      {children}
    </QraftContext.Provider>
  );
}
```

## Contributing

Contributions are welcome! If you have suggestions or want to improve `@openapi-qraft/react`, please feel free to submit
a
pull request or open an issue.

## License

`@openapi-qraft/react` is licensed under the MIT License. See the LICENSE file for more details.
