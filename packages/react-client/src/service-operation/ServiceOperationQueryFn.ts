import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

interface QueryFnOptionsBase<
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> {
  signal?: TSignal;
  meta?: TMeta;
}

interface QueryFnOptionsByParameters<
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal> {
  parameters: TParams;

  queryKey?: never;
  baseUrl?: never;
}

interface QueryFnOptionsByParametersWithBaseUrl<
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal>,
    QueryFnBaseUrlOptions {
  parameters: TParams;

  queryKey?: never;
}

interface QueryFnOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal> {
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;

  parameters?: never;
  baseUrl?: never;
}

interface QueryFnOptionsByQueryKeyWithBaseUrl<
  TSchema extends { url: string; method: string },
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal>,
    QueryFnBaseUrlOptions {
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;

  parameters?: never;
}

interface QueryFnBaseUrlOptions {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl: string;
}

export interface ServiceOperationQueryFn<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
> {
  /**
   * @deprecated Use `<service>.<operation>(...)` instead.
   */
  queryFn<
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => TData
  ): TData;

  /**
   * @deprecated Use `<service>.<operation>(...)` instead.
   */
  queryFn<
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<TData>
  ): Promise<TData>;

  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => TData
  ): TData;

  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParametersWithBaseUrl<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKeyWithBaseUrl<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      } & QueryFnBaseUrlOptions
    ) => TData
  ): TData;

  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<TData>
  ): Promise<TData>;

  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParametersWithBaseUrl<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKeyWithBaseUrl<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      } & QueryFnBaseUrlOptions
    ) => Promise<TData>
  ): Promise<TData>;
}
