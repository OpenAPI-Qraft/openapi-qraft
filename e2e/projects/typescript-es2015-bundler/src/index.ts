import type {
  APIBasicClientServices,
  CreateAPIBasicClientOptions,
  RequestFn,
  RequestFnInfo,
  RequestFnOptions,
  RequestFnPayload,
  RequestFnResponse,
} from '@openapi-qraft/react';
import { qraftAPIClient, requestFn } from '@openapi-qraft/react';
import { operationInvokeFn } from '@openapi-qraft/react/callbacks/operationInvokeFn';
import {
  createSecureRequestFn,
  QraftSecureRequestFn,
} from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';
import { QueryClient } from '@tanstack/query-core';
import { createAPIClient } from './api/index';
import { services } from './api/services/index';

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
): APIBasicClientServices<typeof services, typeof nodeCallbacks> {
  return qraftAPIClient(services, nodeCallbacks, options);
}

interface RequestTypeTest<TData, TError> {
  requestFn: RequestFn<TData, TError>;
  requestFnOptions: RequestFnOptions;
  requestFnPayload: RequestFnPayload;
  requestFnResponse: RequestFnResponse<TData, TError>;
  requestFnInfo: RequestFnInfo;
}
