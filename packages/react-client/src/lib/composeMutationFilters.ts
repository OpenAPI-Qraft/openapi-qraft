import { composeMutationKey } from './composeMutationKey.js';
import type { OperationSchema } from './requestFn.js';

/**
 * Replaces the `parameters` field in the filters with a `mutationKey` field based on the schema.
 * If no filters are provided, a `mutationKey` will be composed schema's base query key.
 * @param schema
 * @param filters
 */
export function composeMutationFilters<Filters extends object>(
  schema: OperationSchema,
  filters: Filters | undefined
) {
  if (!filters) {
    return {
      mutationKey: composeMutationKey(schema, undefined),
    };
  }

  if (filters && 'mutationKey' in filters && 'parameters' in filters) {
    throw new Error(
      `'composeMutationFilters': 'mutationKey' and 'parameters' cannot be used together`
    );
  }

  if ('mutationKey' in filters) {
    return filters;
  }

  if ('parameters' in filters) {
    const { parameters, ...filtersWithoutParameters } = filters;

    Object.assign(filtersWithoutParameters, {
      mutationKey: composeMutationKey(schema, parameters),
    });

    return filtersWithoutParameters;
  }

  return {
    ...filters,
    mutationKey: composeMutationKey(schema, undefined),
  };
}
