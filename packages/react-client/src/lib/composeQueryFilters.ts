import { composeBaseQueryKey } from './composeBaseQueryKey.js';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import type { OperationSchema } from './requestFn.js';

/**
 * Replaces the `parameters` field in the filters with a `queryKey` field based on the schema.
 * If no filters are provided, a `queryKey` will be composed schema's base query key.
 * @param schema
 * @param filters
 */
export function composeQueryFilters<
  Filters extends {
    infinite: boolean;
    parameters?: object;
  } & Record<string, unknown>,
>(schema: OperationSchema, filters: Filters | undefined) {
  if (!filters) {
    return {
      queryKey: composeBaseQueryKey(schema, undefined, undefined),
    };
  }

  if ('queryKey' in filters && 'parameters' in filters) {
    throw new Error(
      `'composeQueryFilters': 'queryKey' and 'parameters' cannot be used together`
    );
  }

  const { infinite, parameters, ...filtersRest } = filters;

  if ('queryKey' in filtersRest) {
    return filtersRest;
  }

  if (parameters) {
    Object.assign(filtersRest, {
      queryKey: infinite
        ? composeInfiniteQueryKey(schema, parameters)
        : composeQueryKey(schema, parameters),
    });

    return filtersRest;
  }

  return {
    ...filtersRest,
    queryKey: infinite
      ? composeInfiniteQueryKey(schema, undefined)
      : composeQueryKey(schema, undefined),
  };
}
