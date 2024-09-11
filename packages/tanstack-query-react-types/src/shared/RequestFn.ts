export interface RequestFn<TData, TError> {
  (
    schema: OperationSchema,
    requestInfo: RequestFnInfo,
    options?: RequestFnOptions
  ): Promise<RequestFnResponse<TData, TError>>;
}

export interface OperationSchema {
  /**
   * Operation path
   * @example /user/{id}
   */
  readonly url: string; //todo::rename to `path`

  /**
   * Operation method
   */
  readonly method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';

  /**
   * Media type of the request body
   * @example application/json
   */
  readonly mediaType?: string;

  readonly security?: string[];
}

export interface RequestFnInfo
  extends RequestFnPayload,
    Omit<RequestInit, 'headers' | 'method' | 'body' | 'signal'> {
  /**
   * Request headers
   * @example { 'X-Auth': '123' }
   */
  readonly headers?: HeadersOptions;
}

export interface RequestFnPayload {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;

  /**
   * OpenAPI parameters
   * @example
   * ```ts
   * { path: {id: 1}, query: {search: 'hello'} }
   * ```
   */
  readonly parameters?: {
    readonly path?: Record<string, any>;
    readonly header?: Record<string, any>;
    readonly query?: Record<string, any>;
  };

  /**
   * Request body
   * @example { name: 'John' }
   */
  readonly body?: BodyInit | Record<string, unknown> | null;

  /**
   * Tanstack Query Meta
   */
  meta?: Record<string, unknown>;

  /** An AbortSignal to set request's signal. */
  signal?: AbortSignal | null;
}

export type RequestFnResponse<TData, TError> =
  | {
      data: TData;
      response: Response;
      error?: undefined;
    }
  | {
      // server error
      data?: undefined;
      response: Response;
      error: TError | Error;
    }
  | {
      // network error
      data?: undefined;
      response?: undefined;
      error: Error;
    };

export interface RequestFnOptions {
  urlSerializer?: UrlSerializer;
  bodySerializer?: BodySerializer;
  fetch?: typeof fetch;
}

type BodySerializer = (
  schema: OperationSchema,
  info: RequestFnPayload
) => string | FormData | Blob | undefined;

type UrlSerializer = (
  schema: OperationSchema,
  info: RequestFnPayload
) => string;

// To have definitely typed headers without a conversion to stings
export type HeadersOptions =
  | HeadersInit
  | Record<string, string | number | boolean | null | undefined>;
