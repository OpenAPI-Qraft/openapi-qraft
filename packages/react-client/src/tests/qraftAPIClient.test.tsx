import React, { createContext, ReactNode } from 'react';

import { QraftContext as QraftContextDist } from '@openapi-qraft/react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { vi } from 'vitest';

import type { RequestClient } from '../index.js';
import {
  bodySerializer,
  QraftContextValue,
  request,
  urlSerializer,
} from '../index.js';
import { createAPIClient } from './fixtures/api/index.js';

const qraft = createAPIClient();

const requestClient: RequestClient = async (schema, options) => {
  return request(
    {
      baseUrl: 'https://api.sandbox.monite.com/v1',
    },
    { ...schema, ...options },
    { urlSerializer, bodySerializer }
  );
};

describe('Qraft uses singular Query', () => {
  it('supports useQuery', async () => {
    const { result } = renderHook(
      () =>
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery({
          header: {
            'x-monite-version': '1.0.0',
          },
          path: {
            approval_policy_id: '1',
          },
          query: {
            items_order: ['asc', 'desc'],
          },
        }),
      {
        wrapper: Providers,
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          approval_policy_id: '1',
        },
        query: {
          items_order: ['asc', 'desc'],
        },
      });
    });
  });

  it('supports useQuery with QueryKey', async () => {
    const getApprovalPoliciesIdQueryKey =
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey({
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          approval_policy_id: '1',
        },
        query: {
          items_order: ['asc', 'desc'],
        },
      });

    const { result } = renderHook(
      () =>
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery(
          getApprovalPoliciesIdQueryKey
        ),
      {
        wrapper: Providers,
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(getApprovalPoliciesIdQueryKey[1]);
    });
  });

  it('supports custom context', async () => {
    const QraftCustomContext = createContext<QraftContextValue>(undefined);

    const customQraft = createAPIClient({ context: QraftCustomContext });

    const { result } = renderHook(
      () =>
        customQraft.approvalPolicies.getApprovalPoliciesId.useQuery({
          header: {
            'x-monite-version': '1.0.0',
          },
          path: {
            approval_policy_id: '1',
          },
          query: {
            items_order: ['asc', 'desc'],
          },
        }),
      {
        wrapper: (props) => (
          <QraftCustomContext.Provider
            value={{
              requestClient(schema, options) {
                return request(
                  {
                    baseUrl: 'https://api.sandbox.monite.com/v1',
                  },
                  {
                    headers: { 'x-custom-provider': 'true' },
                    ...schema,
                    ...options,
                  },
                  { urlSerializer, bodySerializer }
                );
              },
            }}
          >
            <Providers {...props} />
          </QraftCustomContext.Provider>
        ),
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        header: {
          'x-monite-version': '1.0.0',
          'x-custom-provider': 'true',
        },
        path: {
          approval_policy_id: '1',
        },
        query: {
          items_order: ['asc', 'desc'],
        },
      });
    });
  });

  it('supports useQuery with optional params', async () => {
    const { result } = renderHook(() => qraft.files.getFileList.useQuery({}), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(undefined);
    });
  });
});

describe('Qraft uses Suspense Query', () => {
  it('supports useSuspenseQuery', async () => {
    const hook = () => {
      try {
        return qraft.approvalPolicies.getApprovalPoliciesId.useSuspenseQuery({
          header: {
            'x-monite-version': '1.0.0',
          },
          path: {
            approval_policy_id: '1',
          },
          query: {
            items_order: ['asc', 'desc'],
          },
        });
      } catch (error) {
        return error as Promise<unknown>;
      }
    };

    const queryClient = new QueryClient();

    const { result: resultWithErrorPromise } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });

    expect(resultWithErrorPromise.current).toBeInstanceOf(Promise); // Suspense throws a promise

    await resultWithErrorPromise.current;

    const { result: resultWithData } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });

    if (resultWithData.current instanceof Promise) {
      throw new Error('Promise should be resolved');
    }

    expect(resultWithData.current.data).toEqual({
      header: {
        'x-monite-version': '1.0.0',
      },
      path: {
        approval_policy_id: '1',
      },
      query: {
        items_order: ['asc', 'desc'],
      },
    });
  });
});

describe('Qraft uses Queries', () => {
  it('supports useQueries with parameters and queryKey', async () => {
    const parameters: typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters =
      {
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          approval_policy_id: '1',
        },
        query: {
          items_order: ['asc', 'desc'],
        },
      };

    const { result } = renderHook(
      () =>
        qraft.approvalPolicies.getApprovalPoliciesId.useQueries({
          queries: [
            {
              parameters,
            },
            {
              queryKey:
                qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey(
                  parameters
                ),
            },
          ],
          combine: (results) => results.map((result) => result.data),
        }),
      {
        wrapper: Providers,
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual([parameters, parameters]);
    });
  });
});

describe('Qraft uses Suspense Queries', () => {
  it('supports useSuspenseQueries', async () => {
    const parameters: typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters =
      {
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          approval_policy_id: '1',
        },
        query: {
          items_order: ['asc', 'desc'],
        },
      };

    const hook = () => {
      try {
        return qraft.approvalPolicies.getApprovalPoliciesId.useSuspenseQueries({
          queries: [
            {
              parameters,
            },
            {
              queryKey:
                qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey(
                  parameters
                ),
            },
          ],
          combine: (results) => results.map((result) => result.data),
        });
      } catch (error) {
        return error as Promise<unknown>;
      }
    };

    const queryClient = new QueryClient();

    const { result: resultWithErrorPromise } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });

    expect(resultWithErrorPromise.current).toBeInstanceOf(Promise); // Suspense throws a promise

    await resultWithErrorPromise.current;

    const { result: resultWithData } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });

    if (resultWithData.current instanceof Promise) {
      throw new Error('Promise should be resolved');
    }

    await waitFor(() => {
      expect(resultWithData.current).toEqual([parameters, parameters]);
    });
  });
});

describe('Qraft uses Infinite Queries', () => {
  it('supports useInfiniteQuery', async () => {
    const { result } = renderHook(
      () =>
        qraft.files.getFiles.useInfiniteQuery(
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
            },
          },
          {
            getNextPageParam: (lastPage, allPages, params) => {
              return {
                query: {
                  page: params.query?.page
                    ? String(Number(params.query.page) + 1)
                    : undefined,
                },
              };
            },
            initialPageParam: {
              query: {
                page: '1',
              },
            },
          }
        ),
      {
        wrapper: Providers,
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        pageParams: [
          {
            query: {
              page: '1',
            },
          },
        ],
        pages: [
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
              page: '1',
            },
          },
        ],
      });
    });
  });

  it('supports useInfiniteQuery with next page', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(
      () =>
        qraft.files.getFiles.useInfiniteQuery(
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
            },
          },
          {
            getNextPageParam: (lastPage, allPages, params) => {
              return {
                query: {
                  page: params.query?.page
                    ? String(Number(params.query.page) + 1)
                    : undefined,
                },
              };
            },
            initialPageParam: {
              query: {
                page: '1',
              },
            },
          }
        ),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    const { result: result2 } = renderHook(
      () => {
        const queryClient = useQueryClient();

        return queryClient.getQueryData(
          qraft.files.getFiles.getInfiniteQueryKey({
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
            },
          })
        );
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    await waitFor(() => {
      expect(result2.current).toEqual({
        pageParams: [
          {
            query: {
              page: '1',
            },
          },
          {
            query: {
              page: '2',
            },
          },
        ],
        pages: [
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
              page: '1',
            },
          },
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
              page: '2',
            },
          },
        ],
      });
    });
  });
});

describe('Qraft uses Suspense Infinite Queries', () => {
  it('supports useSuspenseInfiniteQuery', async () => {
    const hook = () => {
      try {
        return qraft.files.getFiles.useSuspenseInfiniteQuery(
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
            },
          },
          {
            getNextPageParam: (lastPage, allPages, params) => {
              return {
                query: {
                  page: params.query?.page
                    ? String(Number(params.query.page) + 1)
                    : undefined,
                },
              };
            },
            initialPageParam: {
              query: {
                page: '1',
              },
            },
          }
        );
      } catch (error) {
        return error as Promise<unknown>;
      }
    };

    const queryClient = new QueryClient();

    /*const { result } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });*/

    const { result: resultWithErrorPromise } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });

    expect(resultWithErrorPromise.current).toBeInstanceOf(Promise); // Suspense throws a promise

    await resultWithErrorPromise.current;

    const { result: resultWithData } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });

    if (resultWithData.current instanceof Promise) {
      throw new Error('Promise should be resolved');
    }

    expect(resultWithData.current.data).toEqual({
      pageParams: [
        {
          query: {
            page: '1',
          },
        },
      ],
      pages: [
        {
          header: {
            'x-monite-version': '1.0.0',
          },
          query: {
            id__in: ['1', '2'],
            page: '1',
          },
        },
      ],
    });
  });
});

describe('Qraft uses Mutations', () => {
  it('supports useMutation without predefined parameters', async () => {
    const { result } = renderHook(
      () => qraft.entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: Providers,
      }
    );

    act(() => {
      result.current.mutate({
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          entity_id: '1',
        },
        query: {
          referer: 'https://example.com',
        },
        body: {
          verification_document_back: 'back',
          verification_document_front: 'front',
        },
      });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          entity_id: '1',
        },
        query: {
          referer: 'https://example.com',
        },
        body: {
          verification_document_back: 'back',
          verification_document_front: 'front',
        },
      });
    });
  });

  it('supports useMutation with predefined parameters', async () => {
    const { result } = renderHook(
      () =>
        qraft.entities.postEntitiesIdDocuments.useMutation({
          header: {
            'x-monite-version': '1.0.0',
          },
          path: {
            entity_id: '1',
          },
          query: {
            referer: 'https://example.com',
          },
        }),
      {
        wrapper: Providers,
      }
    );

    act(() => {
      result.current.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          entity_id: '1',
        },
        query: {
          referer: 'https://example.com',
        },
        body: {
          verification_document_back: 'back',
          verification_document_front: 'front',
        },
      });
    });
  });

  it('supports useMutation with form data', async () => {
    const { result } = renderHook(() => qraft.files.postFiles.useMutation(), {
      wrapper: Providers,
    });

    act(() => {
      result.current.mutate({
        body: {
          file: new File([''], 'file.png'),
          file_description: 'my file',
        },
      });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        body: {
          file: 'file.png',
          file_description: 'my file',
        },
      });
    });
  });
});

describe('Qraft uses Mutation State', () => {
  const parameters = {
    header: {
      'x-monite-version': '1.0.0',
    },
    path: {
      entity_id: '1',
    },
    query: {
      referer: 'https://example.com',
    },
  } as const;

  it('supports useMutationState with filter', async () => {
    const queryClient = new QueryClient();

    const { result: mutationResult } = renderHook(
      () => qraft.entities.postEntitiesIdDocuments.useMutation(parameters),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      mutationResult.current.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    await waitFor(() => {
      expect(mutationResult.current.data).toBeDefined();
    });

    const { result: mutationStateResult } = renderHook(
      () =>
        qraft.entities.postEntitiesIdDocuments.useMutationState({
          filters: {
            parameters,
          },
        }),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(mutationStateResult.current.at(0)?.data).toEqual({
      body: {
        verification_document_back: 'back',
        verification_document_front: 'front',
      },
      ...parameters,
    });
  });

  it('supports useMutationState with filter and select', async () => {
    const queryClient = new QueryClient();

    const { result: mutationResult } = renderHook(
      () => qraft.entities.postEntitiesIdDocuments.useMutation(parameters),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      mutationResult.current.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    await waitFor(() => {
      expect(mutationResult.current.data).toBeDefined();
    });

    const { result: mutationStateResult } = renderHook(
      () =>
        qraft.entities.postEntitiesIdDocuments.useMutationState({
          filters: {
            parameters,
          },
          select(mutation) {
            return (
              mutation.state.data?.header?.['x-monite-version'] ===
              parameters.header['x-monite-version']
            );
          },
        }),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(mutationStateResult.current.at(0)).toEqual(true);
  });

  it('supports useMutationState with without filter', async () => {
    const queryClient = new QueryClient();

    const { result: mutationResult } = renderHook(
      () => qraft.entities.postEntitiesIdDocuments.useMutation(parameters),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      mutationResult.current.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    await waitFor(() => {
      expect(mutationResult.current.data).toBeDefined();
    });

    const { result: mutationStateResult } = renderHook(
      () => qraft.entities.postEntitiesIdDocuments.useMutationState(),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(mutationStateResult.current.at(0)?.data).toEqual({
      body: {
        verification_document_back: 'back',
        verification_document_front: 'front',
      },
      ...parameters,
    });
  });

  it('supports useMutationState with mutationKey and select', async () => {
    const queryClient = new QueryClient();

    const { result: mutationHookResultToMatch } = renderHook(
      () => qraft.entities.postEntitiesIdDocuments.useMutation(parameters),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      mutationHookResultToMatch.current.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    await waitFor(() => {
      expect(mutationHookResultToMatch.current.data).toBeDefined();
    });

    const { result: mutationStateHookResult } = renderHook(
      () =>
        qraft.entities.postEntitiesIdDocuments.useMutationState({
          filters: {
            mutationKey:
              qraft.entities.postEntitiesIdDocuments.getMutationKey(parameters),
          },
          select(mutation) {
            return (
              mutation.state.data?.header?.['x-monite-version'] ===
              parameters.header['x-monite-version']
            );
          },
        }),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(mutationStateHookResult.current.length).toEqual(1);
    expect(mutationStateHookResult.current.at(0)).toEqual(true);
  });

  it('supports useMutationState with not partial parameters', async () => {
    const queryClient = new QueryClient();

    const { result: mutationHookResultToMatch } = renderHook(
      () => qraft.entities.postEntitiesIdDocuments.useMutation(parameters),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      mutationHookResultToMatch.current.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    await waitFor(() => {
      expect(mutationHookResultToMatch.current.data).toBeDefined();
    });

    const { result: mutationStateResult } = renderHook(
      () =>
        qraft.entities.postEntitiesIdDocuments.useMutationState({
          filters: {
            parameters: {
              header: parameters.header,
            },
          },
          select(mutation) {
            return (
              mutation.state.data?.header?.['x-monite-version'] ===
              parameters.header['x-monite-version']
            );
          },
        }),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(mutationStateResult.current.length).toEqual(1);
    expect(mutationStateResult.current.at(0)).toEqual(true);
  });
});

describe('Qraft uses Query Function', () => {
  it('uses queryFn with `parameters`', async () => {
    const result = await qraft.approvalPolicies.getApprovalPoliciesId.queryFn(
      {
        parameters: {
          header: {
            'x-monite-version': '1.0.0',
          },
          path: {
            approval_policy_id: '1',
          },
          query: {
            items_order: ['asc', 'desc'],
          },
        },
      },
      requestClient
    );

    expect(result).toEqual({
      header: {
        'x-monite-version': '1.0.0',
      },
      path: {
        approval_policy_id: '1',
      },
      query: {
        items_order: ['asc', 'desc'],
      },
    });
  });

  it('uses queryFn with `queryKey`', async () => {
    const result = await qraft.approvalPolicies.getApprovalPoliciesId.queryFn(
      {
        queryKey: [
          {
            url: '/approval_policies/{approval_policy_id}',
            method: 'get',
          },
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            path: {
              approval_policy_id: '1',
            },
            query: {
              items_order: ['asc', 'desc'],
            },
          },
        ],
      },
      requestClient
    );

    expect(result).toEqual({
      header: {
        'x-monite-version': '1.0.0',
      },
      path: {
        approval_policy_id: '1',
      },
      query: {
        items_order: ['asc', 'desc'],
      },
    });
  });
});

describe('Qraft uses mutationFn', () => {
  it('supports mutationFn', async () => {
    const result = await qraft.entities.postEntitiesIdDocuments.mutationFn(
      requestClient,
      {
        parameters: {
          header: {
            'x-monite-version': '1.0.0',
          },
          path: {
            entity_id: '1',
          },
          query: {
            referer: 'https://example.com',
          },
        },
        body: {
          verification_document_back: 'back',
          verification_document_front: 'front',
        },
      }
    );

    await waitFor(() => {
      expect(result).toEqual({
        header: {
          'x-monite-version': '1.0.0',
        },
        path: {
          entity_id: '1',
        },
        query: {
          referer: 'https://example.com',
        },
        body: {
          verification_document_back: 'back',
          verification_document_front: 'front',
        },
      });
    });
  });
});

describe('Qraft uses utils', () => {
  it('returns _def', () => {
    // @ts-ignore
    expect(qraft.counterparts.postCounterpartsIdAddresses._def()).toEqual({
      path: ['counterparts', 'postCounterpartsIdAddresses'],
    });
  });

  it('throws an error when calling an unsupported method ', () => {
    expect(() =>
      // @ts-ignore
      qraft.counterparts.postCounterpartsIdAddresses.unsupportedMethod()
    ).toThrowError(/Function unsupportedMethod is not supported/i);
  });
});

describe('Qraft uses setQueryData', () => {
  it('uses setQueryData & getQueryData', async () => {
    const queryClient = new QueryClient();

    qraft.files.getFiles.setQueryData(
      {
        header: {
          'x-monite-version': '1.0.0',
        },
        query: {
          id__in: ['1', '2'],
        },
      },
      {
        header: {
          'x-monite-version': '1.0.0',
        },
        query: {
          id__in: ['1', '2'],
        },
      },
      queryClient
    );

    expect(
      qraft.files.getFiles.getQueryData(
        {
          header: {
            'x-monite-version': '1.0.0',
          },
          query: {
            id__in: ['1', '2'],
          },
        },
        queryClient
      )
    ).toEqual({
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    });
  });

  it('uses setQueryData & getQueryData with QueryKey', async () => {
    const queryClient = new QueryClient();

    const getFilesQueryKey = qraft.files.getFiles.getQueryKey({
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    });

    const getFilesSetQueryData: typeof qraft.files.getFiles.types.data = {
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    };

    qraft.files.getFiles.setQueryData(
      getFilesQueryKey,
      getFilesSetQueryData,
      queryClient
    );

    expect(
      qraft.files.getFiles.getQueryData(getFilesQueryKey, queryClient)
    ).toEqual(getFilesSetQueryData);

    expect(
      qraft.files.getFiles.getQueryData(getFilesQueryKey[1], queryClient)
    ).toEqual(getFilesSetQueryData);
  });

  it('does not return getQueryData() from Infinite query', async () => {
    const queryClient = new QueryClient();

    const parameters = {
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    };

    qraft.files.getFiles.setInfiniteQueryData(
      parameters,
      {
        pages: [
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
            },
          },
        ],
        pageParams: [
          {
            query: {
              page: '1',
            },
          },
        ],
      },
      queryClient
    );

    expect(
      qraft.files.getFiles.getQueryData(parameters, queryClient)
    ).not.toBeDefined();
  });
});

describe('Qraft uses setInfiniteQueryData', () => {
  it('uses setInfiniteQueryData & getInfiniteQueryData', async () => {
    const queryClient = new QueryClient();

    const parameters: typeof qraft.files.getFiles.types.parameters = {
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    };

    qraft.files.getFiles.setInfiniteQueryData(
      parameters,
      {
        pages: [
          {
            header: {
              'x-monite-version': '1.0.0',
            },
            query: {
              id__in: ['1', '2'],
            },
          },
        ],
        pageParams: [
          {
            query: {
              page: '1',
            },
          },
        ],
      },
      queryClient
    );

    expect(
      qraft.files.getFiles.getInfiniteQueryData(parameters, queryClient)
    ).toEqual({
      pages: [parameters],
      pageParams: [
        {
          query: {
            page: '1',
          },
        },
      ],
    });
  });

  it('does not return getInfiniteQueryData() from non Infinite query', async () => {
    const queryClient = new QueryClient();

    const parameters: typeof qraft.files.getFiles.types.parameters = {
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    };

    qraft.files.getFiles.setQueryData(
      parameters,
      {
        header: {
          'x-monite-version': '1.0.0',
        },
        query: {
          id__in: ['1', '2'],
        },
      },
      queryClient
    );

    expect(
      qraft.files.getFiles.getInfiniteQueryData(parameters, queryClient)
    ).not.toBeDefined();
  });
});

describe('Qraft uses Queries Invalidation', () => {
  const parameters: typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters =
    {
      header: {
        'x-monite-version': '1.0.0',
      },
      path: {
        approval_policy_id: '1',
      },
      query: {
        items_order: ['asc', 'desc'],
      },
    };

  const hook = () =>
    qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters);

  const wrapper = (
    queryClient: QueryClient,
    props: { children: ReactNode }
  ) => <Providers {...props} queryClient={queryClient} />;

  it('supports invalidateQueries by parameters', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    const { result: result_01 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
    });

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        { parameters },
        queryClient
      )
    ).toBeInstanceOf(Promise);

    const { result: result_02 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    expect(result_02.current.isFetching).toBeTruthy();
  });

  it('supports invalidateQueries by queryKey', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    const { result: result_01 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
    });

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        {
          queryKey:
            qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey(
              parameters
            ),
        },
        queryClient
      )
    ).toBeInstanceOf(Promise);

    const { result: result_02 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    expect(result_02.current.isFetching).toBeTruthy();
  });

  it('supports invalidateQueries with options', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    let counter = 0;

    const useMockHook = () => {
      return qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters, {
        retry: false,
        queryFn: () => {
          if (++counter > 1) throw new Error('Invalidation Error');
          return Promise.resolve(parameters);
        },
      });
    };

    const { result: result_01 } = renderHook(useMockHook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
    });

    await expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        { parameters },
        { throwOnError: true },
        queryClient
      )
    ).rejects.toThrowError('Invalidation Error');
  });

  it('requires invalidateQueries queryClient instance', async () => {
    expect(() =>
      // @ts-expect-error
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries()
    ).toThrowError();
  });

  it('check invalidateQueries queryClient instance', async () => {
    expect(() =>
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        {} as never
      )
    ).toThrowError();
  });

  it('supports invalidateQueries without filters and not effect other queries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    const { result: result_01 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    const { result: getFilesResult_01 } = renderHook(
      () => qraft.files.getFileList.useQuery({}),
      {
        wrapper: wrapper.bind(null, queryClient),
      }
    );

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
      expect(getFilesResult_01.current.isSuccess).toBeTruthy();
    });

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        queryClient
      )
    ).toBeInstanceOf(Promise);

    const { result: result_02 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    const { result: getFilesResult_02 } = renderHook(
      () => qraft.files.getFileList.useQuery({}),
      {
        wrapper: wrapper.bind(null, queryClient),
      }
    );

    expect(result_02.current.isFetching).toBeTruthy();
    expect(getFilesResult_02.current.isFetching).toBeFalsy();
  });

  it('supports invalidateQueries for Infinite Query', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    const useInfiniteHook = () =>
      qraft.approvalPolicies.getApprovalPoliciesId.useInfiniteQuery(
        parameters,
        {
          initialPageParam: {},
          getNextPageParam: () => {
            return {};
          },
        }
      );

    const { result: result_01 } = renderHook(useInfiniteHook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
    });

    const counterFn = vi.fn<[{ infinite: boolean | undefined }]>();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        {
          parameters,
          predicate: (query) => {
            counterFn({
              infinite:
                'infinite' in query.queryKey[0]
                  ? query.queryKey[0].infinite
                  : false,
            });
            return true;
          },
        },
        queryClient
      )
    ).toBeInstanceOf(Promise);

    const { result: result_02 } = renderHook(useInfiniteHook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    expect(result_02.current.isFetching).toBeTruthy();

    expect(counterFn.mock.calls).toEqual(
      new Array(counterFn.mock.calls.length).fill([{ infinite: true }])
    );
  });

  it('does not invalidateQueries by not matching queryKey', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    const { result: result_01 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
    });

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        {
          queryKey: qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey({
            ...parameters,
            path: {
              approval_policy_id: `NOT-MATCHING-${parameters.path.approval_policy_id}`,
            },
          }),
        },
        queryClient
      )
    ).toBeInstanceOf(Promise);

    const { result: result_02 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    expect(result_02.current.isFetching).toBeFalsy();
  });

  it('supports invalidateQueries with predicate', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    const filesQueryKey = qraft.files.getFiles.getQueryKey({
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    });

    // Mix with another query to make sure it's not in predicate
    await queryClient.fetchQuery({
      queryKey: filesQueryKey,
      queryFn: () =>
        qraft.files.getFiles.queryFn(
          { queryKey: filesQueryKey },
          requestClient
        ),
    });

    const { result: result_01 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
    });

    const counterFn =
      vi.fn<
        [typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters]
      >();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        {
          queryKey: qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey({
            header: parameters.header,
            path: parameters.path,
          }),
          predicate: (query) => {
            counterFn(query.queryKey[1]);

            return (
              query.queryKey[1].path.approval_policy_id ===
              parameters.path.approval_policy_id
            );
          },
        },
        queryClient
      )
    ).toBeInstanceOf(Promise);

    expect(counterFn.mock.calls).toEqual(
      new Array(counterFn.mock.calls.length).fill([parameters])
    );
  });

  it('supports invalidateQueries with predicate and no queryKey', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    });

    const filesQueryKey = qraft.files.getFiles.getQueryKey({
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    });

    // Mix with another query to make sure it's not in predicate
    await queryClient.fetchQuery({
      queryKey: filesQueryKey,
      queryFn: () =>
        qraft.files.getFiles.queryFn(
          { queryKey: filesQueryKey },
          requestClient
        ),
    });

    const { result: result_01 } = renderHook(hook, {
      wrapper: wrapper.bind(null, queryClient),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
      expect(result_01.current.isFetching).toBeFalsy();
    });

    const counterFn =
      vi.fn<
        [typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters]
      >();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
        {
          predicate: (query) => {
            counterFn(query.queryKey[1]);
            return true;
          },
        },
        queryClient
      )
    ).toBeInstanceOf(Promise);

    expect(counterFn.mock.calls).toEqual(
      new Array(counterFn.mock.calls.length).fill([parameters])
    );
  });
});

function Providers({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  queryClient = React.useState(() => queryClient ?? new QueryClient())[0];

  return (
    <QueryClientProvider client={queryClient}>
      {/* We should use precompiled `QraftContextDist`,
       * because callbacks are imported from `@openapi-qraft` package `/dist` folder
       */}
      <QraftContextDist.Provider value={{ requestClient }}>
        {children}
      </QraftContextDist.Provider>
    </QueryClientProvider>
  );
}
