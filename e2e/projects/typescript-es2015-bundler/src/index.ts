import {
  APIBasicClientServices,
  CreateAPIBasicClientOptions,
  qraftAPIClient,
  requestFn,
} from '@openapi-qraft/react';
import { operationInvokeFn } from '@openapi-qraft/react/callbacks/operationInvokeFn';
import {
  createSecureRequestFn,
  QraftSecureRequestFn,
} from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';
import { QueryClient } from '@tanstack/query-core';
import { createAPIClient } from './api/index';
import { services, Services } from './api/services/index';

QraftSecureRequestFn({
  requestFn: createSecureRequestFn({}, requestFn, new QueryClient()),
  queryClient: new QueryClient(),
  securitySchemes: {},
  children: (securedRequestFn) => null,
});

createAPIClient({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  requestFn,
  queryClient: new QueryClient(),
});

const nodeCallbacks = {
  operationInvokeFn: operationInvokeFn,
};

export function createNodeAPIClient(
  options: CreateAPIBasicClientOptions
): APIBasicClientServices<Services, typeof nodeCallbacks> {
  return qraftAPIClient<Services, typeof nodeCallbacks>(
    services,
    nodeCallbacks,
    options
  );
}
