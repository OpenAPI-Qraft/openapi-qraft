import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';

import { request } from '@radist2s/qraft/lib/core/request';
import { QueryCraftContext } from '@radist2s/qraft/QueryCraftContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.tsx';
import { MONITE_VERSION } from './constants.ts';
import { fetchToken } from './fetch-token.ts';

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <QueryCraftContext.Provider
        value={{
          client: (schema, { signal, body, parameters }) => {
            return request(
              {
                TOKEN: () =>
                  fetchToken(
                    {
                      client_id: import.meta.env.VITE_CLIENT_ID,
                      client_secret: import.meta.env.VITE_CLIENT_SECRET,
                      entity_user_id: import.meta.env.VITE_ENTITY_USER_ID,
                      grant_type: 'entity_user',
                    },
                    {
                      version: MONITE_VERSION,
                      apiURL: 'https://api.sandbox.monite.com/v1',
                    }
                  ).then(({ access_token }) => access_token),
                BASE: 'https://api.sandbox.monite.com/v1',
                VERSION: MONITE_VERSION,
                WITH_CREDENTIALS: false,
                CREDENTIALS: 'omit',
              },
              {
                ...schema,
                parameters,
                body,
                signal,
              }
            );
          },
        }}
      >
        {children}
      </QueryCraftContext.Provider>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
