import type { ReactNode } from 'react';
import type { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import type { Services } from './fixtures/api/index.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { createContext, useContext, useMemo } from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestFn } from '../lib/requestFn.js';
import { QraftSecureRequestFn } from '../Unstable_QraftSecureRequestFn.js';
import { createTestJwt } from './createTestJwt.js';
import { createAPIClient } from './fixtures/api/index.js';

const QraftContext = createContext<Services | null>(null);

const useQraft = () => {
  const value = useContext(QraftContext);
  if (!value) {
    throw new Error('useQraft must be used within a QraftProvider');
  }
  return value;
};

describe('QraftSecureRequestFn', { timeout: 10_000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterAll(() => vi.useRealTimers());

  const mutationParams: Pick<
    Services['entities']['postEntitiesIdDocuments']['types'],
    'body'
  > &
    Services['entities']['postEntitiesIdDocuments']['types']['parameters'] = {
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
  };

  it('fetches token one time', async () => {
    const token = createTestJwt({ iat: 1593268893, exp: 1593268893 + 3600 });

    const fetchPartnerToken = vi.fn().mockImplementation(() => token);

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            securitySchemes={{
              partnerToken: fetchPartnerToken,
            }}
          >
            {(secureRequestFn) => (
              <Providers {...props} requestFn={secureRequestFn} />
            )}
          </QraftSecureRequestFn>
        ),
      }
    );

    await act(async () => {
      await result.current.mutateAsync(mutationParams);

      vi.advanceTimersByTime(3600_000 / 2);

      await result.current.mutateAsync({
        ...mutationParams,
        header: {
          'x-monite-version': '2.0.0',
        },
      });
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual({
      ...mutationParams,
      header: {
        'x-monite-version': '2.0.0',
        authorization: `Bearer ${token}`,
      },
    });

    expect(fetchPartnerToken.mock.calls).toEqual([
      [
        {
          isRefreshing: false,
          signal: new AbortController().signal,
        },
      ],
    ]);
  });

  it('fetches new token if expired', async () => {
    const token = createTestJwt({ iat: 1593268893, exp: 1593268893 + 3600 });

    const fetchPartnerToken = vi.fn().mockImplementation(() => token);

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            securitySchemes={{
              partnerToken: fetchPartnerToken,
            }}
          >
            {(secureRequestFn) => (
              <Providers {...props} requestFn={secureRequestFn} />
            )}
          </QraftSecureRequestFn>
        ),
      }
    );

    await act(async () => result.current.mutateAsync(mutationParams));
    await act(async () => vi.advanceTimersByTimeAsync(3600_000));

    await act(
      async () =>
        await result.current.mutateAsync({
          ...mutationParams,
          header: {
            'x-monite-version': '2.0.0',
          },
        })
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual({
      ...mutationParams,
      header: {
        'x-monite-version': '2.0.0',
        authorization: `Bearer ${token}`,
      },
    });

    expect(fetchPartnerToken.mock.calls).toEqual([
      [
        {
          isRefreshing: false,
          signal: new AbortController().signal,
        },
      ],
      [
        {
          isRefreshing: true,
          signal: new AbortController().signal,
        },
      ],
    ]);
  });

  it('refreshes token with interval', async () => {
    const token = createTestJwt({ iat: 1593268893, exp: 1593268893 + 3600 });

    const fetchPartnerToken = vi
      .fn()
      .mockImplementation(({ isRefreshing }: { isRefreshing: boolean }) => {
        console.log(isRefreshing ? '🔄 refreshing' : '⤴️ initial', 'query');
        return token;
      });

    const queryClient = new QueryClient();

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            queryClient={queryClient}
            securitySchemes={{
              partnerToken: fetchPartnerToken,
              foo({ isRefreshing }) {
                return isRefreshing ? '🔄 refreshing' : '⤴️ initial';
              },
            }}
          >
            {(secureRequestFn) => (
              <Providers {...props} requestFn={secureRequestFn} />
            )}
          </QraftSecureRequestFn>
        ),
      }
    );

    await act(() => result.current.mutateAsync(mutationParams));

    await act(() =>
      /// run MSW timers
      vi.advanceTimersByTime(100)
    );

    await waitFor(() =>
      expect(result.current.data).toEqual({
        ...mutationParams,
        header: {
          ...mutationParams.header,
          authorization: `Bearer ${token}`,
        },
      })
    );

    expect(fetchPartnerToken.mock.calls).toEqual([
      [
        {
          isRefreshing: false,
          signal: new AbortController().signal,
        },
      ],
    ]);

    await act(() => vi.advanceTimersByTimeAsync(3600_000 * 0.8));

    await waitFor(() =>
      expect(queryClient.isFetching({ queryKey: ['partnerToken'] })).toEqual(0)
    );

    expect(fetchPartnerToken.mock.calls).toEqual([
      [
        {
          isRefreshing: false,
          signal: new AbortController().signal,
        },
      ],
      [
        {
          isRefreshing: true,
          signal: new AbortController().signal,
        },
      ],
    ]);

    await act(() => vi.advanceTimersByTimeAsync(3600_000 * 0.8));

    await waitFor(() =>
      expect(queryClient.isFetching({ queryKey: ['partnerToken'] })).toEqual(0)
    );

    expect(fetchPartnerToken.mock.calls).toEqual([
      [
        {
          isRefreshing: false,
          signal: new AbortController().signal,
        },
      ],
      [
        {
          isRefreshing: true,
          signal: new AbortController().signal,
        },
      ],
      [
        {
          isRefreshing: true,
          signal: new AbortController().signal,
        },
      ],
    ]);
  });

  it('refreshes token if expired soon', async () => {
    const token = createTestJwt({ iat: 1593268893, exp: 1593268893 + 3600 });

    const fetchPartnerToken = vi.fn().mockImplementation(() => token);

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            securitySchemes={{
              partnerToken: fetchPartnerToken,
            }}
          >
            {(secureRequestFn) => (
              <Providers {...props} requestFn={secureRequestFn} />
            )}
          </QraftSecureRequestFn>
        ),
      }
    );

    await act(async () => {
      await result.current.mutateAsync(mutationParams);

      vi.advanceTimersByTime(3600_000 * 0.9);

      await result.current.mutateAsync({
        ...mutationParams,
        header: {
          'x-monite-version': '2.0.0',
        },
      });
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual({
      ...mutationParams,
      header: {
        'x-monite-version': '2.0.0',
        authorization: `Bearer ${token}`,
      },
    });

    expect(fetchPartnerToken.mock.calls).toEqual([
      [
        {
          isRefreshing: false,
          signal: new AbortController().signal,
        },
      ],
      [
        {
          isRefreshing: true,
          signal: new AbortController().signal,
        },
      ],
    ]);
  });
});

function Providers({
  children,
  requestFn: requestFnProp,
}: {
  children: ReactNode;
  requestFn: CreateAPIBasicClientOptions['requestFn'];
}) {
  const { qraft, queryClient } = useMemo(() => {
    const queryClient = new QueryClient();
    return {
      queryClient,
      qraft: createAPIClient({
        requestFn: requestFnProp,
        queryClient,
        baseUrl: 'https://api.sandbox.monite.com/v1',
      }),
    };
  }, [requestFnProp]);

  return (
    <QueryClientProvider client={queryClient}>
      <QraftContext.Provider value={qraft}>{children}</QraftContext.Provider>
    </QueryClientProvider>
  );
}
