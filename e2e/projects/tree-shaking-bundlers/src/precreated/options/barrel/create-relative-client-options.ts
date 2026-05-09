import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';

export const buildRelativeClientOptions = () => ({
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
});
