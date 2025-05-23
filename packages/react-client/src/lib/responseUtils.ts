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
      response.ok ? { data: null, response } : { error: null, response }
    ) as RequestFnResponse<TData, TError>;

  const contentType = response.headers.get('Content-Type')?.toLowerCase();

  const isJsonResponse =
    contentType?.includes('/json') || contentType?.includes('+json');

  if (isJsonResponse) {
    // clone response before parsing every time to allow multiple reads
    const jsonResponse = response.clone().json();
    return resolveResponse(
      response,
      response.ok ? jsonResponse : Promise.reject(await jsonResponse)
    );
  }

  const textResponse = response.clone().text() as Promise<TData>;

  return resolveResponse(
    response,
    response.ok ? textResponse : Promise.reject(await textResponse)
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
  if (!responsePromise) {
    if (responseToReturn instanceof Response) {
      return Promise.resolve({
        error: new Error('Unhandled response without promise to resolve'),
        response: responseToReturn,
        data: undefined,
      });
    } else {
      return Promise.resolve({
        error: responseToReturn,
        response: undefined,
        data: undefined,
      });
    }
  }

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
