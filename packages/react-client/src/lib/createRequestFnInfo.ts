import type { RequestFnInfo } from '@openapi-qraft/tanstack-query-react-types';
import type { QueryFunctionContext } from '@tanstack/react-query';

export function createQueryRequestFnInfo(
  context: QueryFunctionContext,
  requestInfo: Omit<RequestFnInfo, 'signal'>
): RequestFnInfo {
  return Object.defineProperty(
    {
      ...requestInfo,
    } satisfies Omit<RequestFnInfo, 'signal'>,
    'signal',
    {
      enumerable: true,
      get: () => context.signal,
    }
  );
}
