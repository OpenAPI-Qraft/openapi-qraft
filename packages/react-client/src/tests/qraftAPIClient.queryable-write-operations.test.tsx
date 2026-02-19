import type { paths } from './fixtures/api/index.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { requestFn } from '../index.js';
import { createAPIClient } from './fixtures/queryable-write-operations-api/index.js';

const baseUrl = 'https://api.sandbox.monite.com/v1';

describe('Queryable write operations', () => {
  it('queries writable operations with a specific body for useQuery', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const { result } = renderHook(
      () =>
        qraft.approvalPolicies.patchApprovalPoliciesId.useQuery({
          header: {
            'x-monite-version': '1',
            'x-monite-entity-id': '2',
          },
          path: {
            approval_policy_id: '2',
          },
          body: {
            name: 'New Name',
            description: 'New Description',
          },
        }),
      {
        wrapper: (props) => (
          <QueryClientProvider client={queryClient} {...props} />
        ),
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        id: '2',
        name: 'New Name',
        description: 'New Description',
      });
    });
  });

  it('queries writable operations with a specific body for useQueries', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const parameters = {
      header: {
        'x-monite-version': '1',
        'x-monite-entity-id': '2',
      },
      path: {
        approval_policy_id: '2',
      },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    };

    const queryKeyParameters = {
      ...parameters,
      body: {
        name: 'Another Name',
        description: 'Another Description',
      },
    };

    const queryKey =
      qraft.approvalPolicies.patchApprovalPoliciesId.getQueryKey(
        queryKeyParameters
      );

    const { result } = renderHook(
      () =>
        qraft.approvalPolicies.patchApprovalPoliciesId.useQueries({
          queries: [{ parameters }, { queryKey }],
        }),
      {
        wrapper: (props) => (
          <QueryClientProvider client={queryClient} {...props} />
        ),
      }
    );

    await waitFor(() => {
      expect(result.current[0]?.data).toEqual({
        id: '2',
        name: 'New Name',
        description: 'New Description',
      });
      expect(result.current[1]?.data).toEqual({
        id: '2',
        name: 'Another Name',
        description: 'Another Description',
      });
    });
  });

  it('queries writable operations with a specific body for useSuspenseQueries', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const parameters = {
      header: {
        'x-monite-version': '1',
        'x-monite-entity-id': '2',
      },
      path: {
        approval_policy_id: '2',
      },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    };

    const queryKeyParameters = {
      ...parameters,
      body: {
        name: 'Another Name',
        description: 'Another Description',
      },
    };

    const queryKey =
      qraft.approvalPolicies.patchApprovalPoliciesId.getQueryKey(
        queryKeyParameters
      );

    const hook = () => {
      try {
        return qraft.approvalPolicies.patchApprovalPoliciesId.useSuspenseQueries(
          {
            queries: [{ parameters }, { queryKey }],
          }
        );
      } catch (error) {
        return error as Promise<void>;
      }
    };

    const { result: resultWithErrorPromise } = renderHook(hook, {
      wrapper: (props) => (
        <QueryClientProvider client={queryClient} {...props} />
      ),
    });

    expect(resultWithErrorPromise.current).toBeInstanceOf(Promise);
    await resultWithErrorPromise.current;

    const { result: resultWithData } = renderHook(hook, {
      wrapper: (props) => (
        <QueryClientProvider client={queryClient} {...props} />
      ),
    });

    if (resultWithData.current instanceof Promise) {
      throw new Error('Promise should be resolved');
    }

    expect(resultWithData.current[0].data).toEqual({
      id: '2',
      name: 'New Name',
      description: 'New Description',
    });
    expect(resultWithData.current[1].data).toEqual({
      id: '2',
      name: 'Another Name',
      description: 'Another Description',
    });
  });

  it('queries writable operations with a specific body for fetchQuery', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const result =
      await qraft.approvalPolicies.patchApprovalPoliciesId.fetchQuery({
        parameters: {
          header: {
            'x-monite-version': '1',
            'x-monite-entity-id': '2',
          },
          path: {
            approval_policy_id: '2',
          },
          body: {
            name: 'New Name',
            description: 'New Description',
          },
        },
      });

    await waitFor(() => {
      expect(result).toEqual({
        id: '2',
        name: 'New Name',
        description: 'New Description',
      });
    });
  });

  it('queries writable operations with a specific body for fetchInfiniteQuery', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const result =
      await qraft.approvalPolicies.patchApprovalPoliciesId.fetchInfiniteQuery({
        parameters: {
          header: {
            'x-monite-version': '1',
            'x-monite-entity-id': '2',
          },
          path: {
            approval_policy_id: '2',
          },
          body: {
            name: 'New Name',
            description: 'New Description',
          },
        },
        initialPageParam: {
          body: {
            trigger: true,
          },
        },
      });

    await waitFor(() => {
      expect(result).toEqual({
        pageParams: [{ body: { trigger: true } }],
        pages: [
          {
            id: '2',
            name: 'New Name',
            description: 'New Description',
            trigger: true,
          },
        ],
      });
    });
  });

  it('queries writable operations without body', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const { result } = renderHook(() => qraft.files.deleteFiles.useQuery(), {
      wrapper: (props) => (
        <QueryClientProvider client={queryClient} {...props} />
      ),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({});
    });
  });

  it('queries writable operations without body but with query params', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const { result } = renderHook(
      () =>
        qraft.files.deleteFiles.useQuery({
          query: { all: true },
        }),
      {
        wrapper: (props) => (
          <QueryClientProvider client={queryClient} {...props} />
        ),
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({ query: { all: 'true' } });
    });
  });

  it('supports mutation function', async () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const body = {
      name: 'New Name',
      description: 'New Description',
    };

    const result = await qraft.approvalPolicies.patchApprovalPoliciesId({
      parameters: {
        header: {
          'x-monite-version': '1',
        },
        path: {
          approval_policy_id: '2',
        },
      },
      body,
    });

    await waitFor(() => {
      expect(result.data).toEqual({
        id: '2',
        name: 'New Name',
        description: 'New Description',
      });
    });

    qraft.approvalPolicies.patchApprovalPoliciesId({
      parameters: {
        header: {
          'x-monite-version': '1',
        },
        path: {
          approval_policy_id: '2',
        },
        // @ts-expect-error - `body` should not be allowed
        body,
      },
      body,
    });

    qraft.approvalPolicies.patchApprovalPoliciesId({
      parameters: {
        header: {
          'x-monite-version': '1',
        },
        path: {
          approval_policy_id: '2',
        },
      },
    });
  });

  it('supports getQueryKey for writable operations', () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const params = {
      header: {
        'x-monite-version': '1',
        'x-monite-entity-id': '2',
      },
      path: {
        approval_policy_id: '2',
      },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    };

    const queryKey =
      qraft.approvalPolicies.patchApprovalPoliciesId.getQueryKey(params);

    queryKey satisfies [
      typeof qraft.approvalPolicies.patchApprovalPoliciesId.schema,
      paths['/approval_policies/{approval_policy_id}']['patch']['parameters'] & {
        body: paths['/approval_policies/{approval_policy_id}']['patch']['requestBody']['content']['application/json'];
      },
    ];

    // @ts-expect-error - must not be infinite
    queryKey satisfies [
      typeof qraft.approvalPolicies.patchApprovalPoliciesId.schema & {
        infinite: true;
      },
      paths['/approval_policies/{approval_policy_id}']['patch']['parameters'] & {
        body: paths['/approval_policies/{approval_policy_id}']['patch']['requestBody']['content']['application/json'];
      },
    ];
    // @ts-expect-error - must not be never
    queryKey satisfies never;

    expect(queryKey[1]).toEqual(params);
  });

  it('supports getInfiniteQueryKey for writable operations', () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const params = {
      header: {
        'x-monite-version': '1',
        'x-monite-entity-id': '2',
      },
      path: {
        approval_policy_id: '2',
      },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    };

    const infiniteQueryKey =
      qraft.approvalPolicies.patchApprovalPoliciesId.getInfiniteQueryKey(
        params
      );

    infiniteQueryKey satisfies [
      typeof qraft.approvalPolicies.patchApprovalPoliciesId.schema & {
        infinite: true;
      },
      paths['/approval_policies/{approval_policy_id}']['patch']['parameters'] & {
        body: paths['/approval_policies/{approval_policy_id}']['patch']['requestBody']['content']['application/json'];
      },
    ];
    // @ts-expect-error - must not be never
    infiniteQueryKey satisfies never;

    expect(infiniteQueryKey[1]).toEqual(params);
  });

  it('supports getQueryState for writable operations', () => {
    const queryClient = new QueryClient();
    const qraft = createAPIClient({
      requestFn,
      baseUrl,
      queryClient,
    });

    const params = {
      header: {
        'x-monite-version': '1',
        'x-monite-entity-id': '2',
      },
      path: {
        approval_policy_id: '2',
      },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    } as const;

    const result = {
      name: 'John',
      description: 'Bio',
      id: '1',
    } as const;

    qraft.approvalPolicies.patchApprovalPoliciesId.setQueryData(params, result);

    const state =
      qraft.approvalPolicies.patchApprovalPoliciesId.getQueryState(params);

    expect(state?.fetchStatus).toBeDefined();
    expect(state?.data).toEqual(result);

    state?.data satisfies
      | undefined
      | paths['/approval_policies/{approval_policy_id}']['patch']['responses']['200']['content']['application/json'];
    // @ts-expect-error - must not be never
    state?.data satisfies never;
  });
});
