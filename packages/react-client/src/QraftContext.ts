'use client';

import { createContext } from 'react';

import type { QueryClient } from '@tanstack/react-query';

import type { RequestClient } from './RequestClient.js';

export type QraftContextValue =
  | {
      /** The request client to use for making requests. Will be invoked with every request. */
      requestClient: RequestClient;
      /** The QueryClient to use in Hooks */
      queryClient?: QueryClient;
    }
  | undefined;

export const QraftContext = createContext<QraftContextValue>(undefined);
