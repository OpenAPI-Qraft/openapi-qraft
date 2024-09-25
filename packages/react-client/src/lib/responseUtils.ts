import type { RequestFnResponse } from '@openapi-qraft/tanstack-query-react-types';

/**
 * Processes the response from the server.
 * @beta
 */
export async function processResponse<TData, TError>(
  response: Response
): Promise<RequestFnResponse<TData, TError>> {
  if (response.status === 204 || response.headers.get('Content-Length') === '0')
    return (
      response.ok ? { data: {}, response } : { error: {}, response }
    ) as RequestFnResponse<TData, TError>;

  if (isJsonResponse(response)) {
    // clone response before parsing every time to allow multiple reads
    const jsonResponse = response.clone().json();
    return resolveResponse(
      response,
      response.ok ? jsonResponse : Promise.reject(await jsonResponse)
    );
  }

  const jsonResponse = new Promise<TData>((resolve, reject) =>
    // attempt to parse JSON for successful responses, otherwise fail
    response.clone().text().then(JSON.parse).then(resolve, reject)
  );

  return resolveResponse(
    response,
    response.ok ? jsonResponse : Promise.reject(await jsonResponse)
  );
}

/**
 * Resolves the response from the server.
 * @beta
 */
export function resolveResponse<TData, TError>(
  error: Error
): Promise<RequestFnResponse<TData, TError>>;
export function resolveResponse<TData, TError>(
  responseToReturn: Response,
  responsePromise: Promise<TData>
): Promise<RequestFnResponse<TData, TError>>;
export function resolveResponse<TData, TError>(
  responseToReturn: Response | Error,
  responsePromise?: Promise<TData>
): Promise<RequestFnResponse<TData, TError>> {
  if (!responsePromise)
    return Promise.reject({
      error: responseToReturn,
      response: undefined,
      data: undefined,
    });

  return responsePromise
    .then(
      (data) =>
        ({ data, response: responseToReturn }) as RequestFnResponse<
          TData,
          TError
        >
    )
    .catch(
      (error) =>
        ({ error, response: responseToReturn }) as RequestFnResponse<
          TData,
          TError
        >
    );
}

function isJsonResponse(response: Response) {
  const contentType = response.headers.get('Content-Type')?.toLowerCase();
  return contentType?.includes('/json') || contentType?.includes('+json');
}
