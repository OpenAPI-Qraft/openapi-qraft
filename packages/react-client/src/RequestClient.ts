import type {
  APIOperationRequestInfo,
  APIOperationSchema,
  RequestOptions,
} from './lib/request.js';

export type RequestClient<T> = (
  options: RequestOptions,
  requestSchema: APIOperationSchema,
  requestInfo: APIOperationRequestInfo
) => Promise<T>;

export type RequestSchema = {
  url: string;
  method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';
  mediaType?: string;
};
