import React, { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { createQueryCraft } from './createQueryCraft.js';
import { request } from './lib/core/request.js';
import { services, Services } from './mocks/fixtures/api/index.js';
import { QueryCraftContext } from './QueryCraftContext.js';

const qraft = createQueryCraft<Services>(services);

describe('Qraft uses Queries', () => {
  it('supports useQuery', async () => {
    const { result } = renderHook(
      () =>
        qraft.counterparts.getCounterpartsId.useQuery({
          header: {
            'x-monite-entity-id': '1',
            'x-monite-version': '1.0.0',
          },
          path: {
            counterpart_id: '1',
          },
        }),
      {
        wrapper: Providers,
      }
    );

    await waitFor(() => {
      expect(result.current.data?.id).toEqual('1');
    });
  });
});

describe('Qraft uses Mutations', () => {
  it('supports useMutation', async () => {
    const { result } = renderHook(
      () =>
        qraft.counterparts.postCounterpartsIdAddresses.useMutation({
          header: {
            'x-monite-entity-id': '1',
            'x-monite-version': '1.0.0',
          },
          path: {
            counterpart_id: '1',
          },
        }),
      {
        wrapper: Providers,
      }
    );

    act(() => {
      result.current.mutate({
        city: 'Paris',
        country: 'FR',
        line1: '1 rue de la Paix',
        postal_code: '75000',
      });
    });

    await waitFor(() => {
      expect(result.current.data?.city).toEqual('Paris');
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

function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <QueryCraftContext.Provider
        value={{
          client: async (schema, options) => {
            return request(
              {
                baseUrl: 'https://api.sandbox.monite.com/v1',
                version: '2023-06-04',
              },
              {
                ...schema,
                ...options,
              }
            );
          },
        }}
      >
        {children}
      </QueryCraftContext.Provider>
    </QueryClientProvider>
  );
}
