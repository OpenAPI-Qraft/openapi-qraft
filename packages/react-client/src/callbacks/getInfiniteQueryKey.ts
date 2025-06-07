import type {
  OperationSchema,
  ServiceOperationUseInfiniteQuery,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';

export const getInfiniteQueryKey = (
  _qraftOptions: CreateAPIBasicClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseInfiniteQuery<
      OperationSchema,
      unknown,
      unknown,
      DefaultError
    >['getInfiniteQueryKey']
  >
) => {
  return composeInfiniteQueryKey(schema, args[0]);
};
