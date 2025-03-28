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
  (
    options: ServiceOperationMutationFnOptions<TBody, TParams>,
    client?: (
      schema: TSchema,
      options: ServiceOperationMutationFnOptions<TBody, TParams>
    ) => Promise<RequestFnResponse<TMutationData, TError>>
  ): Promise<RequestFnResponse<TMutationData, TError>>;
}
