import type { CreateAPIClientOptions } from '@openapi-qraft/react';
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';
import { createVirtualNodeAPIClient } from 'virtual:qraft-node-api';

const nodeOptions = {
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
} satisfies CreateAPIClientOptions;

const virtualNodeApi = createVirtualNodeAPIClient(nodeOptions);

export const result = [
  virtualNodeApi.pets.getPets.getQueryKey(),
  virtualNodeApi.pets.getPets.invalidateQueries(),
  virtualNodeApi.pets.getPets.setQueryData(undefined, () => undefined),
];
