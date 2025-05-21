import type {
  RequestFnResponse,
  ServiceOperationMutationFnOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TMutationParams,
  TError,
> {
  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options: ServiceOperationMutationFnOptions<
      TBody,
      TMutationParams,
      TMeta,
      TSignal
    >,
    client?: (
      schema: TSchema,
      options: ServiceOperationMutationFnOptions<
        TBody,
        TMutationParams,
        TMeta,
        TSignal
      >
    ) => Promise<RequestFnResponse<TMutationData, TError>>
  ): Promise<RequestFnResponse<TMutationData, TError>>;
}
