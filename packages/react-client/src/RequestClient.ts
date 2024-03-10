import type {
  OperationRequestInfo,
  OperationRequestSchema,
  RequestOptions,
} from './lib/request.js';

export type RequestClient<T> = (
  options: RequestOptions,
  requestSchema: OperationRequestSchema,
  requestInfo: OperationRequestInfo
) => Promise<T>;
