'use client';

import { createContext } from 'react';

import type { QueryClient } from '@tanstack/react-query';

import type {
  OperationRequestSchema,
  RequestFnPayload,
} from './lib/requestFn.js';

interface QraftContextValueBase {
  /**
   * The base URL to use for all requests.
   * @example 'https://api.example.com'
   */
  baseUrl: string;

  /**
   * The `requestFn` will be invoked with every request.
   */
  requestFn<T>(
    requestSchema: OperationRequestSchema,
    requestInfo: RequestFnPayload
  ): Promise<T>;

  /** The QueryClient to use in Hooks */
  queryClient?: QueryClient;
}

export type QraftContextValue = QraftContextValueBase | undefined;

export const QraftContext = createContext<QraftContextValue>(undefined);
