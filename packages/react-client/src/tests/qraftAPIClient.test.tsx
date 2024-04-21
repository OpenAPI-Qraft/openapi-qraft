import React, { createContext, ReactNode, useEffect } from 'react';

import { QraftContext as QraftContextDist } from '@openapi-qraft/react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { vi } from 'vitest';

import type { RequestFnPayload } from '../index.js';
import {
  bodySerializer,
  QraftContextValue,
  requestFn,
  urlSerializer,
} from '../index.js';
import type { OperationSchema } from '../lib/requestFn.js';
import { createAPIClient } from './fixtures/api/index.js';

const qraft = createAPIClient();

const baseUrl = 'https://api.sandbox.monite.com/v1';

const requestClient = async <T,>(
  requestSchema: OperationSchema,
  requestInfo: Omit<RequestFnPayload, 'baseUrl'>
): Promise<T> =>
  requestFn(requestSchema, {
    ...requestInfo,
    baseUrl,
  });

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

    const queryClient = new QueryClient();

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
        wrapper: ({ children }) => {
          useEffect(() => {
            queryClient.mount();
            return () => {
              queryClient.unmount();
            };
          }, [queryClient]);

          return (
            <QraftCustomContext.Provider
              value={{
                queryClient,
                baseUrl: 'https://api.sandbox.monite.com/v1',
                requestFn(schema, info) {
                  return requestFn(
                    schema,
                    {
                      ...info,
                      headers: { 'x-custom-provider': 'true' },
                    },
                    { urlSerializer, bodySerializer }
                  );
                },
              }}
            >
              {children}
            </QraftCustomContext.Provider>
          );
        },
      }
    );

    expect(result.current.status).toEqual('pending');

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
  const parameters: typeof qraft.files.getFiles.types.parameters = {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  };

  it('supports useInfiniteQuery with parameters', async () => {
    const { result } = renderHook(
      () =>
        qraft.files.getFiles.useInfiniteQuery(parameters, {
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
        }),
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

  it('supports useInfiniteQuery with queryKey', async () => {
    const { result } = renderHook(
      () =>
        qraft.files.getFiles.useInfiniteQuery(
          qraft.files.getFiles.getInfiniteQueryKey(parameters),
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

describe('Qraft uses useIsMutating', () => {
  const parameters: typeof qraft.entities.postEntitiesIdDocuments.types.parameters =
    {
      header: {
        'x-monite-version': '1.0.0',
      },
      path: {
        entity_id: '1',
      },
      query: {
        referer: 'https://example.com',
      },
    };

  it('supports useIsMutating with filters', async () => {
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

    const { result: isMutatingResult } = renderHook(
      () =>
        qraft.entities.postEntitiesIdDocuments.useIsMutating({ parameters }),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    await waitFor(() => {
      expect(isMutatingResult.current).toEqual(1);
    });
  });

  it('supports useIsMutating without filters', async () => {
    const queryClient = new QueryClient();

    const { result: mutationResult } = renderHook(
      () => {
        return {
          mutation_01:
            qraft.entities.postEntitiesIdDocuments.useMutation(parameters),
          mutation_02: qraft.entities.postEntitiesIdDocuments.useMutation({
            ...parameters,
            header: {
              'x-monite-version': '2.2.2',
            },
          }),
        };
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      mutationResult.current.mutation_01.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
      mutationResult.current.mutation_02.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    const { result: isMutatingResult } = renderHook(
      () => {
        return {
          noParams: qraft.entities.postEntitiesIdDocuments.useIsMutating(),
          withParams: qraft.entities.postEntitiesIdDocuments.useIsMutating({
            parameters,
          }),
        };
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(isMutatingResult.current.withParams).toEqual(1);
    expect(isMutatingResult.current.noParams).toEqual(2);
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

  /**
   * @deprecated
   */
  it('uses queryFn with `parameters`', async () => {
    const result = await qraft.approvalPolicies.getApprovalPoliciesId.queryFn(
      { parameters },
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

  it('uses Operation Query with `parameters` and without `baseUrl`', async () => {
    const result = await qraft.approvalPolicies.getApprovalPoliciesId(
      { parameters },
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

  it('uses Operation Query with `baseUrl`', async () => {
    const result = await qraft.approvalPolicies.getApprovalPoliciesId(
      { parameters, baseUrl },
      requestFn
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

  it('uses Operation Query with `queryKey`', async () => {
    const result = await qraft.approvalPolicies.getApprovalPoliciesId(
      {
        queryKey: [
          {
            url: '/approval_policies/{approval_policy_id}',
            method: 'get',
            infinite: false,
          },
          parameters,
        ],
      },
      requestClient
    );

    expect(result).toEqual(parameters);
  });

  it('uses fetchQuery with `parameters`', async () => {
    const queryClient = new QueryClient();

    const result = qraft.approvalPolicies.getApprovalPoliciesId.fetchQuery(
      {
        requestFn: requestFn,
        baseUrl: 'https://api.sandbox.monite.com/v1',
        parameters,
      },
      queryClient
    );

    await expect(result).resolves.toEqual(parameters);
  });

  it('uses fetchQuery with `queryKey`', async () => {
    const queryClient = new QueryClient();

    const result = qraft.approvalPolicies.getApprovalPoliciesId.fetchQuery(
      {
        requestFn: requestFn,
        baseUrl: 'https://api.sandbox.monite.com/v1',
        queryKey:
          qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey(parameters),
      },
      queryClient
    );

    await expect(result).resolves.toEqual(parameters);
  });

  it('uses fetchQuery with queryFn', async () => {
    const queryClient = new QueryClient();

    const customResult: typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters =
      {
        ...parameters,
        header: { 'x-monite-version': '2.0.0' },
      };

    const result = qraft.approvalPolicies.getApprovalPoliciesId.fetchQuery(
      {
        queryFn: () => Promise.resolve(customResult),
        queryKey:
          qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey(parameters),
      },
      queryClient
    );

    await expect(result).resolves.toEqual(customResult);
  });

  it('uses fetchQuery with default requestFn set by specific "QueryKey"', async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryDefaults(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey(parameters),
      { queryFn: () => Promise.resolve(parameters) }
    );

    const result = qraft.approvalPolicies.getApprovalPoliciesId.fetchQuery(
      { parameters },
      queryClient
    );

    await expect(result).resolves.toEqual(parameters);
  });

  it('uses fetchQuery with default requestFn set by base "QueryKey"', async () => {
    const queryClient = new QueryClient();

    queryClient.setQueryDefaults(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey(),
      { queryFn: () => Promise.resolve(parameters) }
    );

    const result = qraft.approvalPolicies.getApprovalPoliciesId.fetchQuery(
      { parameters },
      queryClient
    );

    await expect(result).resolves.toEqual(parameters);
  });

  it('uses prefetchQuery with `parameters`', async () => {
    const queryClient = new QueryClient();

    const result = qraft.approvalPolicies.getApprovalPoliciesId.prefetchQuery(
      {
        requestFn: requestFn,
        baseUrl: 'https://api.sandbox.monite.com/v1',
        parameters,
      },
      queryClient
    );

    await expect(result).resolves.toEqual(undefined);

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters,
        queryClient
      )
    ).toEqual(parameters);
  });

  it('uses fetchInfiniteQuery with multiple pages', async () => {
    const queryClient = new QueryClient();

    const result =
      qraft.approvalPolicies.getApprovalPoliciesId.fetchInfiniteQuery(
        {
          requestFn: requestFn,
          baseUrl: 'https://api.sandbox.monite.com/v1',
          parameters,
          initialPageParam: {
            query: {
              items_order: ['asc', 'asc', 'asc'],
            },
          },
          pages: 2,
          getNextPageParam: (lastPage, allPages, params) => {
            return {
              query: {
                items_order: [...(params.query?.items_order || []), 'desc'],
              },
            };
          },
        },
        queryClient
      );

    await expect(result).resolves.toEqual({
      pageParams: [
        {
          query: {
            items_order: ['asc', 'asc', 'asc'],
          },
        },
        {
          query: {
            items_order: ['asc', 'asc', 'asc', 'desc'],
          },
        },
      ],
      pages: [
        {
          ...parameters,
          query: {
            ...parameters.query,
            items_order: ['asc', 'asc', 'asc'],
          },
        },
        {
          ...parameters,
          query: {
            ...parameters.query,
            items_order: ['asc', 'asc', 'asc', 'desc'],
          },
        },
      ],
    });
  });

  it('uses prefetchInfiniteQuery', async () => {
    const queryClient = new QueryClient();

    const result =
      qraft.approvalPolicies.getApprovalPoliciesId.prefetchInfiniteQuery(
        {
          requestFn: requestFn,
          baseUrl: 'https://api.sandbox.monite.com/v1',
          parameters,
          initialPageParam: {
            query: {
              items_order: ['asc', 'asc', 'asc'],
            },
          },
        },
        queryClient
      );

    await expect(result).resolves.toBeUndefined();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getInfiniteQueryData(
        parameters,
        queryClient
      )
    ).toEqual({
      pageParams: [
        {
          query: {
            items_order: ['asc', 'asc', 'asc'],
          },
        },
      ],
      pages: [
        {
          ...parameters,
          query: {
            ...parameters.query,
            items_order: ['asc', 'asc', 'asc'],
          },
        },
      ],
    });
  });
});

describe('Qraft uses mutationFn', () => {
  /**
   * @deprecated
   */
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

  it('supports Operation Mutation without `baseUrl`', async () => {
    const result = await qraft.entities.postEntitiesIdDocuments(
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
      },
      requestClient
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

  it('supports Operation Mutation with `baseUrl`', async () => {
    const result = await qraft.entities.postEntitiesIdDocuments(
      {
        baseUrl,
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
      },
      requestFn
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

describe('Proxy call manipulations', () => {
  it('reads the schema', () => {
    expect(qraft.files.getFiles.schema).toEqual({
      url: '/files',
      method: 'get',
    });
  });

  const parameters: typeof qraft.files.getFiles.types.parameters = {
    header: { 'x-monite-version': '1.0.0' },
    query: { id__in: ['1', '2'] },
  };

  it('uses "apply" on proxy', async () => {
    expect(qraft.files.getFiles.getQueryKey.apply(null, [parameters])).toEqual([
      { ...qraft.files.getFiles.schema, infinite: false },
      parameters,
    ]);
  });

  it('uses "call" on proxy', async () => {
    expect(qraft.files.getFiles.getQueryKey.call(null, parameters)).toEqual([
      { ...qraft.files.getFiles.schema, infinite: false },
      parameters,
    ]);
  });
});

describe('Qraft uses utils', () => {
  it('throws an error when calling an unsupported service ', () => {
    expect(() =>
      // @ts-expect-error - Invalid usage
      qraft.counterparts.postCounterpartsIdAddresses.useQuery()
    ).toThrowError(/Service operation not found/i);
  });

  it('throws an error when calling an unsupported method ', () => {
    expect(() =>
      // @ts-expect-error - Invalid usage of method
      qraft.files.getFileList.unsupportedMethod()
    ).toThrowError(/Function unsupportedMethod is not supported/i);
  });

  it('resolves original proxy in promises ', async () => {
    const getFilesProxy = qraft.files.getFiles;
    expect(getFilesProxy === (await Promise.resolve(getFilesProxy))).toEqual(
      true
    );
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
      { updatedAt: Date.now() },
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
        pages: [parameters],
        pageParams: [parameters],
      },
      queryClient
    );

    expect(
      qraft.files.getFiles.getQueryData(parameters, queryClient)
    ).not.toBeDefined();
  });
});

describe('Qraft uses setQueriesData', () => {
  it('uses setQueriesData with parameters', async () => {
    const queryClient = new QueryClient();

    const parameters: typeof qraft.files.getFiles.types.parameters = {
      header: {
        'x-monite-version': '1.0.0',
      },
      query: {
        id__in: ['1', '2'],
      },
    };

    qraft.files.getFiles.setQueryData(parameters, parameters, queryClient);

    qraft.files.getFiles.setQueriesData(
      { parameters, infinite: false },
      { ...parameters, header: { 'x-monite-version': '2.0.0' } },
      queryClient
    );

    expect(qraft.files.getFiles.getQueryData(parameters, queryClient)).toEqual({
      ...parameters,
      header: { 'x-monite-version': '2.0.0' },
    });
  });
});

describe('Qraft uses getQueriesData', () => {
  const parameters: typeof qraft.files.getFiles.types.parameters = {
    header: {
      'x-monite-version': '1.0.0',
    },
    query: {
      id__in: ['1', '2'],
    },
  };

  it('uses getQueriesData with parameters', async () => {
    const queryClient = new QueryClient();

    qraft.files.getFiles.setQueryData(parameters, parameters, queryClient);

    expect(
      qraft.files.getFiles.getQueriesData(
        { parameters, infinite: false },
        queryClient
      )
    ).toEqual([[qraft.files.getFiles.getQueryKey(parameters), parameters]]);
  });

  it('uses getQueriesData Infinite Queries', async () => {
    const queryClient = new QueryClient();

    qraft.files.getFiles.setInfiniteQueryData(
      parameters,
      {
        pages: [parameters],
        pageParams: [parameters],
      },
      queryClient
    );

    const queries = qraft.files.getFiles.getQueriesData(
      { parameters, infinite: true },
      queryClient
    );

    const [query] = queries;

    expect(query).toBeDefined();

    expect(
      // TS Type quick test
      query?.[1]?.pages?.[0]?.header?.['x-monite-version'] ===
        parameters.header['x-monite-version']
    ).toBeTruthy();

    expect(
      // TS Type quick test
      query?.[1]?.pages?.[0]
    ).toEqual(parameters);
  });
});

describe('Qraft uses setInfiniteQueryData', () => {
  it('uses setInfiniteQueryData & getInfiniteQueryData with parameters', async () => {
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
        pages: [parameters],
        pageParams: [parameters],
      },
      queryClient
    );

    const expectedResult = {
      pages: [parameters],
      pageParams: [parameters],
    };

    expect(
      qraft.files.getFiles.getInfiniteQueryData(parameters, queryClient)
    ).toEqual(expectedResult);

    expect(
      qraft.files.getFiles.getInfiniteQueryData(
        qraft.files.getFiles.getInfiniteQueryKey(parameters),
        queryClient
      )
    ).toEqual(expectedResult);
  });

  it('uses setInfiniteQueryData & getInfiniteQueryData with queryKey', async () => {
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
      qraft.files.getFiles.getInfiniteQueryKey(parameters),
      {
        pages: [parameters],
        pageParams: [parameters],
      },
      queryClient
    );

    const expectedResult = {
      pages: [parameters],
      pageParams: [parameters],
    };

    expect(
      qraft.files.getFiles.getInfiniteQueryData(parameters, queryClient)
    ).toEqual(expectedResult);

    expect(
      qraft.files.getFiles.getInfiniteQueryData(
        qraft.files.getFiles.getInfiniteQueryKey(parameters),
        queryClient
      )
    ).toEqual(expectedResult);
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
        { parameters, infinite: false },
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

  describe('Qraft uses getQueryState', () => {
    it('supports getQueryState by parameters', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnMount: false,
          },
        },
      });

      renderHook(
        () => qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters),
        {
          wrapper: wrapper.bind(null, queryClient),
        }
      );

      await waitFor(() => {
        expect(
          qraft.approvalPolicies.getApprovalPoliciesId.getQueryState(
            parameters,
            queryClient
          )?.status
        ).toEqual('success');
      });
    });

    it('supports getQueryState by parameters and infinite query', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnMount: false,
          },
        },
      });

      renderHook(
        () =>
          qraft.approvalPolicies.getApprovalPoliciesId.useInfiniteQuery(
            parameters,
            {
              initialPageParam: {},
              getNextPageParam: () => {
                return {};
              },
            }
          ),
        {
          wrapper: wrapper.bind(null, queryClient),
        }
      );

      await waitFor(() => {
        expect(
          qraft.approvalPolicies.getApprovalPoliciesId.getInfiniteQueryState(
            parameters,
            queryClient
          )?.status
        ).toEqual('success');
      });
    });
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
        { parameters, infinite: false },
        { throwOnError: true },
        queryClient
      )
    ).rejects.toThrowError('Invalidation Error');
  });

  it('requires invalidateQueries queryClient instance', async () => {
    expect(() =>
      // @ts-expect-error - Invalid usage
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

    const { result: result_01 } = renderHook(
      () => {
        return [
          qraft.approvalPolicies.getApprovalPoliciesId.useInfiniteQuery(
            parameters,
            {
              initialPageParam: {},
              getNextPageParam: () => {
                return {};
              },
            }
          ),
          qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters),
        ] as const;
      },
      {
        wrapper: wrapper.bind(null, queryClient),
      }
    );

    const { result: getFilesResult_01 } = renderHook(
      () => qraft.files.getFileList.useQuery({}),
      {
        wrapper: wrapper.bind(null, queryClient),
      }
    );

    await waitFor(() => {
      expect(result_01.current[0].isSuccess).toBeTruthy();
      expect(result_01.current[0].isFetching).toBeFalsy();
      expect(getFilesResult_01.current.isSuccess).toBeTruthy();
    });

    act(() => {
      expect(
        qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
          queryClient
        )
      ).toBeInstanceOf(Promise);
    });

    const { result: getFilesResult_02 } = renderHook(
      () => qraft.files.getFileList.useQuery({}),
      {
        wrapper: wrapper.bind(null, queryClient),
      }
    );

    expect(
      renderHook(
        () =>
          qraft.approvalPolicies.getApprovalPoliciesId.useInfiniteQuery(
            parameters,
            {
              initialPageParam: {},
              getNextPageParam: () => {
                return {};
              },
            }
          ),
        {
          wrapper: wrapper.bind(null, queryClient),
        }
      ).result.current.isFetching
    ).toBeTruthy();

    expect(
      renderHook(
        () => qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters),
        {
          wrapper: wrapper.bind(null, queryClient),
        }
      ).result.current.isFetching
    ).toBeTruthy();

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
          infinite: true,
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
        qraft.files.getFiles({ queryKey: filesQueryKey }, requestClient),
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
        qraft.files.getFiles({ queryKey: filesQueryKey }, requestClient),
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
          infinite: false,
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

describe('Qraft uses Queries Removal', () => {
  const parameters_1: typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters =
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

  const parameters_2: typeof qraft.approvalPolicies.getApprovalPoliciesId.types.parameters =
    {
      header: {
        'x-monite-version': '1.0.0',
      },
      path: {
        approval_policy_id: '2',
      },
      query: {
        items_order: ['asc', 'desc'],
      },
    };

  it('supports removeQueries by parameters', async () => {
    const queryClient = new QueryClient();

    const { result: result_01 } = renderHook(
      () => {
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters_2);

        return qraft.approvalPolicies.getApprovalPoliciesId.useQuery(
          parameters_1
        );
      },
      {
        wrapper: (props: { children: ReactNode }) => (
          <Providers {...props} queryClient={queryClient} />
        ),
      }
    );

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
    });

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_1,
        queryClient
      )
    ).toBeDefined();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_2,
        queryClient
      )
    ).toBeDefined();

    qraft.approvalPolicies.getApprovalPoliciesId.removeQueries(
      { parameters: parameters_1, infinite: false },
      queryClient
    );

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_1,
        queryClient
      )
    ).not.toBeDefined();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_2,
        queryClient
      )
    ).toBeDefined();
  });

  it('supports removeQueries without parameters', async () => {
    const queryClient = new QueryClient();

    const { result: result_01 } = renderHook(
      () => {
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters_2);

        return qraft.approvalPolicies.getApprovalPoliciesId.useQuery(
          parameters_1
        );
      },
      {
        wrapper: (props: { children: ReactNode }) => (
          <Providers {...props} queryClient={queryClient} />
        ),
      }
    );

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
    });

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_1,
        queryClient
      )
    ).toBeDefined();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_2,
        queryClient
      )
    ).toBeDefined();

    qraft.approvalPolicies.getApprovalPoliciesId.removeQueries(queryClient);

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_1,
        queryClient
      )
    ).not.toBeDefined();

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters_2,
        queryClient
      )
    ).not.toBeDefined();
  });
});

describe('Qraft uses Queries Cancellation', () => {
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

  it('supports cancelQueries by parameters', async () => {
    const queryClient = new QueryClient();

    const counterFn = vi.fn();

    const { result: result_01 } = renderHook(
      () =>
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters, {
          queryFn({ signal }) {
            return new Promise((_, reject) =>
              signal.addEventListener('abort', () => {
                counterFn();
                reject(new Error('cancelQueries succeeded'));
              })
            );
          },
        }),
      {
        wrapper: (props: { children: ReactNode }) => (
          <Providers {...props} queryClient={queryClient} />
        ),
      }
    );

    expect(result_01.current.isError).toBeFalsy();

    await expect(
      qraft.approvalPolicies.getApprovalPoliciesId.cancelQueries(
        { parameters, infinite: false },
        queryClient
      )
    ).resolves.toBeUndefined();

    expect(counterFn.mock.calls.length).toEqual(1);
  });

  it('supports cancelQueries without parameters', async () => {
    const queryClient = new QueryClient();

    const counterFn = vi.fn();

    const { result: result } = renderHook(
      () =>
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters, {
          queryFn({ signal }) {
            return new Promise((_, reject) =>
              signal.addEventListener('abort', () => {
                counterFn();
                reject(new Error('cancelQueries succeeded'));
              })
            );
          },
        }),
      {
        wrapper: (props: { children: ReactNode }) => (
          <Providers {...props} queryClient={queryClient} />
        ),
      }
    );

    expect(result.current.isFetching).toBeTruthy();

    act(() => {
      qraft.approvalPolicies.getApprovalPoliciesId.cancelQueries(queryClient);
    });

    expect(counterFn.mock.calls.length).toEqual(1);
  });
});

describe('Qraft uses Queries Refetch', () => {
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

  it('supports refetchQueries by parameters', async () => {
    const queryClient = new QueryClient();

    const counterFn = vi.fn();

    const hook = () =>
      qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters, {
        queryFn() {
          return new Promise((resolve) => {
            counterFn();
            return resolve(parameters);
          });
        },
      });

    const { result: result_01 } = renderHook(hook, {
      wrapper: (props: { children: ReactNode }) => (
        <Providers {...props} queryClient={queryClient} />
      ),
    });

    await waitFor(() => {
      expect(result_01.current.isSuccess).toBeTruthy();
    });

    expect(counterFn.mock.calls.length).toEqual(1);

    act(() => {
      qraft.approvalPolicies.getApprovalPoliciesId.refetchQueries(
        {
          parameters,
          infinite: false,
        },
        queryClient
      );
    });

    expect(counterFn.mock.calls.length).toEqual(2);
  });
});

describe('Qraft uses Queries Reset', () => {
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

  it('supports resetQueries by parameters', async () => {
    const queryClient = new QueryClient();
    const initialData = {
      ...parameters,
      header: {
        'x-monite-version': 'initial data',
      },
    };

    const { result: result_01 } = renderHook(
      () =>
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery(parameters, {
          initialData,
        }),
      {
        wrapper: (props: { children: ReactNode }) => (
          <Providers {...props} queryClient={queryClient} />
        ),
      }
    );

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters,
        queryClient
      )
    ).toEqual(initialData);

    await waitFor(() => {
      expect(result_01.current.data).toEqual(parameters);
    });

    act(() => {
      qraft.approvalPolicies.getApprovalPoliciesId.resetQueries(
        { parameters, infinite: false },
        queryClient
      );
    });

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.getQueryData(
        parameters,
        queryClient
      )
    ).toEqual(initialData);
  });
});

describe('Qraft uses IsFetching Query', () => {
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

  it('supports isFetching with specific parameters', async () => {
    const queryClient = new QueryClient();

    renderHook(
      () => {
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery({
          ...parameters,
          header: {
            'x-monite-version': '1.2.0',
          },
        });

        return qraft.approvalPolicies.getApprovalPoliciesId.useQuery(
          parameters
        );
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.isFetching(
        { parameters, infinite: false },
        queryClient
      )
    ).toEqual(1);
  });

  it('supports isFetching without specific parameters', async () => {
    const queryClient = new QueryClient();

    renderHook(
      () => {
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery({
          ...parameters,
          header: {
            'x-monite-version': '1.2.0',
          },
        });

        return qraft.approvalPolicies.getApprovalPoliciesId.useQuery(
          parameters
        );
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(
      qraft.approvalPolicies.getApprovalPoliciesId.isFetching(queryClient)
    ).toEqual(2);
  });
});

describe('Qraft uses IsMutating Query', () => {
  const parameters: typeof qraft.entities.postEntitiesIdDocuments.types.parameters =
    {
      header: {
        'x-monite-version': '1.0.0',
      },
      path: {
        entity_id: '1',
      },
      query: {
        referer: 'https://example.com',
      },
    };

  it('supports isMutating with specific parameters', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(
      () => {
        qraft.entities.postEntitiesIdDocuments.useMutation({
          ...parameters,
          header: {
            'x-monite-version': '1.2.0',
          },
        });

        return qraft.entities.postEntitiesIdDocuments.useMutation(parameters);
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      result.current.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    expect(
      qraft.entities.postEntitiesIdDocuments.isMutating(
        { parameters },
        queryClient
      )
    ).toEqual(1);
  });

  it('supports isMutating without specific parameters', async () => {
    const queryClient = new QueryClient();

    const { result: mutationResult } = renderHook(
      () => {
        return {
          mutation_01:
            qraft.entities.postEntitiesIdDocuments.useMutation(parameters),
          mutation_02: qraft.entities.postEntitiesIdDocuments.useMutation({
            ...parameters,
            header: {
              'x-monite-version': '2.2.2',
            },
          }),
        };
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    act(() => {
      mutationResult.current.mutation_01.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
      mutationResult.current.mutation_02.mutate({
        verification_document_back: 'back',
        verification_document_front: 'front',
      });
    });

    expect(
      qraft.entities.postEntitiesIdDocuments.isMutating(queryClient)
    ).toEqual(2);
  });
});

describe('Qraft uses useIsFetching Query', () => {
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

  it('supports useIsFetching with specific parameters', async () => {
    const queryClient = new QueryClient();

    renderHook(
      () => {
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery({
          ...parameters,
          header: {
            'x-monite-version': '1.2.0',
          },
        });

        return qraft.approvalPolicies.getApprovalPoliciesId.useQuery(
          parameters
        );
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    const { result } = renderHook(
      () =>
        qraft.approvalPolicies.getApprovalPoliciesId.useIsFetching({
          parameters,
          infinite: false,
        }),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(result.current).toEqual(1);
  });

  it('supports useIsFetching without specific parameters', async () => {
    const queryClient = new QueryClient();

    renderHook(
      () => {
        qraft.approvalPolicies.getApprovalPoliciesId.useQuery({
          ...parameters,
          header: {
            'x-monite-version': '1.2.0',
          },
        });

        return qraft.approvalPolicies.getApprovalPoliciesId.useQuery(
          parameters
        );
      },
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    const { result } = renderHook(
      () => qraft.approvalPolicies.getApprovalPoliciesId.useIsFetching(),
      {
        wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
      }
    );

    expect(result.current).toEqual(2);
  });
});

describe('Qraft uses getQueryKey', () => {
  it('returns query key with parameters', async () => {
    expect(
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
      })
    ).toEqual([
      {
        url: qraft.approvalPolicies.getApprovalPoliciesId.schema.url,
        method: qraft.approvalPolicies.getApprovalPoliciesId.schema.method,
        infinite: false,
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
    ]);
  });

  it('returns query key without parameters', async () => {
    expect(qraft.approvalPolicies.getApprovalPoliciesId.getQueryKey()).toEqual([
      {
        url: qraft.approvalPolicies.getApprovalPoliciesId.schema.url,
        method: qraft.approvalPolicies.getApprovalPoliciesId.schema.method,
        infinite: false,
      },
      {},
    ]);
  });
});

describe('Qraft uses getMutationKey', () => {
  it('returns mutation key with parameters', async () => {
    expect(
      qraft.entities.postEntitiesIdDocuments.getMutationKey({
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
      })
    ).toEqual([
      {
        url: qraft.entities.postEntitiesIdDocuments.schema.url,
        method: qraft.entities.postEntitiesIdDocuments.schema.method,
      },
      {
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
    ]);
  });

  it('returns mutation key without parameters', async () => {
    expect(qraft.entities.postEntitiesIdDocuments.getMutationKey()).toEqual([
      {
        url: qraft.entities.postEntitiesIdDocuments.schema.url,
        method: qraft.entities.postEntitiesIdDocuments.schema.method,
      },
      {},
    ]);
  });
});

describe('Qraft respects Types', () => {
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

  const queryClient = new QueryClient();

  it('supports infinite QueryKey predicate query filter strict types', () => {
    qraft.approvalPolicies.getApprovalPoliciesId.getQueriesData(
      {
        queryKey: [
          {
            ...qraft.approvalPolicies.getApprovalPoliciesId.schema,
            infinite: true,
          },
          parameters,
        ],
        predicate: (query) => {
          // Will report TS error if 'false'
          const _isTrue = query.queryKey?.[0]?.infinite === true; // todo::improve type checking

          return Boolean(
            // Check if queryKey has correct type
            query.queryKey?.[1]?.query?.items_order?.includes('asc')
          );
        },
      },
      queryClient
    );
  });

  it('supports regular QueryKey predicate query filter strict types', () => {
    qraft.approvalPolicies.getApprovalPoliciesId.getQueriesData(
      {
        queryKey: [
          {
            ...qraft.approvalPolicies.getApprovalPoliciesId.schema,
            infinite: false,
          },
          parameters,
        ],
        predicate: (query) => {
          // Will report TS error if 'true'
          const _isTrue = query.queryKey?.[0]?.infinite === false; // todo::improve type checking

          return Boolean(
            query.queryKey?.[1]?.query?.items_order?.includes('asc')
          );
        },
      },
      queryClient
    );
  });

  it('supports regular parameters predicate query filter strict types', () => {
    qraft.approvalPolicies.getApprovalPoliciesId.getQueriesData(
      {
        parameters,
        infinite: false,
        predicate: (query) => {
          // Will report TS error if 'true'
          const _isTrue = query.queryKey?.[0]?.infinite === false; // todo::improve type checking

          return Boolean(
            query.queryKey?.[1]?.query?.items_order?.includes('asc')
          );
        },
      },
      queryClient
    );
  });

  it('does not supports  predicate without ', () => {
    qraft.approvalPolicies.getApprovalPoliciesId.getQueriesData(
      {
        // @ts-expect-error - `query` should be infinite or regular query, todo::improve type checking
        predicate: (query) => {
          // Will report TS error if 'true'
          const _isInfinite =
            query.queryKey?.[0] && 'infinite' in query.queryKey[0];

          return Boolean(
            query.queryKey?.[1]?.query?.items_order?.includes('asc')
          );
        },
      },
      queryClient
    );
  });
});

describe('Qraft is type-safe on Query Filters', () => {
  it('does not emit an error on the `exact` key', () => {
    const queryClient = new QueryClient();

    qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
      {
        exact: true,
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
      queryClient
    );
  });

  it('emits an error on the `exact` key and partial parameters', () => {
    const queryClient = new QueryClient();

    // Header is required, must emit an error
    qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
      // @ts-expect-error - `header` is required
      {
        exact: true,
        parameters: {
          // header: {
          //   'x-monite-version': '1.0.0',
          // },
          path: {
            approval_policy_id: '1',
          },
          query: {
            items_order: ['asc', 'desc'],
          },
        },
      },
      queryClient
    );
  });

  it('does not emit an error when `exact` is not specified', () => {
    const queryClient = new QueryClient();

    qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
      {
        // Partial parameters
        parameters: {
          query: {
            items_order: ['asc', 'desc'],
          },
        },
      },
      queryClient
    );
  });

  it('does not emit an error when `exact` is `false`', () => {
    const queryClient = new QueryClient();

    qraft.approvalPolicies.getApprovalPoliciesId.invalidateQueries(
      {
        // Partial parameters
        exact: false,
        parameters: {
          query: {
            items_order: ['asc', 'desc'],
          },
        },
      },
      queryClient
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
      <QraftContextDist.Provider
        value={{
          baseUrl: 'https://api.sandbox.monite.com/v1',
          requestFn: requestFn,
        }}
      >
        {children}
      </QraftContextDist.Provider>
    </QueryClientProvider>
  );
}
