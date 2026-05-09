import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';


export const createBarrelClientOptions = () => ({
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
});
