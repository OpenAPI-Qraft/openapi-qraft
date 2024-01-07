import { createContext } from 'react';

import { RequestSchema } from './ServiceOperation.js';

type RequestClientParams = {
  header?: Record<string, never>;
  path?: Record<string, never>;
  query?: Record<string, never>;
};

export type RequestClient = <T>(
  schema: RequestSchema,
  options: {
    body?: Record<string, unknown> | FormData;
    parameters?: RequestClientParams;
    signal?: AbortSignal;
    meta?: Record<string, unknown>;
  }
) => Promise<T>;

export const QueryCraftContext = createContext<
  | {
      client: RequestClient;
    }
  | undefined
>(undefined);
