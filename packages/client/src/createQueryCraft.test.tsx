import React, { ReactNode } from 'react';

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { createQueryCraft } from './createQueryCraft.js';
import { getInfiniteQueryKey } from './lib/callbacks/getInfiniteQueryKey.js';
import { getMutationKey } from './lib/callbacks/getMutationKey.js';
import { getQueryKey } from './lib/callbacks/getQueryKey.js';
import { mutationFn } from './lib/callbacks/mutationFn.js';
import { queryFn } from './lib/callbacks/queryFn.js';
import { setInfiniteQueryData } from './lib/callbacks/setInfiniteQueryData.js';
import { setQueryData } from './lib/callbacks/setQueryData.js';
import { useInfiniteQuery } from './lib/callbacks/useInfiniteQuery.js';
import { useMutation } from './lib/callbacks/useMutation.js';
import { useQuery } from './lib/callbacks/useQuery.js';
import { getRequestBody, getRequestUrl, request } from './lib/core/request.js';
import { services, Services } from './mocks/fixtures/api/index.js';
import { QueryCraftContext, RequestClient } from './QueryCraftContext.js';

const callbacks = {
  queryFn,
  useQuery,
  useInfiniteQuery,
  getQueryKey,
  mutationFn,
  useMutation,
  getMutationKey,
  setQueryData,
  setInfiniteQueryData,
  getInfiniteQueryKey,
} as const;

const qraft = createQueryCraft<Services, typeof callbacks>(services, callbacks);

const client: RequestClient = async (schema, options) => {
  return request(
    {
      baseUrl: 'https://api.sandbox.monite.com/v1',
      version: '2023-06-04',
    },
    {
      ...schema,
      ...options,
    },
    { getRequestUrl, getRequestBody }
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

  it('supports useQuery with optional params', async () => {
    const { result } = renderHook(() => qraft.files.getFileList.useQuery(), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(undefined);
    });
  });

  it('returns queryKey', async () => {
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
      expect(result.current.queryKey).toEqual([
        {
          url: '/approval_policies/{approval_policy_id}',
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
          qraft.files.getFiles.getQueryKey({
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
});

describe('Qraft uses Query Function', () => {
  it('uses queryFn', async () => {
    const result = await qraft.approvalPolicies.getApprovalPoliciesId.queryFn(
      client,
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
      }
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
  it('uses setQueryData', async () => {
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
      queryClient.getQueryData(
        qraft.files.getFiles.getQueryKey({
          header: {
            'x-monite-version': '1.0.0',
          },
          query: {
            id__in: ['1', '2'],
          },
        })
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
  it('uses setInfiniteQueryData', async () => {
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
      queryClient.getQueryData(
        qraft.files.getFiles.getInfiniteQueryKey({
          header: {
            'x-monite-version': '1.0.0',
          },
          query: {
            id__in: ['1', '2'],
          },
        })
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
      <QueryCraftContext.Provider value={{ client }}>
        {children}
      </QueryCraftContext.Provider>
    </QueryClientProvider>
  );
}
