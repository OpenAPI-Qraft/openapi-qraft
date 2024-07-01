import { requestFn } from '@openapi-qraft/react';
import { operationInvokeFn } from '@openapi-qraft/react/callbacks/operationInvokeFn';
import {
  QraftSecureRequestFn,
  createSecureRequestFn,
} from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';
import { QueryClient } from '@tanstack/query-core';
import { qraftAPIClient, QraftClientOptions } from "@openapi-qraft/react";
import { services, Services } from "./api/services/index";

import { createAPIClient  } from './api/index';

QraftSecureRequestFn({
  requestFn: createSecureRequestFn({}, requestFn, new QueryClient()),
  queryClient: new QueryClient(),
  securitySchemes: {},
  children: (securedRequestFn) => null,
});

createAPIClient({})

const nodeCallbacks = {
  operationInvokeFn: operationInvokeFn
}

export function createNodeAPIClient(options?: QraftClientOptions): Services {
  return qraftAPIClient<Services, typeof nodeCallbacks>(services, nodeCallbacks, options);
}
