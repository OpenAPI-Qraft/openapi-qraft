import type {
  IsMutatingMutationFilters,
  OperationError,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationIsMutatingQueries<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TMutationParams,
  TError,
> {
  isMutating<TContext = unknown>(
    filters?: IsMutatingMutationFilters<
      TSchema,
      TBody,
      TMutationData,
      TMutationParams,
      OperationError<TError>,
      TContext
    >
  ): number;
}
