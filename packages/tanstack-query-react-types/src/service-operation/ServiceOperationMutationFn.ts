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
  (
    options: ServiceOperationMutationFnOptions<TBody, TMutationParams>,
    client?: (
      schema: TSchema,
      options: ServiceOperationMutationFnOptions<TBody, TMutationParams>
    ) => Promise<RequestFnResponse<TMutationData, TError>>
  ): Promise<RequestFnResponse<TMutationData, TError>>;
}
