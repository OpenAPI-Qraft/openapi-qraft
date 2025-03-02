import type {
  AreAllOptional,
  QueryFnOptionsByParameters,
  QueryFnOptionsByQueryKey,
  RequestFnResponse,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationQueryFn<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>
      | (AreAllOptional<TParams> extends true
          ? QueryFnOptionsByParameters<TParams, TMeta, TSignal> | void
          : QueryFnOptionsByParameters<TParams, TMeta, TSignal>),
    client?: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<RequestFnResponse<TOperationQueryFnData, TError>>
  ): Promise<RequestFnResponse<TOperationQueryFnData, TError>>;
}
