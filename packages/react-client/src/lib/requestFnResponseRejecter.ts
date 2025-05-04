import type { RequestFnResponse } from './requestFn.js';

export function requestFnResponseRejecter<TData, TError>(
  requestFnResponseOrError: RequestFnResponse<TData, TError> | Error
): TData | undefined {
  if (requestFnResponseOrError instanceof Error) throw requestFnResponseOrError;
  if ('error' in requestFnResponseOrError) throw requestFnResponseOrError.error;
  throw new Error('Unhandled `requestFn` response', {
    cause: requestFnResponseOrError,
  });
}
