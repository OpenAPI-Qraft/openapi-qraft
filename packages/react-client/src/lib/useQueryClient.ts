'use client';

import { useContext } from 'react';

import {
  QueryClient,
  useQueryClient as useQueryClientTanstack,
} from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';

/**
 * Get the QueryClient from the QraftContext or the provided QueryClient argument.
 * @param qraftOptions if `queryClient` is not provided, will be taken from context
 * @param queryClient If not provided, will be taken this instance
 */
export function useQueryClient(
  qraftOptions: QraftClientOptions | undefined,
  queryClient: QueryClient | undefined
) {
  const queryClientByContext = useContext(qraftOptions?.context ?? QraftContext)
    ?.queryClient;

  return useQueryClientTanstack(queryClient ?? queryClientByContext);
}
