import { QueryClient } from '@tanstack/react-query';
import { requestFn } from '../index.js';
import { createAPIClient } from './fixtures/api/index.js';

/**
 * Tests for correct parameter usage
 */

// Create client with only QueryClient
const createBasicClient = () =>
  createAPIClient({
    queryClient: new QueryClient(),
  });

// Create client with a full set of parameters
const createFullClient = () =>
  createAPIClient({
    queryClient: new QueryClient(),
    requestFn: requestFn,
    baseUrl: 'https://example.com',
  });

// 1. Inline parameters
{
  const qraft = createBasicClient();

  // 1.1 Regular inline parameters
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

  // 1.2 Const inline parameters (as const)
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

// 2. External mutable parameters
{
  const qraft = createFullClient();

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
  qraft.files.getFiles.useSuspenseInfiniteQuery(parameters, {
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

// 3. External const parameters (as const)
{
  const qraft = createFullClient();

  const parameters = {
    query: { id__in: ['1', '2'] },
    header: {
      'x-monite-version': 'current',
    },
  } as const;

  const data = { query: { id__in: ['1'] } } as const;
  const pageParam = {
    query: { id__in: ['1'] },
  } as const;

  // 3.1 getFiles methods
  qraft.files.getFiles.setQueryData(parameters, data);
  qraft.files.getFiles.setInfiniteQueryData(parameters, (pages) => ({
    pages: [...(pages?.pages ?? []), data],
    pageParams: [...(pages?.pageParams ?? []), {}],
  }));
  qraft.files.getFiles.getQueryData(parameters);
  qraft.files.getFiles.useQuery(parameters);
  qraft.files.getFiles.useInfiniteQuery(parameters, {
    initialPageParam: pageParam,
    getNextPageParam: () => pageParam,
    getPreviousPageParam: () => pageParam,
  });
  qraft.files.getFiles.useSuspenseInfiniteQuery(parameters, {
    initialPageParam: pageParam,
    getNextPageParam: () => pageParam,
    getPreviousPageParam: () => pageParam,
  });
  void qraft.files.getFiles.fetchQuery({ parameters });
  void qraft.files.getFiles.fetchInfiniteQuery({
    parameters,
    initialPageParam: pageParam,
    getNextPageParam: () => pageParam,
  });
  void qraft.files.getFiles({ parameters });

  // 3.2 findAll methods
  void qraft.files.findAll.fetchQuery({ parameters });
  void qraft.files.findAll.fetchQuery();
  void qraft.files.findAll.fetchQuery({});

  qraft.files.findAll.useQuery();
  qraft.files.findAll.useInfiniteQuery(parameters, {
    initialPageParam: pageParam,
    getNextPageParam: () => pageParam,
    getPreviousPageParam: () => pageParam,
  });
  qraft.files.findAll.useSuspenseInfiniteQuery(parameters, {
    initialPageParam: pageParam,
    getNextPageParam: () => pageParam,
    getPreviousPageParam: () => pageParam,
  });
  void qraft.files.findAll.fetchInfiniteQuery({
    pages: 1,
    parameters,
    getNextPageParam: () => pageParam,
  });
  void qraft.files.findAll.fetchInfiniteQuery({
    pages: 1,
    getNextPageParam: () => pageParam,
  });
  void qraft.files.findAll.fetchInfiniteQuery({});
  void qraft.files.findAll.fetchInfiniteQuery();
}

// 4. Tests for useMutation
{
  const qraft = createFullClient();

  const parameters = { query: { all: true } } as const;
  qraft.files.deleteFiles.useMutation(parameters);
  void qraft.files.deleteFiles({ parameters });
}

/**
 * Tests for incorrect usage (type checking)
 */

// 5. Incorrect parameters
{
  const qraft = createBasicClient();

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

  const parameters = {
    query: { id__in: ['1', '2'] },
    header: { 'x-monite-version': '1.0.0' },
  } as const;

  // @ts-expect-error - OK, incorrect usage (not existing method)
  qraft.files.getFiles.useQuery(parameters);
  // @ts-expect-error - OK, incorrect usage (not existing method)
  qraft.files.getFiles.useInfiniteQuery(parameters, {
    initialPageParam: {},
    getNextPageParam: () => undefined,
  });
  // @ts-expect-error - OK, incorrect usage (not existing method)
  void qraft.files.getFiles.fetchQuery({ parameters });
  // @ts-expect-error - OK, incorrect usage (not existing method)
  void qraft.files.getFiles.fetchInfiniteQuery({
    parameters,
    initialPageParam: {},
    getNextPageParam: () => undefined,
  });
}

// 6. Incorrect method usage with parameters
{
  const qraft = createFullClient();

  const parameters = {
    query: { id__in: ['1', '2'] },
    header: { 'x-monite-version': '1.0.0' },
  } as const;

  // @ts-expect-error - OK, incorrect usage
  void qraft.files.getFiles.fetchInfiniteQuery({ parameters });
  // @ts-expect-error - OK, incorrect usage
  void qraft.files.getFiles.fetchInfiniteQuery({
    // initialPageParam: parameters, // OK, incorrect usage
    parameters,
    getNextPageParam: () => parameters,
  });

  // @ts-expect-error - OK, incorrect usage (not existing method)
  qraft.files.getFiles.useQuery();
  // @ts-expect-error - OK, incorrect usage (not existing method)
  qraft.files.getFiles.useInfiniteQuery();
  // @ts-expect-error - OK, incorrect usage (not existing method)
  void qraft.files.getFiles.fetchQuery({});
  // @ts-expect-error - OK, incorrect usage (not existing method)
  void qraft.files.getFiles.fetchInfiniteQuery({});
}

// 7. Additional incorrect usage checks
{
  const qraft = createFullClient();

  const parameters = { query: { id__in: ['1', '2'] } } as const;

  // @ts-expect-error - OK, incorrect usage
  void qraft.files.findAll.fetchInfiniteQuery({
    // getNextPageParam: () => parameters, // OK, incorrect usage
    pages: 1,
    parameters,
  });
}
