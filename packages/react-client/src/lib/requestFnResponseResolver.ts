import { RequestFnResponse } from './requestFn.js';

export function requestFnResponseResolver<TData, TError>(
  requestFnResponse: RequestFnResponse<TData, TError>
): TData | undefined {
  if ('error' in requestFnResponse) throw requestFnResponse.error;
  return requestFnResponse.data;
}
