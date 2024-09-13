import type {
  AreAllOptional,
  QueryFnOptionsByParameters,
  QueryFnOptionsByQueryKey,
  RequestFnResponse,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationQueryFn<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options: AreAllOptional<TParams> extends true
      ?
          | void
          | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
          | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>
      :
          | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
          | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client?: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<RequestFnResponse<TQueryFnData, TError>>
  ): Promise<RequestFnResponse<TQueryFnData, TError>>;
}
