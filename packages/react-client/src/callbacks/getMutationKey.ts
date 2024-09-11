import type {
  OperationSchema,
  ServiceOperationUseMutation,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import { composeMutationKey } from '../lib/composeMutationKey.js';

export const getMutationKey = (
  _qraftOptions: CreateAPIBasicClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseMutation<
      OperationSchema,
      unknown,
      unknown,
      unknown,
      DefaultError
    >['getMutationKey']
  >
) => {
  return composeMutationKey(schema, args[0]);
};
