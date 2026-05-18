import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';

export const createAliasDirectClientOptions = () => ({
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
});

export const createRelativeExtClientOptions = () => ({
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
});
