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

      await vi.advanceTimersByTimeAsync(3600_000 / 2);

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
      vi.advanceTimersByTimeAsync(100)
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

  it('should support Basic Authentication with credentials', async () => {
    const credentials = 'base_64_credentials=='; // base64 encoded user:password

    const fetchBasicAuth = vi.fn().mockImplementation(() => ({
      credentials,
      refreshInterval: 3600000,
    }));

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            securitySchemes={{
              partnerToken: fetchBasicAuth,
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
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual({
      ...mutationParams,
      header: {
        ...mutationParams.header,
        authorization: `Basic ${credentials}`,
      },
    });

    expect(fetchBasicAuth.mock.calls).toEqual([
      [
        {
          isRefreshing: false,
          signal: new AbortController().signal,
        },
      ],
    ]);
  });

  it('should support API key in header', async () => {
    const apiKeyHeader = {
      in: 'header',
      name: 'x-api-key',
      value: 'api-key-value',
      refreshInterval: 3600000,
    };

    const fetchApiKey = vi.fn().mockImplementation(() => apiKeyHeader);

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            securitySchemes={{
              partnerToken: fetchApiKey,
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
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual({
      ...mutationParams,
      header: {
        ...mutationParams.header,
        [apiKeyHeader.name]: apiKeyHeader.value,
      },
    });
  });

  it('should support API key in query', async () => {
    const apiKeyQuery = {
      in: 'query',
      name: 'api_key',
      value: 'api-key-value',
      refreshInterval: 3600000,
    };

    const fetchApiKey = vi.fn().mockImplementation(() => apiKeyQuery);

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            securitySchemes={{
              partnerToken: fetchApiKey,
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
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual({
      ...mutationParams,
      query: {
        ...mutationParams.query,
        [apiKeyQuery.name]: apiKeyQuery.value,
      },
    });
  });

  it('should throw error for cookie scheme', async () => {
    const cookieScheme = {
      in: 'cookie',
      refreshInterval: 3600000,
    };

    const fetchCookieScheme = vi.fn().mockImplementation(() => cookieScheme);

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            securitySchemes={{
              partnerToken: fetchCookieScheme,
            }}
          >
            {(secureRequestFn) => (
              <Providers {...props} requestFn={secureRequestFn} />
            )}
          </QraftSecureRequestFn>
        ),
      }
    );

    await expect(result.current.mutateAsync(mutationParams)).rejects.toThrow(
      new Error(
        'Security scheme must be a string, an object with a token property, an object with a credentials property, or an object with an in property that is not equal to "cookie".'
      )
    );
  });

  it('should use refreshInterval from security result object', async () => {
    const token = 'custom-token';
    const refreshInterval = 1800000; // 30 minutes
    let tokenRefreshCounter = 0;

    const fetchCustomToken = vi.fn().mockImplementation(() => ({
      token: `${token}-${++tokenRefreshCounter}`,
      refreshInterval,
    }));

    const queryClient = new QueryClient();

    const { result } = renderHook(
      () => useQraft().entities.postEntitiesIdDocuments.useMutation(),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            queryClient={queryClient}
            securitySchemes={{
              partnerToken: fetchCustomToken,
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
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    // Check that the request was made with token
    expect(result.current.data).toEqual({
      ...mutationParams,
      header: {
        ...mutationParams.header,
        authorization: `Bearer ${token}-1`,
      },
    });

    // Reset call counter to check subsequent calls
    fetchCustomToken.mockClear();

    // First mutation after initial request (token should be in cache)
    await act(async () => {
      await result.current.mutateAsync({
        ...mutationParams,
        header: {
          'x-monite-version': '2.0.0',
        },
      });
    });

    // Token should not have been refreshed after second request
    expect(fetchCustomToken).not.toHaveBeenCalled();

    // Advance timer to 85% of interval - token should refresh on next request (80% threshold)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(refreshInterval * 0.85);
    });

    // Execute third mutation
    await act(async () => {
      await result.current.mutateAsync({
        ...mutationParams,
        header: {
          'x-monite-version': '3.0.0',
        },
      });
    });

    // Check that request contains token and refresh function was called
    await waitFor(() => {
      expect(result.current.data).toEqual({
        ...mutationParams,
        header: {
          'x-monite-version': '3.0.0',
          authorization: `Bearer ${token}-2`,
        },
      });
      expect(fetchCustomToken).toHaveBeenCalledTimes(1);
      expect(fetchCustomToken).toHaveBeenCalledWith({
        isRefreshing: true,
        signal: new AbortController().signal,
      });
    });

    // Reset counter and check one more mutation after full interval
    fetchCustomToken.mockClear();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(refreshInterval);
      await result.current.mutateAsync({
        ...mutationParams,
        header: {
          'x-monite-version': '4.0.0',
        },
      });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        ...mutationParams,
        header: {
          'x-monite-version': '4.0.0',
          authorization: `Bearer ${token}-3`,
        },
      });
      expect(fetchCustomToken).toHaveBeenCalledTimes(1);
    });
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

      await vi.advanceTimersByTimeAsync(3600_000 * 0.9);

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

  it('should cancel token fetching when request is aborted', async () => {
    const abortController = new AbortController();

    const fetchPartnerToken = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));

    const queryClient = new QueryClient();

    const { result } = renderHook(
      () =>
        useQraft().entities.postEntitiesIdDocuments({
          signal: abortController.signal,
          parameters: mutationParams,
          body: { verification_document_front: '' },
        }),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            queryClient={queryClient}
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

    await vi.advanceTimersByTimeAsync(100);
    await queryClient.cancelQueries();

    await expect(result.current).rejects.toThrow('CancelledError');
  });

  it('should cancel token fetching when externally aborted', async () => {
    const abortController = new AbortController();

    const fetchPartnerToken = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));

    const queryClient = new QueryClient();

    const { result } = renderHook(
      () =>
        useQraft().entities.postEntitiesIdDocuments({
          signal: abortController.signal,
          parameters: mutationParams,
          body: { verification_document_front: '' },
        }),
      {
        wrapper: (props) => (
          <QraftSecureRequestFn
            requestFn={requestFn}
            queryClient={queryClient}
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

    await vi.advanceTimersByTimeAsync(100);
    abortController.abort(new Error('My Custom Abort Error'));

    await expect(result.current).rejects.toThrow('My Custom Abort Error');
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
