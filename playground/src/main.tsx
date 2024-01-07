import React, { ReactNode, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { request } from '@radist2s/qraft/lib/core/request';
import { QueryCraftContext } from '@radist2s/qraft/QueryCraftContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.tsx';
import { MONITE_VERSION } from './constants.ts';
import { AccessToken, fetchToken } from './fetch-token.ts';

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const fetchAppToken = useFetchToken();

  return (
    <QueryClientProvider client={queryClient}>
      <QueryCraftContext.Provider
        value={{
          client: async (schema, { signal, body, parameters }) => {
            const { access_token } = await fetchAppToken();

            return request(
              {
                baseUrl: 'https://api.sandbox.monite.com/v1',
                version: MONITE_VERSION,
              },
              {
                ...schema,
                parameters,
                body,
                signal,
                headers: {
                  Authorization: `Bearer ${access_token}`,
                },
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

const useFetchToken = () => {
  const cachedToken = useRef<
    | {
        token: AccessToken;
        expires_at: number;
      }
    | undefined
  >();

  const tokenFetchPromise = useRef<
    Promise<NonNullable<AccessToken>> | undefined
  >();

  return useCallback(() => {
    if (cachedToken.current && cachedToken.current.expires_at > Date.now()) {
      return Promise.resolve(cachedToken.current.token);
    }

    return (
      tokenFetchPromise.current ??
      (tokenFetchPromise.current = fetchToken(
        {
          client_id: import.meta.env.VITE_CLIENT_ID,
          client_secret: import.meta.env.VITE_CLIENT_SECRET,
          entity_user_id: import.meta.env.VITE_ENTITY_USER_ID,
          grant_type: 'entity_user',
        },
        {
          version: MONITE_VERSION,
          baseURL: 'https://api.sandbox.monite.com/v1',
        }
      )
        .then((accessToken) => {
          cachedToken.current = {
            expires_at: Date.now() + accessToken.expires_in * 1000,
            token: accessToken,
          };

          return accessToken;
        })
        .finally(() => {
          tokenFetchPromise.current = undefined;
        }))
    );
  }, []);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
