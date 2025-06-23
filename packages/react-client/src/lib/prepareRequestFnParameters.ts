import { shelfMerge } from './shelfMerge.js';

/**
 * Prepares parameters and body for requestFn calls, handling infinite query logic
 * @param queryParams - The query parameters that may contain body
 * @param pageParam - The page parameter for infinite queries
 * @param infinite - Whether this is for an infinite query
 * @returns Object with prepared parameters and body
 */
export function prepareRequestFnParameters<TQueryParams>(
  queryParams: TQueryParams,
  pageParam: unknown,
  infinite: boolean
): {
  parameters: TQueryParams extends { body: any }
    ? Omit<TQueryParams, 'body'>
    : TQueryParams;
  body: BodyInit | undefined;
} {
  const { body, ...parameters } = queryParams as {
    body?: BodyInit;
  } & TQueryParams;

  if (!infinite) {
    return {
      parameters: parameters as never,
      body: body as never,
    };
  }

  // Handle infinite query parameters
  const processedParameters = shelfMerge(
    2,
    parameters,
    omitBodyFromPageParam(pageParam)
  ) as never;

  const processedBody = mergeBodyWithPageParam(body, pageParam) as never;

  return {
    parameters: processedParameters,
    body: processedBody,
  };
}

/**
 * Remove body from pageParam if it exists
 */
function omitBodyFromPageParam(pageParam: unknown) {
  if (pageParam && typeof pageParam === 'object' && 'body' in pageParam) {
    const { body: _body, ...pageParameters } = pageParam;
    return pageParameters;
  }

  return pageParam;
}

/**
 * Merge body with pageParam.body if pageParam contains body
 */
function mergeBodyWithPageParam(
  body: BodyInit | undefined,
  pageParam: unknown
): BodyInit | undefined {
  if (pageParam && typeof pageParam === 'object' && 'body' in pageParam) {
    return shelfMerge(1, body, pageParam.body) as BodyInit;
  }

  return body;
}
