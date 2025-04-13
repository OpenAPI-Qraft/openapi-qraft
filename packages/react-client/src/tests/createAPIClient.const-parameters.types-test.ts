import { QueryClient } from '@tanstack/query-core';
import { requestFn } from '../index.js';
import { createAPIClient } from './fixtures/api/index.js';

const qraft = createAPIClient({
  queryClient: new QueryClient(),
  requestFn: requestFn,
  baseUrl: 'https://example.com',
});

{
  // Normal inline parameters
  qraft.files.getFiles.setQueryData(
    {
      query: { id__in: ['1', '2'] },
      header: {
        'x-monite-version': 'current',
      },
    },
    { query: { id__in: ['1'] } }
  );

  qraft.files.getFiles.getQueryData({
    query: { id__in: ['1'] },
    header: {
      'x-monite-version': 'current',
    },
  });
}

{
  // Const inline parameters
  qraft.files.getFiles.setQueryData(
    {
      query: { id__in: ['1', '2'] },
      header: {
        'x-monite-version': 'current',
      },
    } as const,
    { query: { id__in: ['1'] } } as const
  );

  qraft.files.getFiles.getQueryData({
    query: { id__in: ['1'] },
    header: {
      'x-monite-version': 'current',
    },
  } as const);
}

{
  // External mutable parameters
  const parameters = {
    query: { id__in: ['1', '2'] },
    header: {
      'x-monite-version': 'current',
    },
  };

  const data = { query: { id__in: ['1'] } };

  qraft.files.getFiles.setQueryData(parameters, data);
  qraft.files.getFiles.setInfiniteQueryData(parameters, (pages) => ({
    pages: [...(pages?.pages ?? []), data],
    pageParams: [...(pages?.pageParams ?? []), {}],
  }));
  qraft.files.getFiles.getQueryData(parameters);
  qraft.files.getFiles.useQuery(parameters);
  qraft.files.getFiles.useInfiniteQuery(parameters, {
    initialPageParam: {},
    getNextPageParam: () => undefined,
  });
  void qraft.files.getFiles.fetchQuery({ parameters });
  void qraft.files.getFiles.fetchInfiniteQuery({
    parameters,
    initialPageParam: {},
    getNextPageParam: () => undefined,
  });
  void qraft.files.getFiles({ parameters });
}

{
  // External const parameters
  const parameters = {
    query: { id__in: ['1', '2'] },
    header: {
      'x-monite-version': 'current',
    },
  } as const;

  const data = { query: { id__in: ['1'] } } as const;

  qraft.files.getFiles.setQueryData(parameters, data);
  qraft.files.getFiles.setInfiniteQueryData(parameters, (pages) => ({
    pages: [...(pages?.pages ?? []), data],
    pageParams: [...(pages?.pageParams ?? []), {}],
  }));
  qraft.files.getFiles.getQueryData(parameters);
  qraft.files.getFiles.useQuery(parameters);
  qraft.files.getFiles.useInfiniteQuery(parameters, {
    initialPageParam: {},
    getNextPageParam: () => undefined,
  });
  void qraft.files.getFiles.fetchQuery({ parameters });
  void qraft.files.getFiles.fetchInfiniteQuery({
    parameters,
    initialPageParam: {},
    getNextPageParam: () => undefined,
  });
  void qraft.files.getFiles({ parameters });
}

{
  // External const parameters for useMutation
  const parameters = { query: { all: true } } as const;
  qraft.files.deleteFiles.useMutation(parameters);
  void qraft.files.deleteFiles({ parameters });
}

{
  // Incorrect usage
  qraft.files.getFiles.setQueryData(
    {
      // @ts-expect-error - OK, incorrect usage
      query: { id__in: [1, 2] },
      header: {
        // @ts-expect-error - OK, incorrect usage
        'x-monite-version': true,
      },
    },
    { query: { id__in: ['1'] } }
  );
  qraft.files.getFiles.getQueryData({
    // @ts-expect-error - OK, incorrect usage
    query: { id__in: [1, 2] },
    header: {
      // @ts-expect-error - OK, incorrect usage
      'x-monite-version': true,
    },
  });
  qraft.files.getFiles.setQueryData(
    {
      query: { id__in: ['1', '2'] },
      header: {
        'x-monite-version': 'current',
      },
    } as const,
    {
      query: {
        // @ts-expect-error - OK, incorrect usage
        id__in: [1],
      },
    } as const
  );
}
