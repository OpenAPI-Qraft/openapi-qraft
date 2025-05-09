import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { requestFn } from '../index.js';
import { createAPIClient } from './fixtures/queryable-write-operations-api/index.js';

const baseUrl = 'https://api.sandbox.monite.com/v1';

describe('Queryable write operations', () => {
  it('queries writable operations with a specific body', async () => {
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
});
