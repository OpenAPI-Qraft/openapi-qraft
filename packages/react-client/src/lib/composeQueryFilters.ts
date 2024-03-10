import { composeQueryKey } from './composeQueryKey.js';
import type { OperationRequestSchema } from './request.js';

/**
 * Replaces the `parameters` field in the filters with a `queryKey` field based on the schema.
 * If no filters are provided, a `queryKey` will be composed schema's base query key.
 * @param schema
 * @param filters
 */
export function composeQueryFilters<Filters extends object>(
  schema: OperationRequestSchema,
  filters: Filters | undefined
) {
  if (!filters) {
    return {
      queryKey: composeQueryKey(schema, undefined),
    };
  }

  if (filters && 'queryKey' in filters && 'parameters' in filters) {
    throw new Error(
      `'composeQueryFilters': 'queryKey' and 'parameters' cannot be used together`
    );
  }

  if ('queryKey' in filters) {
    return filters;
  }

  if ('parameters' in filters) {
    const { parameters, ...filtersWithoutParameters } = filters;

    Object.assign(filtersWithoutParameters, {
      queryKey: composeQueryKey(schema, parameters),
    });

    return filtersWithoutParameters;
  }

  return {
    ...filters,
    queryKey: composeQueryKey(schema, undefined),
  };
}
