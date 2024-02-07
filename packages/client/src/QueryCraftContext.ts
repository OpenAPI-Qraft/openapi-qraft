import { createContext } from 'react';

type RequestClientParams = {
  header?: Record<string, any>;
  path?: Record<string, any>;
  query?: Record<string, any>;
  cookie?: Record<string, any>;
};

export type RequestSchema = {
  url: string;
  method: 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch';
  errors?: number[];
  mediaType?: string;
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
      /** The request client to use for making requests. Will be invoked with every request. */
      requestClient: RequestClient;
    }
  | undefined
>(undefined);
