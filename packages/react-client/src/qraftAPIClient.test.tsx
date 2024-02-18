import React, { createContext, ReactNode } from 'react';

import { QraftContext as QraftContextDist } from '@openapi-qraft/react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { createAPIClient } from './fixtures/api/index.js';
import { bodySerializer, request, urlSerializer } from './lib/request.js';
import { QraftContextValue } from './QraftContext.js';
import type { RequestClient } from './RequestClient.js';

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

describe('Qraft uses Queries', () => {
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

describe('Qraft uses Suspense Queries', () => {
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

    const { result } = renderHook(hook, {
      wrapper: (props) => <Providers {...props} queryClient={queryClient} />,
    });

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

describe('Qraft uses Query Function', () => {
  it('uses queryFn', async () => {
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
});

describe('Qraft uses setInfiniteQueryData', () => {
  it('uses setInfiniteQueryData & getInfiniteQueryData', async () => {
    const queryClient = new QueryClient();

    qraft.files.getFiles.setInfiniteQueryData(
      {
        header: {
          'x-monite-version': '1.0.0',
        },
        query: {
          id__in: ['1', '2'],
        },
      },
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
      qraft.files.getFiles.getInfiniteQueryData(
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
    });
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
