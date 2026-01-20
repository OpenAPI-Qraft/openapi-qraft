import type { ReactNode } from 'react';
import { fetchQuery } from '@openapi-qraft/react/callbacks/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { useContext, useEffect, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { requestFn } from '../index.js';
import {
  createInternalReactAPIClient,
  InternalReactAPIClientContext,
  services,
} from './fixtures/files-api/index.js';
import {
  files,
  getFileList,
  postFiles,
} from './fixtures/files-api/services/Files.js';
import { filesFindAllResponsePayloadFixtures } from './msw/handlers.js';

const baseUrl = 'https://api.sandbox.monite.com/v1';

function ContextProviders({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  const contextValue = {
    requestFn,
    baseUrl,
    queryClient,
  };

  return (
    <InternalReactAPIClientContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </InternalReactAPIClientContext.Provider>
  );
}

describe('Create API Client with Context', () => {
  describe('useQuery with single service (getFileList)', () => {
    it('supports useQuery with context-provided options', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(getFileList);

      const { result } = renderHook(() => api.useQuery(), {
        wrapper: (props) => (
          <ContextProviders queryClient={queryClient} {...props} />
        ),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(
          filesFindAllResponsePayloadFixtures
        );
      });
    });

    it('supports useQuery with parameters', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(getFileList);

      const { result } = renderHook(
        () =>
          api.useQuery({
            query: { id__in: ['1', '2'] },
          }),
        {
          wrapper: (props) => (
            <ContextProviders queryClient={queryClient} {...props} />
          ),
        }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(
          filesFindAllResponsePayloadFixtures
        );
      });
    });
  });

  describe('useQuery with files service', () => {
    it('supports useQuery with context-provided options', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(files);

      const { result } = renderHook(() => api.getFileList.useQuery(), {
        wrapper: (props) => (
          <ContextProviders queryClient={queryClient} {...props} />
        ),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(
          filesFindAllResponsePayloadFixtures
        );
      });
    });

    it('supports useQuery with parameters', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(files);

      const { result } = renderHook(
        () =>
          api.getFileList.useQuery({
            query: { id__in: ['1'] },
          }),
        {
          wrapper: (props) => (
            <ContextProviders queryClient={queryClient} {...props} />
          ),
        }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(
          filesFindAllResponsePayloadFixtures
        );
      });
    });
  });

  describe('useQuery with all services', () => {
    it('supports useQuery with context-provided options', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(services);

      const { result } = renderHook(() => api.files.getFileList.useQuery(), {
        wrapper: (props) => (
          <ContextProviders queryClient={queryClient} {...props} />
        ),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(
          filesFindAllResponsePayloadFixtures
        );
      });
    });

    it('supports useQuery with parameters', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(services);

      const { result } = renderHook(
        () =>
          api.files.getFileList.useQuery({
            query: { id__in: ['1', '2'] },
            header: { 'x-monite-version': '2023-06-04' },
          }),
        {
          wrapper: (props) => (
            <ContextProviders queryClient={queryClient} {...props} />
          ),
        }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(
          filesFindAllResponsePayloadFixtures
        );
      });
    });

    it('supports getQueryKey', () => {
      const api = createInternalReactAPIClient(services);

      expect(api.files.getFileList.getQueryKey()).toMatchInlineSnapshot(`
        [
          {
            "infinite": false,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);
    });

    it('supports getInfiniteQueryKey', () => {
      const api = createInternalReactAPIClient(services);

      expect(api.files.getFileList.getInfiniteQueryKey())
        .toMatchInlineSnapshot(`
        [
          {
            "infinite": true,
            "method": "get",
            "security": [
              "HTTPBearer",
            ],
            "url": "/files/list",
          },
          {},
        ]
      `);
    });
  });

  describe('useMutation with context', () => {
    it('supports useMutation with single service', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(postFiles);

      const { result } = renderHook(() => api.useMutation(), {
        wrapper: (props) => (
          <ContextProviders queryClient={queryClient} {...props} />
        ),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('supports useMutation with files service', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(files);

      const { result } = renderHook(() => api.postFiles.useMutation(), {
        wrapper: (props) => (
          <ContextProviders queryClient={queryClient} {...props} />
        ),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('supports useMutation with all services', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(services);

      const { result } = renderHook(() => api.files.postFiles.useMutation(), {
        wrapper: (props) => (
          <ContextProviders queryClient={queryClient} {...props} />
        ),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('supports useMutation and performs mutation', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(services);

      const { result } = renderHook(() => api.files.postFiles.useMutation(), {
        wrapper: (props) => (
          <ContextProviders queryClient={queryClient} {...props} />
        ),
      });

      act(() => {
        result.current.mutate({
          body: {
            file_description: 'Test file',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          body: {
            file_description: 'Test file',
          },
        });
      });
    });
  });

  describe('custom fetchQuery with context', () => {
    it('supports fetchQuery with single service', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(
        getFileList,
        {
          queryClient,
          requestFn,
          baseUrl,
        },
        { fetchQuery }
      );

      const data = await api.fetchQuery();

      expect(data).toEqual(filesFindAllResponsePayloadFixtures);
    });

    it('supports fetchQuery with all services', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(
        services,
        {
          queryClient,
          requestFn,
          baseUrl,
        },
        { fetchQuery }
      );

      const data = await api.files.getFileList.fetchQuery();

      expect(data).toEqual(filesFindAllResponsePayloadFixtures);
    });

    it('supports fetchQuery with parameters', async () => {
      const queryClient = new QueryClient();
      const api = createInternalReactAPIClient(
        services,
        {
          queryClient,
          requestFn,
          baseUrl,
        },
        { fetchQuery }
      );

      const data = await api.files.getFileList.fetchQuery({
        parameters: { query: { id__in: ['1'] } },
      });

      expect(data).toEqual(filesFindAllResponsePayloadFixtures);
    });

    it('supports fetchQuery with options from useContext inside useEffect', async () => {
      const queryClient = new QueryClient();

      const { result } = renderHook(
        () => {
          const options = useContext(InternalReactAPIClientContext);
          const [data, setData] = useState<
            typeof filesFindAllResponsePayloadFixtures | null
          >(null);

          useEffect(() => {
            if (!options) return;

            const api = createInternalReactAPIClient(services, options, {
              fetchQuery,
            });

            api.files.getFileList.fetchQuery().then(setData);
          }, [options]);

          return data;
        },
        {
          wrapper: (props) => (
            <ContextProviders queryClient={queryClient} {...props} />
          ),
        }
      );

      await waitFor(() => {
        expect(result.current).toEqual(filesFindAllResponsePayloadFixtures);
      });
    });
  });
});
