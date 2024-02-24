import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';

import {
  bodySerializer,
  QraftContext,
  request,
  urlSerializer,
} from '@openapi-qraft/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.tsx';

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <QraftContext.Provider
        value={{
          async requestClient(schema, options) {
            return request(
              {
                baseUrl: 'https://petstore3.swagger.io/api/v3',
              },
              {
                ...schema,
                ...options,
              },
              { urlSerializer, bodySerializer }
            );
          },
        }}
      >
        {children}
      </QraftContext.Provider>
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
