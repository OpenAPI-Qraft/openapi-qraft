import type { CreateAPIClientOptions } from '@openapi-qraft/react';
import { requestFn } from '@openapi-qraft/react';
import { QueryClient } from '@tanstack/react-query';
import { createNodeAPIClient } from './generated-api';

const nodeOptions = {
  queryClient: new QueryClient(),
  baseUrl: 'http://localhost:3000',
  requestFn,
} satisfies CreateAPIClientOptions;

const nodeApi = createNodeAPIClient(nodeOptions);

export const result = [
  nodeApi.pets.getPets.getQueryKey(),
  nodeApi.pets.getPets.invalidateQueries(),
  nodeApi.pets.getPets.setQueryData(undefined, () => undefined),
];
