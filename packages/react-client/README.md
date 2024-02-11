# @openapi-qraft/react

`@openapi-qraft/react` is a modular TypeScript client designed to facilitate type-safe API requests in React
applications,
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
npm install @openapi-qraft/react@beta
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

Next, use `@openapi-qraft/cli` to generate the services and typed Tanstack Query React Hooks. Ensure to specify the path to the
TypeScript definitions generated in the previous step.

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
/** '--output-dir' path to your generated services **/
import { createAPIClient } from './api';

const qraft = createAPIClient();
```

This setup provides you with a powerful, type-safe way to interact with your backend APIs using React Query.
The `createAPIClient` function generates a client that allows you to make API calls with type-checked
parameters, ensuring that your application remains robust and error-free.

### 3. Provide Request Client

Finally, provide the request client to the `QraftContext` to enable the generated hooks to make API requests.

Every request will be handled by `requestClient`, which can be customized to fit your project's needs.

```tsx
import { useMemo } from 'react';

import { request, bodySerializer, urlSerializer } from '@openapi-qraft/react';
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
                  /** Specify your predefined header here **/
                  // Authorization: 'Bearer token',
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

function Example() {
  const { isPending, error, data } =
    qract.approvalPolicies.getApprovalPoliciesId.useQuery({
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

## Usage

With the client set up, you can now use the generated Hooks in your React Components to fetch data, execute mutations,
and more.

### [useQuery 🔗](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)

```ts
/**
 * `qraft.approvalPolicies.getApprovalPoliciesId.useQuery(...)` will execute:
 *
 * GET /approval_policies/1?items_order=asc
 * x-monite-version: '2023-09-01'
 *
 * Used Open API: GET /approval_policies/{approval_policy_id}
 **/
const { data, error, isPending } =
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

### [useMutation 🔗](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation)

#### With predefined parameters

In case you know the query parameters that are needed for mutation, you can preset them. In this case, you must pass
only `body` when calling `mutate()` function:

```ts
const mutation = qraft.entities.postEntitiesIdDocuments.useMutation({
  path: {
    entity_id: '1',
  },
});

/**
 * `mutation.mutate(...)` will execute:
 *
 * POST /entities/1/documents
 * Content-Type: application/json
 * {"document_title": "Agreement of Intent"}
 *
 * Used Open API: POST /entities/{entity_id}/documents
 **/
mutation.mutate({
  document_title: 'Agreement of Intent',
});
```

#### Without predefined parameters

It happens that at the time of calling the Mutation Hook, you don't yet know what query parameters to be passed. In this
case,
you will need to pass the _parameters and the body_ of the request when you call `mutate()` function:

```ts
const mutation = qraft.entities.postEntitiesIdDocuments.useMutation();

/**
 * `mutation.mutate(...)` will execute:
 *
 * POST /entities/1/documents
 * Content-Type: application/json
 * {"document_title": "Agreement of Intent"}
 *
 * Used Open API: POST /entities/{entity_id}/documents
 **/

mutation.mutate({
  path: {
    entity_id: '1',
  },
  body: {
    document_title: 'Agreement of Intent',
  },
});
```

### [useInfiniteQuery 🔗](https://tanstack.com/query/latest/docs/framework/react/reference/useInfiniteQuery)

`todo::Add Description`

```ts
/**
 * `qraft.files.getFiles.useInfiniteQuery(...)` will execute:
 *
 * GET /files?search=Agreements&limit=10&page=1
 * Content-Type: application/json
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

Contributions are welcome! If you have suggestions or want to improve `@openapi-qraft/react`, please feel free to submit
a
pull request or open an issue.

## License

`@openapi-qraft/react` is licensed under the MIT License. See the LICENSE file for more details.
