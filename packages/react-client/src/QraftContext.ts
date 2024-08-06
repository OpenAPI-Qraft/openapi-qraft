'use client';

import type { QueryClient } from '@tanstack/react-query';
import type { OperationSchema, RequestFnPayload } from './lib/requestFn.js';
import { createContext } from 'react';

interface QraftContextValueBase {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;

  /**
   * The `requestFn` will be invoked with every request.
   */
  requestFn<T>(
    requestSchema: OperationSchema,
    requestInfo: RequestFnPayload
  ): Promise<T>;

  /** The QueryClient to use in Hooks */
  queryClient?: QueryClient;
}

export type QraftContextValue = QraftContextValueBase | undefined;

export const QraftContext = createContext<QraftContextValue>(undefined);
