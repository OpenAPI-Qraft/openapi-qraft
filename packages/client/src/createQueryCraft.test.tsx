import React, { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

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
