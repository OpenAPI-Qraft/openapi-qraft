import type { ServiceOperationQueryKey } from '@openapi-qraft/tanstack-query-react-types';
import type { DeepReadonly } from './DeepReadonly.js';

export interface QueryFnOptions<
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> {
  signal?: TSignal;
  meta?: TMeta;
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;
}

export interface QueryFnOptionsByParameters<
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptions<TMeta, TSignal> {
  parameters: DeepReadonly<TParams>;

  queryKey?: never;
}

export interface QueryFnOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptions<TMeta, TSignal> {
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;

  parameters?: never;
}
