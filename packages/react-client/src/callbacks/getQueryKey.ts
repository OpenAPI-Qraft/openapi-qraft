import type {
  OperationSchema,
  ServiceOperationUseQuery,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import { composeQueryKey } from '../lib/composeQueryKey.js';

export const getQueryKey = (
  _qraftOptions: CreateAPIBasicClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseQuery<
      OperationSchema,
      unknown,
      unknown,
      DefaultError
    >['getQueryKey']
  >
) => {
  return composeQueryKey(schema, args[0]);
};
