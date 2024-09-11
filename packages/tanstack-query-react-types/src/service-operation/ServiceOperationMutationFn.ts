import type {
  RequestFnResponse,
  ServiceOperationMutationFnOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TParams,
  TError,
> {
  <TOptions extends ServiceOperationMutationFnOptions<TBody, TParams>>(
    options: TOptions,
    client?: (
      schema: TSchema,
      options: TOptions
    ) => Promise<RequestFnResponse<TMutationData, TError>>
  ): Promise<RequestFnResponse<TMutationData, TError>>;
}
