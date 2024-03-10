'use client';

import { createContext } from 'react';

import type { QueryClient } from '@tanstack/react-query';

import type {
  OperationRequestInfo,
  OperationRequestSchema,
} from './lib/request.js';

interface QraftContextValueBase {
  /** The QueryClient to use in Hooks */
  queryClient?: QueryClient;

  /**
   * The request client to use for making requests. Will be invoked with every request.
   */
  request<T>(
    options: { baseUrl: string },
    schema: OperationRequestSchema,
    requestInfo: OperationRequestInfo
  ): Promise<T>;
  /**
   * The base URL to use for all requests.
   * @example 'https://api.example.com'
   */
  baseUrl: string;
}

export type QraftContextValue = QraftContextValueBase | undefined;

export const QraftContext = createContext<QraftContextValue>(undefined);
