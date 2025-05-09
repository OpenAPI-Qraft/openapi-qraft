import type {
  AreAllOptional,
  QueryFnOptionsByParameters,
  QueryFnOptionsByQueryKey,
  RequestFnResponse,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationQueryFn<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByQueryKey<TSchema, TQueryParams, TMeta, TSignal>
      | (AreAllOptional<TQueryParams> extends true
          ? QueryFnOptionsByParameters<TQueryParams, TMeta, TSignal> | void
          : QueryFnOptionsByParameters<TQueryParams, TMeta, TSignal>),
    client?: (
      schema: TSchema,
      options: {
        parameters: TQueryParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<RequestFnResponse<TOperationQueryFnData, TError>>
  ): Promise<RequestFnResponse<TOperationQueryFnData, TError>>;
}
