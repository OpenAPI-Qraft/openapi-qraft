import type { MutationFunctionContext } from '@tanstack/react-query';
import type { components, paths } from './api/index.js';
import { createRequire } from 'node:module';
import { requestFn } from '@openapi-qraft/react';
import * as callbacksIndex from '@openapi-qraft/react/callbacks';
import * as callbacks from '@openapi-qraft/react/callbacks/index';
import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
import {
  createSecureRequestFn,
  QraftSecureRequestFn,
} from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';
import { QueryClient, skipToken } from '@tanstack/react-query';
import { createAPIClient as createAPIClientMjs } from './api/index.js';

const require = createRequire(import.meta.url);
const tanstackQueryPkg = require('@tanstack/react-query/package.json') as {
  version: string;
};
console.log(`Resolved @tanstack/react-query@${tanstackQueryPkg.version}`);

const typescriptPkg = require('typescript/package.json') as {
  version: string;
};
console.log(`Resolved typescript@${typescriptPkg.version}`);

console.log({} satisfies Partial<components>);
console.log({} satisfies Partial<paths>);

if (typeof createAPIClientMjs !== 'undefined') {
  console.log('Client is imported successfully from esm project.');
} else {
  console.error('Client is not imported from esm project.');
  process.exit(1);
}

if (typeof callbacks !== 'undefined') {
  console.log('Callbacks are imported successfully from esm project.');
} else {
  console.error('Callbacks are not imported from esm project.');
  process.exit(1);
}

if (typeof callbacksIndex !== 'undefined') {
  console.log('Callbacks index is imported successfully from esm project.');
} else {
  console.error('Callbacks index is not imported from esm project.');
  process.exit(1);
}

if (typeof useMutation !== 'undefined') {
  console.log('useMutation is imported successfully from esm project.');
} else {
  console.error('useMutation is not imported from esm project.');
  process.exit(1);
}

if (typeof useQuery !== 'undefined') {
  console.log('useQuery is imported successfully from esm project.');
} else {
  console.error('useQuery is not imported from esm project.');
  process.exit(1);
}

if (typeof createSecureRequestFn !== 'undefined') {
  console.log(
    'createSecureRequestFn is imported successfully from esm project.'
  );
} else {
  console.error('createSecureRequestFn is not imported from esm project.');
  process.exit(1);
}

if (typeof QraftSecureRequestFn !== 'undefined') {
  console.log(
    'QraftSecureRequestFn is imported successfully from esm project.'
  );
} else {
  console.error('QraftSecureRequestFn is not imported from esm project.');
  process.exit(1);
}

function useTsCheck() {
  const client = createAPIClientMjs({
    baseUrl: 'https://api.example.com',
    queryClient: new QueryClient(),
    requestFn,
  });

  type _MutationContext = MutationFunctionContext;

  // fetchInfiniteQuery / prefetchInfiniteQuery / ensureInfiniteQueryData: 5.108.1+ requires getNextPageParam even when params are all-optional
  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.fetchInfiniteQuery();
  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.fetchInfiniteQuery({});
  void client.pet.findPetsByStatus.fetchInfiniteQuery({
    initialPageParam: {
      query: {
        status: 'sold',
      },
    },
    getNextPageParam: () => undefined,
    queryFn: ({ pageParam }) => {
      pageParam.query?.status satisfies
        | 'available'
        | 'pending'
        | 'sold'
        | undefined;
      return Promise.resolve([]);
    },
  });
  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.prefetchInfiniteQuery();
  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.prefetchInfiniteQuery({});
  void client.pet.findPetsByStatus.prefetchInfiniteQuery({
    initialPageParam: {
      query: {
        status: 'sold',
      },
    },
    getNextPageParam: () => undefined,
  });
  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.ensureInfiniteQueryData();
  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.ensureInfiniteQueryData({});
  void client.pet.findPetsByStatus.ensureInfiniteQueryData({
    initialPageParam: {
      query: {
        status: 'sold',
      },
    },
    getNextPageParam: () => undefined,
  });

  // query / infiniteQuery (5.108.1+ imperative methods)
  void client.pet.findPetsByStatus.query();
  void (client.pet.findPetsByStatus.query({
    parameters: {
      query: {
        status: 'available',
      },
    },
    staleTime: 'static',
    select: (data) => data.length,
  }) satisfies Promise<number>);
  // @ts-expect-error - parameters and queryKey are mutually exclusive
  void client.pet.findPetsByStatus.query({
    parameters: {
      query: {
        status: 'available',
      },
    },
    queryKey: client.pet.findPetsByStatus.getQueryKey(),
  });

  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.infiniteQuery();
  // @ts-expect-error - getNextPageParam is required in TanStack Query 5.108.1+
  void client.pet.findPetsByStatus.infiniteQuery({});
  void (client.pet.findPetsByStatus.infiniteQuery({
    initialPageParam: {
      query: {
        status: 'sold',
      },
    },
    pages: 2,
    staleTime: 'static',
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      lastPageParam.query?.status satisfies
        | 'available'
        | 'pending'
        | 'sold'
        | undefined;
      return lastPage.length > 0 ? { query: { status: 'pending' } } : undefined;
    },
    select: (data) => data.pages.flat().length,
  }) satisfies Promise<number>);
  void client.pet.findPetsByStatus.infiniteQuery({
    initialPageParam: {
      query: {
        status: 'sold',
      },
    },
    getNextPageParam: () => undefined,
    queryFn: ({ pageParam }) => {
      pageParam.query?.status satisfies
        | 'available'
        | 'pending'
        | 'sold'
        | undefined;
      return Promise.resolve([]);
    },
  });

  // isFetching / useIsFetching: fetchStatus forbidden; parameters and queryKey mutually exclusive
  client.pet.findPetsByStatus.isFetching({ stale: true, parameters: {} });
  client.pet.findPetsByStatus.useIsFetching({ stale: true, parameters: {} });
  // @ts-expect-error - fetchStatus is forbidden on isFetching
  client.pet.findPetsByStatus.isFetching({ fetchStatus: 'fetching' });
  // @ts-expect-error - fetchStatus is forbidden on useIsFetching
  client.pet.findPetsByStatus.useIsFetching({ fetchStatus: 'fetching' });
  client.pet.findPetsByStatus.isFetching({
    parameters: {},
    // @ts-expect-error - parameters and queryKey are mutually exclusive on isFetching
    queryKey: client.pet.findPetsByStatus.getQueryKey(),
  });
  client.pet.findPetsByStatus.useIsFetching({
    parameters: {},
    // @ts-expect-error - parameters and queryKey are mutually exclusive on useIsFetching
    queryKey: client.pet.findPetsByStatus.getQueryKey(),
  });

  // isMutating / useIsMutating / getMutationCache: status forbidden; parameters and mutationKey mutually exclusive
  client.pet.deletePet.isMutating({
    exact: true,
    parameters: { path: { petId: 1 } },
  });
  client.pet.deletePet.useIsMutating({
    exact: true,
    parameters: { path: { petId: 1 } },
  });
  // @ts-expect-error - status is forbidden on isMutating
  client.pet.deletePet.isMutating({ status: 'pending' });
  // @ts-expect-error - status is forbidden on useIsMutating
  client.pet.deletePet.useIsMutating({ status: 'pending' });
  client.pet.deletePet.isMutating({
    parameters: { path: { petId: 1 } },
    // @ts-expect-error - parameters and mutationKey are mutually exclusive on isMutating
    mutationKey: client.pet.deletePet.getMutationKey({ path: { petId: 1 } }),
  });
  client.pet.deletePet.useIsMutating({
    parameters: { path: { petId: 1 } },
    // @ts-expect-error - parameters and mutationKey are mutually exclusive on useIsMutating
    mutationKey: client.pet.deletePet.getMutationKey({ path: { petId: 1 } }),
  });
  client.pet.deletePet.getMutationCache().findAll({ exact: true });

  // useSuspenseQueries: defined data in combine; skipToken disallowed
  client.pet.findPetsByStatus.useSuspenseQueries({
    queries: [{ parameters: {} }],
    combine: (results) => results.map((result) => result.data),
  }) satisfies Array<typeof client.pet.findPetsByStatus.types.data>;
  client.pet.findPetsByStatus.useSuspenseQueries({
    queries: [
      {
        parameters: {},
        // @ts-expect-error - skipToken is not allowed in useSuspenseQueries
        queryFn: skipToken,
      },
      {
        parameters: {},
        // @ts-expect-error - enabled is not allowed in useSuspenseQueries
        enabled: false,
        // @ts-expect-error - throwOnError is not allowed in useSuspenseQueries
        throwOnError: false,
        // @ts-expect-error - placeholderData is not allowed in useSuspenseQueries
        placeholderData: [],
      },
    ],
  });

  // useSuspenseInfiniteQuery: default, select, and 2-arg explicit generic call
  const query = client.pet.findPetsByStatus.useSuspenseInfiniteQuery(
    {},
    {
      initialPageParam: {
        query: {
          status: 'sold',
        },
      },
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
        // @ts-expect-error - should not be never or any
        lastPageParam.query?.status satisfies never;
        lastPageParam.query?.status satisfies
          | undefined
          | 'sold'
          | 'available'
          | 'pending';

        return lastPageParam.query?.status === 'sold'
          ? {
              query: {
                status: 'sold',
              },
            }
          : undefined;
      },
    }
  );

  query.data.pages[0] satisfies typeof client.pet.findPetsByStatus.types.data;
  // @ts-expect-error - should not be never or any
  query.data.pages[0] satisfies never;

  client.pet.findPetsByStatus.useSuspenseInfiniteQuery(
    {},
    {
      initialPageParam: {},
      getNextPageParam: () => undefined,
      select: (data) => data.pages.length,
    }
  ).data satisfies number;

  client.pet.findPetsByStatus.useSuspenseInfiniteQuery<
    typeof client.pet.findPetsByStatus.types.parameters,
    { custom: string }
  >(
    {},
    {
      initialPageParam: {},
      getNextPageParam: (lastPage) => {
        lastPage satisfies { custom: string };
        return undefined;
      },
    }
  ).data.pages satisfies Array<{ custom: string }>;

  // setQueriesData: tuple return type and infinite: true branching
  client.pet.findPetsByStatus.setQueriesData({ parameters: {} }, (prev) => {
    prev satisfies typeof client.pet.findPetsByStatus.types.data | undefined;
    return prev;
  }) satisfies Array<
    [
      queryKey: ReturnType<typeof client.pet.findPetsByStatus.getQueryKey>,
      data: typeof client.pet.findPetsByStatus.types.data | undefined,
    ]
  >;

  client.pet.findPetsByStatus.setQueriesData(
    { parameters: {}, infinite: true },
    (prev) => {
      prev satisfies ReturnType<
        typeof client.pet.findPetsByStatus.getInfiniteQueryData
      >;
      return prev;
    }
  ) satisfies Array<
    [
      queryKey: ReturnType<
        typeof client.pet.findPetsByStatus.getInfiniteQueryKey
      >,
      data: ReturnType<typeof client.pet.findPetsByStatus.getInfiniteQueryData>,
    ]
  >;

  // useQueries: top-level subscribed allowed, per-query subscribed disallowed
  client.pet.findPetsByStatus.useQueries({
    subscribed: false,
    queries: [{ parameters: {} }],
  });
  client.pet.findPetsByStatus.useQueries({
    queries: [
      {
        parameters: {},
        // @ts-expect-error - subscribed is only allowed at top-level in useQueries
        subscribed: false,
      },
    ],
  });
}
